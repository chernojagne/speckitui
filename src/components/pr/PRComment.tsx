/**
 * PRComment Component
 * Individual PR review comment with author, body, and file context
 */

import './PRComment.css';

export interface PRCommentData {
  id: number;
  author: string;
  authorAvatarUrl?: string;
  body: string;
  createdAt: string;
  updatedAt?: string;
  path?: string;
  line?: number;
  diffHunk?: string;
  state?: 'PENDING' | 'SUBMITTED' | 'DISMISSED';
}

interface PRCommentProps {
  comment: PRCommentData;
  showFileContext?: boolean;
}

export function PRComment({ comment, showFileContext = true }: PRCommentProps) {
  const formattedDate = formatRelativeTime(comment.createdAt);

  return (
    <div className="pr-comment">
      <div className="pr-comment-header">
        <div className="pr-comment-author">
          {comment.authorAvatarUrl ? (
            <img
              src={comment.authorAvatarUrl}
              alt={comment.author}
              className="pr-comment-avatar"
            />
          ) : (
            <div className="pr-comment-avatar-placeholder">
              {comment.author.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="pr-comment-author-name">{comment.author}</span>
        </div>
        <span className="pr-comment-date">{formattedDate}</span>
      </div>

      {showFileContext && comment.path && (
        <div className="pr-comment-file-context">
          <span className="pr-comment-file-path">{comment.path}</span>
          {comment.line && (
            <span className="pr-comment-line">Line {comment.line}</span>
          )}
        </div>
      )}

      {comment.diffHunk && (
        <pre className="pr-comment-diff-hunk">
          <code>{comment.diffHunk}</code>
        </pre>
      )}

      <div className="pr-comment-body">
        {comment.body}
      </div>

      {comment.state === 'PENDING' && (
        <span className="pr-comment-pending-badge">Pending</span>
      )}
    </div>
  );
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 7) {
    return date.toLocaleDateString();
  }
  if (diffDays > 0) {
    return `${diffDays}d ago`;
  }
  if (diffHours > 0) {
    return `${diffHours}h ago`;
  }
  if (diffMins > 0) {
    return `${diffMins}m ago`;
  }
  return 'just now';
}
