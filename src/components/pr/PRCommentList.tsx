/**
 * PRCommentList Component
 * Displays a list of PR review comments grouped by file or thread
 */

import { useMemo } from 'react';
import { PRComment, type PRCommentData } from './PRComment';

interface PRCommentListProps {
  comments: PRCommentData[];
  groupByFile?: boolean;
  emptyMessage?: string;
}

export function PRCommentList({
  comments,
  groupByFile = false,
  emptyMessage = 'No comments yet',
}: PRCommentListProps) {
  // Group comments by file if requested
  const groupedComments = useMemo(() => {
    if (!groupByFile) {
      return null;
    }

    const groups = new Map<string, PRCommentData[]>();
    const noFile: PRCommentData[] = [];

    comments.forEach((comment) => {
      if (comment.path) {
        const existing = groups.get(comment.path) || [];
        existing.push(comment);
        groups.set(comment.path, existing);
      } else {
        noFile.push(comment);
      }
    });

    return { groups, noFile };
  }, [comments, groupByFile]);

  if (comments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <span className="text-3xl mb-2 opacity-60">💬</span>
        <span className="text-sm text-muted-foreground">{emptyMessage}</span>
      </div>
    );
  }

  if (groupedComments) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from(groupedComments.groups.entries()).map(([filePath, fileComments]) => (
          <div key={filePath} className="border border-border rounded-md overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2.5 bg-muted border-b border-border">
              <span className="text-sm">📄</span>
              <span className="flex-1 font-mono text-[13px] font-medium text-foreground overflow-hidden text-ellipsis whitespace-nowrap">
                {filePath}
              </span>
              <span className="text-xs font-semibold px-1.5 py-0.5 bg-card rounded-full text-muted-foreground">
                {fileComments.length}
              </span>
            </div>
            <div className="p-3">
              {fileComments.map((comment) => (
                <div key={comment.id} className="border-none bg-transparent p-3 rounded-sm hover:bg-muted">
                  <PRComment comment={comment} showFileContext={false} />
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {groupedComments.noFile.length > 0 && (
          <div className="border border-border rounded-md overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2.5 bg-muted border-b border-border">
              <span className="text-sm">💬</span>
              <span className="flex-1 font-mono text-[13px] font-medium text-foreground overflow-hidden text-ellipsis whitespace-nowrap">
                General Comments
              </span>
              <span className="text-xs font-semibold px-1.5 py-0.5 bg-card rounded-full text-muted-foreground">
                {groupedComments.noFile.length}
              </span>
            </div>
            <div className="p-3">
              {groupedComments.noFile.map((comment) => (
                <div key={comment.id} className="border-none bg-transparent p-3 rounded-sm hover:bg-muted">
                  <PRComment comment={comment} showFileContext={false} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {comments.map((comment) => (
        <PRComment key={comment.id} comment={comment} />
      ))}
    </div>
  );
}
