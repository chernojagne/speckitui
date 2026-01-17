import { useState, useEffect } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import { getPullRequests, checkGitHubAuth } from '@/services/tauriCommands';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { EmptyState } from '../shared/EmptyState';
import type { PRFeedback } from '@/types';
import './WorkflowView.css';
import './PRView.css';

export function PRView() {
  const { project } = useProjectStore();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pullRequests, setPullRequests] = useState<PRFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!project) return;

    const loadPRs = async () => {
      setLoading(true);
      setError(null);

      try {
        // Check GitHub auth first
        const authStatus = await checkGitHubAuth();
        setIsAuthenticated(authStatus.authenticated);

        if (authStatus.authenticated) {
          const prs = await getPullRequests(project.path);
          setPullRequests(prs);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    loadPRs();
  }, [project]);

  if (loading) {
    return <LoadingSpinner message="Loading pull requests..." />;
  }

  if (error) {
    return (
      <EmptyState
        icon="⚠️"
        title="GitHub Error"
        description={error}
      />
    );
  }

  if (!isAuthenticated) {
    return (
      <EmptyState
        icon="🔐"
        title="GitHub Authentication Required"
        description="Please authenticate with GitHub to view pull requests."
        hint="Run: gh auth login"
      />
    );
  }

  if (pullRequests.length === 0) {
    return (
      <EmptyState
        icon="🔀"
        title="No Pull Requests"
        description="There are no open pull requests for this repository."
      />
    );
  }

  return (
    <div className="workflow-view pr-view">
      <div className="pr-list-header">
        <h3>Open Pull Requests</h3>
        <span className="pr-count">{pullRequests.length}</span>
      </div>
      <ul className="pr-list">
        {pullRequests.map((pr) => (
          <li key={pr.number} className="pr-item">
            <div className="pr-header">
              <span className="pr-number">#{pr.number}</span>
              <span className="pr-title">{pr.title}</span>
              <span className={`pr-status ${pr.status}`}>{pr.status}</span>
            </div>
            <div className="pr-meta">
              <span className="pr-author">by {pr.author}</span>
              {pr.comments.length > 0 && (
                <span className="pr-comments">
                  💬 {pr.comments.length} comments
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
