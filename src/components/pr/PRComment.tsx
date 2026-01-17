/**
 * PRComment Component
 * Individual PR review comment with author, body, and file context
 */

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
    <div className="p-4 bg-card border border-border rounded-md [&+&]:mt-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {comment.authorAvatarUrl ? (
            <img
              src={comment.authorAvatarUrl}
              alt={comment.author}
              className="w-7 h-7 rounded-full object-cover"
            />
          ) : (
            <div className="w-7 h-7 rounded-full flex items-center justify-center bg-primary text-white text-xs font-semibold">
              {comment.author.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="font-semibold text-sm text-foreground">{comment.author}</span>
        </div>
        <span className="text-xs text-muted-foreground">{formattedDate}</span>
      </div>

      {showFileContext && comment.path && (
        <div className="flex items-center gap-2 mb-2 px-2 py-1.5 bg-muted rounded-sm font-mono text-xs">
          <span className="font-medium text-foreground">{comment.path}</span>
          {comment.line && (
            <span className="text-muted-foreground before:content-['•'] before:mr-2">Line {comment.line}</span>
          )}
        </div>
      )}

      {comment.diffHunk && (
        <pre className="my-2 p-2 bg-muted rounded-sm overflow-x-auto text-xs">
          <code className="text-muted-foreground whitespace-pre">{comment.diffHunk}</code>
        </pre>
      )}

      <div className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
        {comment.body}
      </div>

      {comment.state === 'PENDING' && (
        <span className="inline-block mt-2 px-2 py-0.5 text-[11px] font-semibold uppercase bg-warning/20 text-warning rounded-full">
          Pending
        </span>
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
