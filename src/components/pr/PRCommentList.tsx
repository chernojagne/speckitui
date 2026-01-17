/**
 * PRCommentList Component
 * Displays a list of PR review comments grouped by file or thread
 */

import { useMemo } from 'react';
import { PRComment, type PRCommentData } from './PRComment';
import './PRCommentList.css';

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
      <div className="pr-comment-list-empty">
        <span className="empty-icon">💬</span>
        <span className="empty-message">{emptyMessage}</span>
      </div>
    );
  }

  if (groupedComments) {
    return (
      <div className="pr-comment-list grouped">
        {Array.from(groupedComments.groups.entries()).map(([filePath, fileComments]) => (
          <div key={filePath} className="pr-comment-group">
            <div className="pr-comment-group-header">
              <span className="file-icon">📄</span>
              <span className="file-path">{filePath}</span>
              <span className="comment-count">{fileComments.length}</span>
            </div>
            <div className="pr-comment-group-body">
              {fileComments.map((comment) => (
                <PRComment key={comment.id} comment={comment} showFileContext={false} />
              ))}
            </div>
          </div>
        ))}
        
        {groupedComments.noFile.length > 0 && (
          <div className="pr-comment-group">
            <div className="pr-comment-group-header">
              <span className="file-icon">💬</span>
              <span className="file-path">General Comments</span>
              <span className="comment-count">{groupedComments.noFile.length}</span>
            </div>
            <div className="pr-comment-group-body">
              {groupedComments.noFile.map((comment) => (
                <PRComment key={comment.id} comment={comment} showFileContext={false} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="pr-comment-list">
      {comments.map((comment) => (
        <PRComment key={comment.id} comment={comment} />
      ))}
    </div>
  );
}
