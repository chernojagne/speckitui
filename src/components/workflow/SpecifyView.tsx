import { useState, useEffect, useCallback } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import { readArtifact, updateCheckbox } from '@/services/tauriCommands';
import { TabContainer } from '../shared/TabContainer';
import { MarkdownRenderer } from '../shared/MarkdownRenderer';
import { MarkdownEditor } from '../shared/MarkdownEditor';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { EmptyState } from '../shared/EmptyState';
import { useMarkdownEditor } from '@/hooks/useMarkdownEditor';
import { useArtifactWatcher } from '@/hooks/useFileWatcher';
import { Button } from '@/components/ui/button';
import { AlertTriangle, FileText, Pencil } from 'lucide-react';

export function SpecifyView() {
  const { activeSpec } = useProjectStore();
  const [specContent, setSpecContent] = useState<string | null>(null);
  const [checklistContents, setChecklistContents] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTabId, setActiveTabId] = useState<string>('spec');
  const [pendingEditTabId, setPendingEditTabId] = useState<string | null>(null);

  // Determine the active file path based on selected tab
  const getActiveFilePath = useCallback((): string => {
    if (!activeSpec) return '';
    if (activeTabId === 'spec') {
      return `${activeSpec.path}/spec.md`;
    }
    // Handle checklist tabs (format: checklist-filename)
    if (activeTabId.startsWith('checklist-')) {
      const filename = activeTabId.replace('checklist-', '');
      return `${activeSpec.path}/checklists/${filename}`;
    }
    return '';
  }, [activeSpec, activeTabId]);

  const activeFilePath = getActiveFilePath();

  // Get the content for the active tab
  const getActiveContent = useCallback((): string | undefined => {
    if (activeTabId === 'spec') {
      return specContent ?? undefined;
    }
    if (activeTabId.startsWith('checklist-')) {
      const filename = activeTabId.replace('checklist-', '');
      return checklistContents[filename] ?? undefined;
    }
    return undefined;
  }, [activeTabId, specContent, checklistContents]);

  const editor = useMarkdownEditor({
    artifactId: activeTabId,
    filePath: activeFilePath,
    initialContent: getActiveContent(),
  });

  // When pendingEditTabId matches activeTabId and we have content, start editing
  useEffect(() => {
    if (pendingEditTabId && pendingEditTabId === activeTabId && !editor.isEditing) {
      const content = getActiveContent();
      if (content !== undefined) {
        editor.startEditing();
        setPendingEditTabId(null);
      }
    }
  }, [pendingEditTabId, activeTabId, editor.isEditing, getActiveContent]);

  // File watcher for external changes
  const handleExternalChange = useCallback((changedPath: string, _kind: 'create' | 'modify' | 'delete' | 'rename') => {
    if (!editor.isEditing && activeSpec) {
      if (changedPath.includes('spec.md') || changedPath.includes('checklists/')) {
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
      // Load spec.md if it exists
      if (activeSpec.artifacts.hasSpec) {
        const specPath = `${activeSpec.path}/spec.md`;
        const result = await readArtifact(specPath);
        setSpecContent(result.content);
      } else {
        setSpecContent(null);
      }

      // Load checklists
      const checklists: Record<string, string> = {};
      for (const checklistFile of activeSpec.artifacts.checklistFiles) {
        const checklistPath = `${activeSpec.path}/checklists/${checklistFile}`;
        try {
          const result = await readArtifact(checklistPath);
          checklists[checklistFile] = result.content;
        } catch (err) {
          console.warn(`Failed to load checklist ${checklistFile}:`, err);
        }
      }
      setChecklistContents(checklists);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArtifacts();
  }, [activeSpec]);

  // Handle checklist checkbox toggle
  const handleCheckboxToggle = async (filePath: string, lineNumber: number, checked: boolean) => {
    if (editor.isEditing) return;
    
    try {
      await updateCheckbox({ filePath, lineNumber, checked });
      // Reload content after update
      await loadArtifacts();
    } catch (err) {
      console.error('Failed to update checkbox:', err);
    }
  };

  // Handle tab change - check for unsaved changes
  const handleTabChange = (tabId: string) => {
    if (editor.hasUnsavedChanges) {
      // Could prompt here, but for now just warn
      console.warn('Unsaved changes in current tab');
    }
    setActiveTabId(tabId);
    // Reset editor state when switching tabs
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

  if (loading) {
    return <LoadingSpinner message="Loading spec artifacts..." />;
  }

  if (error) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Error Loading Spec"
        description={error}
      />
    );
  }

  if (!specContent && Object.keys(checklistContents).length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No Spec Artifacts"
        description="This spec instance has no spec.md or checklists yet."
        hint="Run: specify new"
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

  // Build tabs with edit button
  const tabs = [];

  // Handler to start editing a specific tab
  const startEditingTab = (tabId: string) => {
    if (activeTabId === tabId) {
      // Already on this tab, just start editing
      editor.startEditing();
    } else {
      // Switch tab first, then pending edit will trigger in useEffect
      setPendingEditTabId(tabId);
      setActiveTabId(tabId);
    }
  };

  if (specContent) {
    tabs.push({
      id: 'spec',
      label: 'spec.md',
      content: (
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-end px-4 py-2 border-b border-border bg-card/50">
            <Button
              variant="outline"
              size="sm"
              onClick={() => startEditingTab('spec')}
              className="h-7 px-2"
            >
              <Pencil className="h-3.5 w-3.5 mr-1" />
              Edit
            </Button>
          </div>
          <div className="flex-1 overflow-auto p-6">
            <MarkdownRenderer
              content={specContent}
              filePath={`${activeSpec?.path}/spec.md`}
            />
          </div>
        </div>
      ),
    });
  }

  // Add checklist tabs with edit button
  Object.entries(checklistContents).forEach(([filename, content]) => {
    const checklistPath = `${activeSpec?.path}/checklists/${filename}`;
    const tabId = `checklist-${filename}`;
    tabs.push({
      id: tabId,
      label: filename,
      content: (
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-end px-4 py-2 border-b border-border bg-card/50">
            <Button
              variant="outline"
              size="sm"
              onClick={() => startEditingTab(tabId)}
              className="h-7 px-2"
            >
              <Pencil className="h-3.5 w-3.5 mr-1" />
              Edit
            </Button>
          </div>
          <div className="flex-1 overflow-auto p-6">
            <MarkdownRenderer
              content={content}
              filePath={checklistPath}
              onCheckboxToggle={(line, checked) => {
                handleCheckboxToggle(checklistPath, line, checked);
              }}
            />
          </div>
        </div>
      ),
    });
  });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TabContainer 
        tabs={tabs} 
        defaultTab={activeTabId}
        onTabChange={handleTabChange}
      />
    </div>
  );
}
