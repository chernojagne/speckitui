/**
 * IssueDetail Component
 * Displays full details of a selected GitHub issue
 */

import { MarkdownRenderer } from '@/components/shared/MarkdownRenderer';
import type { Issue } from './IssueList';
import { cn } from '@/lib/utils';

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
    <div className="flex flex-col h-full overflow-hidden">
      <header className="flex justify-between items-start gap-4 p-4 border-b border-border">
        <div className="flex flex-col gap-2">
          <span className={cn(
            "inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-xl w-fit",
            issue.state === 'open' ? "bg-success/10 text-success" : "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
          )}>
            {issue.state === 'open' ? '🟢 Open' : '🟣 Closed'}
          </span>
          <h2 className="m-0 text-xl font-semibold text-foreground leading-tight">
            {issue.title}
            <span className="ml-2 text-base font-normal text-muted-foreground">#{issue.number}</span>
          </h2>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <button 
            className="flex items-center gap-1 px-3 py-1.5 text-[13px] text-foreground bg-card border border-border rounded-md cursor-pointer transition-all hover:bg-accent"
            onClick={openInGitHub}
            title="Open in GitHub"
          >
            ↗️ View on GitHub
          </button>
          {onClose && (
            <button 
              className="p-1.5 text-xl leading-none text-muted-foreground bg-transparent border-none rounded cursor-pointer transition-all hover:text-foreground hover:bg-accent"
              onClick={onClose}
              aria-label="Close issue detail"
            >
              ✕
            </button>
          )}
        </div>
      </header>

      <div className="flex flex-wrap gap-6 px-4 py-3 bg-card border-b border-border">
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] uppercase tracking-wide text-muted-foreground">Author</span>
          <div className="flex items-center gap-1.5 text-[13px] text-foreground">
            {issue.author.avatarUrl && (
              <img 
                src={issue.author.avatarUrl} 
                alt={issue.author.login}
                className="w-5 h-5 rounded-full"
              />
            )}
            <span>{issue.author.login}</span>
          </div>
        </div>
        
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] uppercase tracking-wide text-muted-foreground">Created</span>
          <span className="text-[13px] text-foreground">{formatDate(issue.createdAt)}</span>
        </div>
        
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] uppercase tracking-wide text-muted-foreground">Updated</span>
          <span className="text-[13px] text-foreground">{formatDate(issue.updatedAt)}</span>
        </div>
        
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] uppercase tracking-wide text-muted-foreground">Comments</span>
          <span className="text-[13px] text-foreground">{issue.commentsCount}</span>
        </div>
      </div>

      {issue.labels.length > 0 && (
        <div className="px-4 py-3 border-b border-border">
          <span className="block text-[11px] uppercase tracking-wide text-muted-foreground mb-2">Labels</span>
          <div className="flex flex-wrap gap-1.5">
            {issue.labels.map((label) => (
              <span
                key={label.name}
                className="px-2.5 py-1 text-xs font-medium rounded-xl"
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

      <div className="flex-1 overflow-y-auto p-4">
        {issue.body ? (
          <MarkdownRenderer content={issue.body} />
        ) : (
          <p className="text-muted-foreground italic">No description provided.</p>
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
