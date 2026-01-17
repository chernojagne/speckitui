import { useState, useEffect } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import { getChangedFiles, getGitStatus } from '@/services/tauriCommands';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { EmptyState } from '../shared/EmptyState';
import type { ChangedFile, GitStatus } from '@/types';
import './WorkflowView.css';
import './PushView.css';

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
        icon="⚠️"
        title="Git Error"
        description={error}
        hint="Make sure this is a git repository."
      />
    );
  }

  if (!gitStatus) {
    return (
      <EmptyState
        icon="📤"
        title="Not a Git Repository"
        description="This project is not initialized as a git repository."
        hint="Run: git init"
      />
    );
  }

  return (
    <div className="workflow-view push-view">
      {/* Git status header */}
      <div className="git-status-header">
        <div className="branch-info">
          <span className="branch-icon">🌿</span>
          <span className="branch-name">{gitStatus.branch}</span>
          {gitStatus.ahead > 0 && (
            <span className="commit-badge ahead" title="Commits ahead of remote">
              ↑{gitStatus.ahead}
            </span>
          )}
          {gitStatus.behind > 0 && (
            <span className="commit-badge behind" title="Commits behind remote">
              ↓{gitStatus.behind}
            </span>
          )}
        </div>
        <div className="git-actions">
          <button className="git-action-btn" disabled>
            Pull
          </button>
          <button className="git-action-btn primary" disabled>
            Push
          </button>
        </div>
      </div>

      {/* Changed files */}
      <div className="changed-files-section">
        <h3 className="section-title">
          Changed Files
          <span className="file-count">{changedFiles.length}</span>
        </h3>
        {changedFiles.length === 0 ? (
          <div className="no-changes">
            <span>✓ Working tree clean</span>
          </div>
        ) : (
          <ul className="file-list">
            {changedFiles.map((file) => (
              <li key={file.path} className={`file-item status-${file.status}`}>
                <span className="file-status">{getStatusLabel(file.status)}</span>
                <span className="file-path">{file.path}</span>
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
