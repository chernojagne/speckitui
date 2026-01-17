/**
 * IssueList Component
 * Displays a list of GitHub issues with filtering
 */

import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { cn } from '@/lib/utils';

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
      <div className="list-none m-0 p-0 flex flex-col">
        <LoadingSpinner message="Loading issues..." />
      </div>
    );
  }

  if (issues.length === 0) {
    return (
      <div className="list-none m-0 p-0 flex flex-col">
        <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
          <span className="text-3xl mb-3 opacity-60">📋</span>
          <p className="m-0 text-sm">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <ul className="list-none m-0 p-0 flex flex-col">
      {issues.map((issue) => (
        <li key={issue.id}>
          <button
            className={cn(
              "flex flex-col gap-1.5 w-full px-4 py-3 bg-transparent border-none border-b border-border text-left cursor-pointer transition-colors hover:bg-accent",
              selectedIssueId === issue.id && "bg-primary/5 border-l-[3px] border-l-primary"
            )}
            onClick={() => onSelectIssue(issue)}
          >
            <div className="flex items-center gap-2">
              <span className="text-xs">
                {issue.state === 'open' ? '🟢' : '🟣'}
              </span>
              <span className="text-xs font-medium text-muted-foreground">#{issue.number}</span>
            </div>
            
            <h4 className="m-0 text-sm font-medium text-foreground leading-snug line-clamp-2">
              {issue.title}
            </h4>
            
            {issue.labels.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {issue.labels.slice(0, 3).map((label) => (
                  <span
                    key={label.name}
                    className="px-2 py-0.5 text-[11px] font-medium rounded-full whitespace-nowrap"
                    style={{ 
                      backgroundColor: `#${label.color}`,
                      color: getContrastColor(label.color)
                    }}
                  >
                    {label.name}
                  </span>
                ))}
                {issue.labels.length > 3 && (
                  <span className="px-1.5 py-0.5 text-[11px] text-muted-foreground bg-card rounded-full">
                    +{issue.labels.length - 3}
                  </span>
                )}
              </div>
            )}
            
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="font-medium">{issue.author.login}</span>
              <span className="opacity-50">•</span>
              <span>{formatRelativeTime(issue.createdAt)}</span>
              {issue.commentsCount > 0 && (
                <>
                  <span className="opacity-50">•</span>
                  <span className="flex items-center gap-1">💬 {issue.commentsCount}</span>
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
