import { useState, useEffect, useMemo, useCallback } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import { readArtifact } from '@/services/tauriCommands';
import { TabContainer } from '../shared/TabContainer';
import { MarkdownRenderer } from '../shared/MarkdownRenderer';
import { MarkdownEditor } from '../shared/MarkdownEditor';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { EmptyState } from '../shared/EmptyState';
import { ProgressIndicator } from '../shared/ProgressIndicator';
import { parseChecklistSections, calculateCompletionStats } from '@/services/checklistParser';
import { useMarkdownEditor } from '@/hooks/useMarkdownEditor';
import { useArtifactWatcher } from '@/hooks/useFileWatcher';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Map, Pencil } from 'lucide-react';

export function PlanView() {
  const { activeSpec } = useProjectStore();
  const [artifacts, setArtifacts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTabId, setActiveTabId] = useState<string>('plan.md');

  // Determine the active file path based on selected tab
  const getActiveFilePath = useCallback((): string => {
    if (!activeSpec) return '';
    if (activeTabId.startsWith('contracts/')) {
      return `${activeSpec.path}/${activeTabId}`;
    }
    return `${activeSpec.path}/${activeTabId}`;
  }, [activeSpec, activeTabId]);

  const activeFilePath = getActiveFilePath();

  const editor = useMarkdownEditor({
    artifactId: activeTabId,
    filePath: activeFilePath,
    initialContent: artifacts[activeTabId] ?? undefined,
  });

  // File watcher for external changes
  const handleExternalChange = useCallback((changedPath: string, _kind: 'create' | 'modify' | 'delete' | 'rename') => {
    if (!editor.isEditing && activeSpec) {
      // Check if any of our artifacts changed
      const watchedFiles = ['plan.md', 'research.md', 'data-model.md', 'quickstart.md', 'contracts/'];
      if (watchedFiles.some(f => changedPath.includes(f))) {
        loadArtifacts();
      }
    }
  }, [editor.isEditing, activeSpec]);

  useArtifactWatcher(handleExternalChange);

  const loadArtifacts = async () => {
    if (!activeSpec) return;

    setLoading(true);
    setError(null);

    try {
      const contents: Record<string, string> = {};

      // Load plan.md
      if (activeSpec.artifacts.hasPlan) {
        const result = await readArtifact(`${activeSpec.path}/plan.md`);
        contents['plan.md'] = result.content;
      }

      // Load research.md
      if (activeSpec.artifacts.hasResearch) {
        const result = await readArtifact(`${activeSpec.path}/research.md`);
        contents['research.md'] = result.content;
      }

      // Load data-model.md
      if (activeSpec.artifacts.hasDataModel) {
        const result = await readArtifact(`${activeSpec.path}/data-model.md`);
        contents['data-model.md'] = result.content;
      }

      // Load quickstart.md
      if (activeSpec.artifacts.hasQuickstart) {
        const result = await readArtifact(`${activeSpec.path}/quickstart.md`);
        contents['quickstart.md'] = result.content;
      }

      // Load contract files
      for (const contractFile of activeSpec.artifacts.contractFiles) {
        try {
          const result = await readArtifact(`${activeSpec.path}/contracts/${contractFile}`);
          contents[`contracts/${contractFile}`] = result.content;
        } catch (err) {
          console.warn(`Failed to load contract ${contractFile}:`, err);
        }
      }

      setArtifacts(contents);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArtifacts();
  }, [activeSpec]);

  // Handle tab change
  const handleTabChange = (tabId: string) => {
    if (editor.hasUnsavedChanges) {
      console.warn('Unsaved changes in current tab');
    }
    setActiveTabId(tabId);
    if (editor.isEditing) {
      editor.cancelEditing();
    }
  };

  // Handle save and reload
  const handleSave = async (): Promise<boolean> => {
    const success = await editor.saveContent();
    if (success) {
      await loadArtifacts();
    }
    return success;
  };

  // Calculate completion stats for plan.md checklists (Phase -1 Gates)
  // Must be called before early returns to comply with React hooks rules
  const planStats = useMemo(() => {
    if (artifacts['plan.md']) {
      const sections = parseChecklistSections(artifacts['plan.md']);
      return calculateCompletionStats(sections);
    }
    return null;
  }, [artifacts]);

  // Build tabs in order: plan.md, research.md, data-model.md, quickstart.md, contracts/*
  // Must be computed before early returns to comply with React hooks rules
  const tabs = useMemo(() => {
    const tabOrder = ['plan.md', 'research.md', 'data-model.md', 'quickstart.md'];
    const result: Array<{ id: string; label: string; content: React.ReactNode }> = [];

    for (const file of tabOrder) {
      if (artifacts[file]) {
        const filePath = `${activeSpec?.path}/${file}`;
        result.push({
          id: file,
          label: file,
          content: (
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-end px-4 py-2 border-b border-border bg-card/50">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={editor.startEditing}
                  className="h-7 px-2"
                >
                  <Pencil className="h-3.5 w-3.5 mr-1" />
                  Edit
                </Button>
              </div>
              <div className="flex-1 overflow-auto p-6">
                <MarkdownRenderer
                  content={artifacts[file]}
                  filePath={filePath}
                />
              </div>
            </div>
          ),
        });
      }
    }

    // Add contract tabs
    Object.keys(artifacts)
      .filter((key) => key.startsWith('contracts/'))
      .sort()
      .forEach((file) => {
        const shortName = file.replace('contracts/', '');
        const filePath = `${activeSpec?.path}/${file}`;
        result.push({
          id: file,
          label: shortName,
          content: (
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-end px-4 py-2 border-b border-border bg-card/50">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={editor.startEditing}
                  className="h-7 px-2"
                >
                  <Pencil className="h-3.5 w-3.5 mr-1" />
                  Edit
                </Button>
              </div>
              <div className="flex-1 overflow-auto p-6">
                <MarkdownRenderer
                  content={artifacts[file]}
                  filePath={filePath}
                />
              </div>
            </div>
          ),
        });
      });

    return result;
  }, [artifacts, activeSpec?.path, editor.startEditing]);

  if (loading) {
    return <LoadingSpinner message="Loading plan artifacts..." />;
  }

  if (error) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Error Loading Plan"
        description={error}
      />
    );
  }

  if (tabs.length === 0) {
    return (
      <EmptyState
        icon={Map}
        title="No Plan Artifacts"
        description="This spec instance has no plan artifacts yet."
        hint="Run: speckit plan"
      />
    );
  }

  // If in edit mode, show the editor full-screen
  if (editor.isEditing) {
    return (
      <MarkdownEditor
        content={editor.content}
        isEditing={editor.isEditing}
        hasUnsavedChanges={editor.hasUnsavedChanges}
        isSaving={editor.isSaving}
        error={editor.error}
        filePath={activeFilePath}
        onStartEditing={editor.startEditing}
        onCancelEditing={editor.cancelEditing}
        onContentChange={editor.updateContent}
        onSave={handleSave}
      />
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {planStats && planStats.total > 0 && (
        <div className="flex items-center gap-4 px-6 py-3 border-b border-border bg-card">
          <span className="text-sm font-medium text-muted-foreground">Phase -1 Gates</span>
          <ProgressIndicator
            completed={planStats.completed}
            total={planStats.total}
            showPercentage
            size="sm"
          />
        </div>
      )}
      <TabContainer 
        tabs={tabs} 
        defaultTab={activeTabId}
        onTabChange={handleTabChange}
      />
    </div>
  );
}
