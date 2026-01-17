/**
 * IssueDetail Component
 * Displays full details of a selected GitHub issue
 */

import { MarkdownRenderer } from '@/components/shared/MarkdownRenderer';
import type { Issue } from './IssueList';
import './IssueDetail.css';

interface IssueDetailProps {
  issue: Issue;
  onClose?: () => void;
}

export function IssueDetail({ issue, onClose }: IssueDetailProps) {
  const openInGitHub = () => {
    // This would use Tauri shell to open browser
    console.log('Open issue in GitHub:', issue.number);
  };

  return (
    <div className="issue-detail">
      <header className="issue-detail-header">
        <div className="issue-detail-title-row">
          <span className={`issue-state-badge ${issue.state}`}>
            {issue.state === 'open' ? '🟢 Open' : '🟣 Closed'}
          </span>
          <h2 className="issue-detail-title">
            {issue.title}
            <span className="issue-detail-number">#{issue.number}</span>
          </h2>
        </div>
        
        <div className="issue-detail-actions">
          <button 
            className="action-btn" 
            onClick={openInGitHub}
            title="Open in GitHub"
          >
            ↗️ View on GitHub
          </button>
          {onClose && (
            <button 
              className="close-btn" 
              onClick={onClose}
              aria-label="Close issue detail"
            >
              ✕
            </button>
          )}
        </div>
      </header>

      <div className="issue-detail-meta">
        <div className="meta-item">
          <span className="meta-label">Author</span>
          <div className="meta-value author">
            {issue.author.avatarUrl && (
              <img 
                src={issue.author.avatarUrl} 
                alt={issue.author.login}
                className="author-avatar"
              />
            )}
            <span>{issue.author.login}</span>
          </div>
        </div>
        
        <div className="meta-item">
          <span className="meta-label">Created</span>
          <span className="meta-value">{formatDate(issue.createdAt)}</span>
        </div>
        
        <div className="meta-item">
          <span className="meta-label">Updated</span>
          <span className="meta-value">{formatDate(issue.updatedAt)}</span>
        </div>
        
        <div className="meta-item">
          <span className="meta-label">Comments</span>
          <span className="meta-value">{issue.commentsCount}</span>
        </div>
      </div>

      {issue.labels.length > 0 && (
        <div className="issue-detail-labels">
          <span className="labels-title">Labels</span>
          <div className="labels-list">
            {issue.labels.map((label) => (
              <span
                key={label.name}
                className="label-tag"
                style={{ 
                  backgroundColor: `#${label.color}`,
                  color: getContrastColor(label.color)
                }}
              >
                {label.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="issue-detail-body">
        {issue.body ? (
          <MarkdownRenderer content={issue.body} />
        ) : (
          <p className="no-description">No description provided.</p>
        )}
      </div>
    </div>
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getContrastColor(hexColor: string): string {
  const r = parseInt(hexColor.slice(0, 2), 16) / 255;
  const g = parseInt(hexColor.slice(2, 4), 16) / 255;
  const b = parseInt(hexColor.slice(4, 6), 16) / 255;
  
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}
