import { useState, useEffect } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import { getChangedFiles, getGitStatus } from '@/services/tauriCommands';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { EmptyState } from '../shared/EmptyState';
import { AlertTriangle, Upload, GitBranch } from 'lucide-react';
import type { ChangedFile, GitStatus } from '@/types';

export function PushView() {
  const { project } = useProjectStore();
  const [gitStatus, setGitStatus] = useState<GitStatus | null>(null);
  const [changedFiles, setChangedFiles] = useState<ChangedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!project) return;

    const loadGitInfo = async () => {
      setLoading(true);
      setError(null);

      try {
        const [status, files] = await Promise.all([
          getGitStatus(project.path),
          getChangedFiles(project.path),
        ]);
        setGitStatus(status);
        setChangedFiles(files);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    loadGitInfo();
  }, [project]);

  if (loading) {
    return <LoadingSpinner message="Loading git status..." />;
  }

  if (error) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Git Error"
        description={error}
        hint="Make sure this is a git repository."
      />
    );
  }

  if (!gitStatus) {
    return (
      <EmptyState
        icon={Upload}
        title="Not a Git Repository"
        description="This project is not initialized as a git repository."
        hint="Run: git init"
      />
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Git status header */}
      <div className="flex items-center justify-between p-4 bg-card border-b border-border">
        <div className="flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-muted-foreground" />
          <span className="font-mono font-semibold text-foreground">{gitStatus.branch}</span>
          {gitStatus.ahead > 0 && (
            <span className="px-1.5 py-0.5 text-xs font-semibold rounded-sm bg-success text-success-foreground" title="Commits ahead of remote">
              ↑{gitStatus.ahead}
            </span>
          )}
          {gitStatus.behind > 0 && (
            <span className="px-1.5 py-0.5 text-xs font-semibold rounded-sm bg-warning text-warning-foreground" title="Commits behind remote">
              ↓{gitStatus.behind}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button className="py-1 px-4 text-sm border border-border rounded-md bg-background text-foreground transition-all hover:bg-muted hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed" disabled>
            Pull
          </button>
          <button className="py-1 px-4 text-sm border border-primary rounded-md bg-primary text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
            Push
          </button>
        </div>
      </div>

      {/* Changed files */}
      <div className="flex-1 overflow-auto p-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
          Changed Files
          <span className="px-2 py-0.5 bg-muted rounded-sm text-xs text-muted-foreground">{changedFiles.length}</span>
        </h3>
        {changedFiles.length === 0 ? (
          <div className="flex items-center justify-center p-8 text-success text-sm">
            <span>✓ Working tree clean</span>
          </div>
        ) : (
          <ul className="list-none">
            {changedFiles.map((file) => (
              <li key={file.path} className="flex items-center gap-2 py-1 px-2 rounded-sm transition-colors hover:bg-muted">
                <span className={`w-5 h-5 flex items-center justify-center text-xs font-semibold font-mono rounded-sm ${file.status === 'added' ? 'bg-success text-success-foreground' : file.status === 'modified' ? 'bg-warning text-warning-foreground' : file.status === 'deleted' ? 'bg-destructive text-destructive-foreground' : 'bg-muted text-muted-foreground'}`}>{getStatusLabel(file.status)}</span>
                <span className="font-mono text-sm text-muted-foreground">{file.path}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'added':
      return 'A';
    case 'modified':
      return 'M';
    case 'deleted':
      return 'D';
    case 'renamed':
      return 'R';
    case 'untracked':
      return '?';
    default:
      return '?';
  }
}
