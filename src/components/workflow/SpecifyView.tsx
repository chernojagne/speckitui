import { useState, useEffect } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import { readArtifact } from '@/services/tauriCommands';
import { TabContainer } from '../shared/TabContainer';
import { MarkdownRenderer } from '../shared/MarkdownRenderer';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { EmptyState } from '../shared/EmptyState';

export function SpecifyView() {
  const { activeSpec } = useProjectStore();
  const [specContent, setSpecContent] = useState<string | null>(null);
  const [checklistContents, setChecklistContents] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeSpec) return;

    const loadArtifacts = async () => {
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

    loadArtifacts();
  }, [activeSpec]);

  if (loading) {
    return <LoadingSpinner message="Loading spec artifacts..." />;
  }

  if (error) {
    return (
      <EmptyState
        icon="⚠️"
        title="Error Loading Spec"
        description={error}
      />
    );
  }

  if (!specContent && Object.keys(checklistContents).length === 0) {
    return (
      <EmptyState
        icon="📋"
        title="No Spec Artifacts"
        description="This spec instance has no spec.md or checklists yet."
        hint="Run: speckit specify"
      />
    );
  }

  // Build tabs
  const tabs = [];

  if (specContent) {
    tabs.push({
      id: 'spec',
      label: 'spec.md',
      content: (
        <div className="p-6">
          <MarkdownRenderer
            content={specContent}
            filePath={`${activeSpec?.path}/spec.md`}
          />
        </div>
      ),
    });
  }

  // Add checklist tabs
  Object.entries(checklistContents).forEach(([filename, content]) => {
    tabs.push({
      id: `checklist-${filename}`,
      label: filename,
      content: (
        <div className="p-6">
          <MarkdownRenderer
            content={content}
            filePath={`${activeSpec?.path}/checklists/${filename}`}
            onCheckboxToggle={(line, checked) => {
              console.log(`Checkbox toggled: ${filename}:${line} = ${checked}`);
            }}
          />
        </div>
      ),
    });
  });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TabContainer tabs={tabs} />
    </div>
  );
}
