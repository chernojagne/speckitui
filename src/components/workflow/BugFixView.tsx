import { useState, useEffect } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import { getIssues, checkGitHubAuth } from '@/services/tauriCommands';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { EmptyState } from '../shared/EmptyState';
import { OfflineMessage } from '../shared/OfflineMessage';
import { useGitHub } from '@/hooks/useGitHub';
import type { GitHubIssue } from '@/types';

export function BugFixView() {
  const { project } = useProjectStore();
  const { isOnline, isAuthenticated: gitHubAuth } = useGitHub();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [issues, setIssues] = useState<GitHubIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'bug'>('bug');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!project || !isOnline) return;

    const loadIssues = async () => {
      setLoading(true);
      setError(null);

      try {
        // Check GitHub auth first
        const authStatus = await checkGitHubAuth();
        setIsAuthenticated(authStatus.isAuthenticated);

        if (authStatus.isAuthenticated) {
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

  const filteredIssues = issues.filter((issue) => {
    if (filter === 'bug') {
      return issue.labels.some((label) =>
        label.toLowerCase().includes('bug')
      );
    }
    return true;
  });

  const generateMarkdownSummary = () => {
    let md = `# Issues Summary\n\n`;
    md += `| # | Title | State | Labels | Author | Comments |\n`;
    md += `|---|-------|-------|--------|--------|----------|\n`;
    
    filteredIssues.forEach(issue => {
      const labels = issue.labels.join(', ') || 'None';
      md += `| #${issue.number} | ${issue.title} | ${issue.state} | ${labels} | ${issue.author} | ${issue.commentCount || 0} |\n`;
    });

    // Add issue bodies for context
    md += `\n## Issue Details\n\n`;
    filteredIssues.forEach(issue => {
      if (issue.body) {
        md += `### #${issue.number}: ${issue.title}\n\n`;
        md += `${issue.body}\n\n---\n\n`;
      }
    });

    return md;
  };

  const copyToClipboard = async () => {
    const summary = generateMarkdownSummary();
    await navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 bg-card border-b border-border">
        <h3 className="text-sm font-semibold m-0">Issues</h3>
        
        {/* Filter buttons */}
        <div className="flex gap-1">
          <button
            className={`py-1 px-2 text-xs border border-border rounded-sm transition-all ${filter === 'bug' ? 'bg-primary border-primary text-white' : 'text-muted-foreground bg-background hover:bg-muted'}`}
            onClick={() => setFilter('bug')}
          >
            🐛 Bugs
          </button>
          <button
            className={`py-1 px-2 text-xs border border-border rounded-sm transition-all ${filter === 'all' ? 'bg-primary border-primary text-white' : 'text-muted-foreground bg-background hover:bg-muted'}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
        </div>

        {/* View toggle */}
        <div className="flex gap-1 ml-2">
          <button
            className={`py-1 px-2 text-xs border border-border rounded-sm transition-all ${viewMode === 'table' ? 'bg-primary border-primary text-white' : 'text-muted-foreground bg-background hover:bg-muted'}`}
            onClick={() => setViewMode('table')}
          >
            📋 Table
          </button>
          <button
            className={`py-1 px-2 text-xs border border-border rounded-sm transition-all ${viewMode === 'cards' ? 'bg-primary border-primary text-white' : 'text-muted-foreground bg-background hover:bg-muted'}`}
            onClick={() => setViewMode('cards')}
          >
            🃏 Cards
          </button>
        </div>

        <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs font-semibold rounded-sm">{filteredIssues.length}</span>

        {/* Copy button */}
        <button
          className="ml-auto py-1 px-3 text-xs border border-border rounded-sm bg-background hover:bg-muted text-foreground transition-all flex items-center gap-1"
          onClick={copyToClipboard}
        >
          {copied ? '✓ Copied!' : '📋 Copy Summary'}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left p-2 font-semibold text-muted-foreground">#</th>
                  <th className="text-left p-2 font-semibold text-muted-foreground">Title</th>
                  <th className="text-left p-2 font-semibold text-muted-foreground">State</th>
                  <th className="text-left p-2 font-semibold text-muted-foreground">Labels</th>
                  <th className="text-left p-2 font-semibold text-muted-foreground">Author</th>
                  <th className="text-left p-2 font-semibold text-muted-foreground">💬</th>
                  <th className="text-left p-2 font-semibold text-muted-foreground">Created</th>
                </tr>
              </thead>
              <tbody>
                {filteredIssues.map((issue) => (
                  <tr 
                    key={issue.number} 
                    className="border-b border-border hover:bg-muted/30 cursor-pointer transition-colors"
                    onClick={() => window.open(issue.url, '_blank')}
                  >
                    <td className="p-2 font-mono text-muted-foreground">#{issue.number}</td>
                    <td className="p-2 font-medium text-foreground max-w-md">
                      <div className="truncate" title={issue.title}>{issue.title}</div>
                      {issue.body && (
                        <div className="text-xs text-muted-foreground mt-1 truncate max-w-md" title={issue.body}>
                          {issue.body.substring(0, 100)}...
                        </div>
                      )}
                    </td>
                    <td className="p-2">
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-sm capitalize ${issue.state === 'open' ? 'bg-success text-white' : 'bg-destructive text-white'}`}>
                        {issue.state}
                      </span>
                    </td>
                    <td className="p-2">
                      <div className="flex flex-wrap gap-1">
                        {issue.labels.slice(0, 3).map((label) => (
                          <span key={label} className="px-1.5 py-0.5 text-xs bg-muted rounded text-muted-foreground">
                            {label}
                          </span>
                        ))}
                        {issue.labels.length > 3 && (
                          <span className="px-1.5 py-0.5 text-xs text-muted-foreground">
                            +{issue.labels.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-2 text-muted-foreground">{issue.author}</td>
                    <td className="p-2 text-muted-foreground">{issue.commentCount || 0}</td>
                    <td className="p-2 text-muted-foreground text-xs">
                      {new Date(issue.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <ul className="list-none space-y-2">
            {filteredIssues.map((issue) => (
              <li key={issue.number} className="p-4 bg-card border border-border rounded-md transition-all cursor-pointer hover:border-primary hover:shadow-md">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-sm text-muted-foreground">#{issue.number}</span>
                  <span className="flex-1 font-medium text-foreground overflow-hidden text-ellipsis whitespace-nowrap">{issue.title}</span>
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {issue.labels.map((label) => (
                    <span key={label} className="px-2 py-0.5 text-xs bg-muted rounded-sm text-muted-foreground">
                      {label}
                    </span>
                  ))}
                </div>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>by {issue.author}</span>
                  <span>
                    {new Date(issue.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
