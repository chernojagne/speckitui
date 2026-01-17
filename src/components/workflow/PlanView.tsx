import { useState, useEffect, useMemo } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import { readArtifact } from '@/services/tauriCommands';
import { TabContainer } from '../shared/TabContainer';
import { MarkdownRenderer } from '../shared/MarkdownRenderer';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { EmptyState } from '../shared/EmptyState';
import { ProgressIndicator } from '../shared/ProgressIndicator';
import { parseChecklistSections, calculateCompletionStats } from '@/services/checklistParser';

export function PlanView() {
  const { activeSpec } = useProjectStore();
  const [artifacts, setArtifacts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeSpec) return;

    const loadArtifacts = async () => {
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

    loadArtifacts();
  }, [activeSpec]);

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
        result.push({
          id: file,
          label: file,
          content: (
            <div className="p-6">
              <MarkdownRenderer
                content={artifacts[file]}
                filePath={`${activeSpec?.path}/${file}`}
              />
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
        result.push({
          id: file,
          label: shortName,
          content: (
            <div className="p-6">
              <MarkdownRenderer
                content={artifacts[file]}
                filePath={`${activeSpec?.path}/${file}`}
              />
            </div>
          ),
        });
      });

    return result;
  }, [artifacts, activeSpec?.path]);

  if (loading) {
    return <LoadingSpinner message="Loading plan artifacts..." />;
  }

  if (error) {
    return (
      <EmptyState
        icon="⚠️"
        title="Error Loading Plan"
        description={error}
      />
    );
  }

  if (tabs.length === 0) {
    return (
      <EmptyState
        icon="🗺️"
        title="No Plan Artifacts"
        description="This spec instance has no plan artifacts yet."
        hint="Run: speckit plan"
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
      <TabContainer tabs={tabs} />
    </div>
  );
}
