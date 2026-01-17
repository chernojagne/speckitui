/**
 * IssueList Component
 * Displays a list of GitHub issues with filtering
 */

import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import './IssueList.css';

export interface Issue {
  id: number;
  number: number;
  title: string;
  state: 'open' | 'closed';
  labels: Array<{
    name: string;
    color: string;
  }>;
  author: {
    login: string;
    avatarUrl?: string;
  };
  createdAt: string;
  updatedAt: string;
  commentsCount: number;
  body?: string;
}

interface IssueListProps {
  issues: Issue[];
  selectedIssueId?: number;
  onSelectIssue: (issue: Issue) => void;
  isLoading?: boolean;
  emptyMessage?: string;
}

export function IssueList({
  issues,
  selectedIssueId,
  onSelectIssue,
  isLoading,
  emptyMessage = 'No issues found',
}: IssueListProps) {
  if (isLoading) {
    return (
      <div className="issue-list">
        <LoadingSpinner message="Loading issues..." />
      </div>
    );
  }

  if (issues.length === 0) {
    return (
      <div className="issue-list">
        <div className="issue-list-empty">
          <span className="empty-icon">📋</span>
          <p>{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <ul className="issue-list">
      {issues.map((issue) => (
        <li key={issue.id}>
          <button
            className={`issue-item ${selectedIssueId === issue.id ? 'selected' : ''}`}
            onClick={() => onSelectIssue(issue)}
          >
            <div className="issue-header">
              <span className={`issue-state ${issue.state}`}>
                {issue.state === 'open' ? '🟢' : '🟣'}
              </span>
              <span className="issue-number">#{issue.number}</span>
            </div>
            
            <h4 className="issue-title">{issue.title}</h4>
            
            {issue.labels.length > 0 && (
              <div className="issue-labels">
                {issue.labels.slice(0, 3).map((label) => (
                  <span
                    key={label.name}
                    className="issue-label"
                    style={{ 
                      backgroundColor: `#${label.color}`,
                      color: getContrastColor(label.color)
                    }}
                  >
                    {label.name}
                  </span>
                ))}
                {issue.labels.length > 3 && (
                  <span className="issue-label-more">+{issue.labels.length - 3}</span>
                )}
              </div>
            )}
            
            <div className="issue-meta">
              <span className="issue-author">{issue.author.login}</span>
              <span className="issue-separator">•</span>
              <span className="issue-date">{formatRelativeTime(issue.createdAt)}</span>
              {issue.commentsCount > 0 && (
                <>
                  <span className="issue-separator">•</span>
                  <span className="issue-comments">💬 {issue.commentsCount}</span>
                </>
              )}
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}

function getContrastColor(hexColor: string): string {
  // Calculate relative luminance
  const r = parseInt(hexColor.slice(0, 2), 16) / 255;
  const g = parseInt(hexColor.slice(2, 4), 16) / 255;
  const b = parseInt(hexColor.slice(4, 6), 16) / 255;
  
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}
