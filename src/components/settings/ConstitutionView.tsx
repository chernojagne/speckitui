/**
 * ConstitutionView Component
 * Displays constitution.md content in settings
 */

import { useState, useEffect } from 'react';
import { MarkdownRenderer } from '@/components/shared/MarkdownRenderer';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useProjectStore } from '@/stores/projectStore';
import { readArtifact } from '@/services/tauriCommands';

export function ConstitutionView() {
  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const project = useProjectStore((state) => state.project);

  useEffect(() => {
    if (!project) {
      setContent(null);
      return;
    }

    const loadConstitution = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Try .specify/constitution.md first
        const constitutionPath = `${project.path}/.specify/constitution.md`;
        const result = await readArtifact(constitutionPath);
        setContent(result.content);
      } catch {
        // Try alternate location
        try {
          const altPath = `${project.path}/constitution.md`;
          const result = await readArtifact(altPath);
          setContent(result.content);
        } catch {
          setError('No constitution.md found in project');
          setContent(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadConstitution();
  }, [project]);

  if (!project) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <span className="text-4xl mb-4 opacity-70">📜</span>
          <p className="my-1 text-foreground">Open a project to view its constitution</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-full flex flex-col">
        <LoadingSpinner message="Loading constitution..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <span className="text-4xl mb-4 opacity-70">📜</span>
          <p className="my-1 text-foreground">{error}</p>
          <p className="mt-4 text-[13px] text-muted-foreground max-w-[300px]">
            Create a constitution.md file in your .specify/ directory to define project guidelines.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-6">
        {content && <MarkdownRenderer content={content} />}
      </div>
    </div>
  );
}
