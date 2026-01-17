import { useState, useEffect } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import { getIssues, checkGitHubAuth } from '@/services/tauriCommands';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { EmptyState } from '../shared/EmptyState';
import { OfflineMessage } from '../shared/OfflineMessage';
import { useGitHub } from '@/hooks/useGitHub';
import type { GitHubIssue } from '@/types';
import './WorkflowView.css';
import './BugFixView.css';

export function BugFixView() {
  const { project } = useProjectStore();
  const { isOnline, isAuthenticated: gitHubAuth } = useGitHub();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [issues, setIssues] = useState<GitHubIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'bug'>('bug');

  useEffect(() => {
    if (!project || !isOnline) return;

    const loadIssues = async () => {
      setLoading(true);
      setError(null);

      try {
        // Check GitHub auth first
        const authStatus = await checkGitHubAuth();
        setIsAuthenticated(authStatus.authenticated);

        if (authStatus.authenticated) {
          const allIssues = await getIssues(project.path);
          setIssues(allIssues);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    loadIssues();
  }, [project, isOnline]);

  // Offline state
  if (!isOnline) {
    return (
      <OfflineMessage 
        type="offline"
        message="You're currently offline. GitHub issues require an internet connection."
      />
    );
  }

  // Authentication required
  if (!isAuthenticated && !loading && !gitHubAuth) {
    return (
      <OfflineMessage 
        type="auth-required"
        message="Please authenticate with GitHub to view and manage issues."
      />
    );
  }

  const filteredIssues = issues.filter((issue) => {
    if (filter === 'bug') {
      return issue.labels.some((label) =>
        label.toLowerCase().includes('bug')
      );
    }
    return true;
  });

  if (loading) {
    return <LoadingSpinner message="Loading issues..." />;
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

  if (issues.length === 0) {
    return (
      <EmptyState
        icon="🐛"
        title="No Issues"
        description="There are no open issues for this repository."
      />
    );
  }

  return (
    <div className="workflow-view bugfix-view">
      <div className="issue-list-header">
        <h3>Issues</h3>
        <div className="issue-filters">
          <button
            className={`filter-btn ${filter === 'bug' ? 'active' : ''}`}
            onClick={() => setFilter('bug')}
          >
            🐛 Bugs
          </button>
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
        </div>
        <span className="issue-count">{filteredIssues.length}</span>
      </div>
      <ul className="issue-list">
        {filteredIssues.map((issue) => (
          <li key={issue.number} className="issue-item">
            <div className="issue-header">
              <span className="issue-number">#{issue.number}</span>
              <span className="issue-title">{issue.title}</span>
            </div>
            <div className="issue-labels">
              {issue.labels.map((label) => (
                <span key={label} className="issue-label">
                  {label}
                </span>
              ))}
            </div>
            <div className="issue-meta">
              <span className="issue-author">by {issue.author}</span>
              <span className="issue-date">
                {new Date(issue.createdAt).toLocaleDateString()}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
