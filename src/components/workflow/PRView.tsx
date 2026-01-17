import { useState, useEffect } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import { getPullRequests, getPRComments, checkGitHubAuth } from '@/services/tauriCommands';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { EmptyState } from '../shared/EmptyState';
import { Table, LayoutGrid, Copy, Check, AlertTriangle, Lock, GitPullRequest, MessageSquare, ChevronRight, ChevronDown } from 'lucide-react';
import type { PRFeedback } from '@/types';

interface PRWithComments extends PRFeedback {
  fetchedComments?: { id: number; author: string; body: string; path?: string; line?: number }[];
}

export function PRView() {
  const { project } = useProjectStore();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pullRequests, setPullRequests] = useState<PRWithComments[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');
  const [expandedPR, setExpandedPR] = useState<number | null>(null);
  const [loadingComments, setLoadingComments] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!project) return;

    const loadPRs = async () => {
      setLoading(true);
      setError(null);

      try {
        // Check GitHub auth first
        const authStatus = await checkGitHubAuth();
        setIsAuthenticated(authStatus.isAuthenticated);

        if (authStatus.isAuthenticated) {
          const prs = await getPullRequests(project.path);
          setPullRequests(prs);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    loadPRs();
  }, [project]);

  const loadCommentsForPR = async (prNumber: number) => {
    if (!project) return;
    
    setLoadingComments(prNumber);
    try {
      const comments = await getPRComments(project.path, prNumber);
      setPullRequests(prev => prev.map(pr => 
        pr.number === prNumber ? { ...pr, fetchedComments: comments } : pr
      ));
      setExpandedPR(prNumber);
    } catch (err) {
      console.error('Failed to load comments:', err);
    } finally {
      setLoadingComments(null);
    }
  };

  const togglePRExpand = (prNumber: number) => {
    if (expandedPR === prNumber) {
      setExpandedPR(null);
    } else {
      const pr = pullRequests.find(p => p.number === prNumber);
      if (pr?.fetchedComments) {
        setExpandedPR(prNumber);
      } else {
        loadCommentsForPR(prNumber);
      }
    }
  };

  const generateMarkdownSummary = () => {
    let md = `# Pull Requests Summary\n\n`;
    md += `| # | Title | State | Author | Branch |\n`;
    md += `|---|-------|-------|--------|--------|\n`;
    
    pullRequests.forEach(pr => {
      md += `| #${pr.number} | ${pr.title} | ${pr.state} | ${pr.author} | ${pr.branch || 'N/A'} |\n`;
    });

    // Add detailed comments section for expanded PRs
    pullRequests.forEach(pr => {
      if (pr.fetchedComments && pr.fetchedComments.length > 0) {
        md += `\n## PR #${pr.number}: ${pr.title}\n\n`;
        md += `### Review Comments\n\n`;
        pr.fetchedComments.forEach(comment => {
          const location = comment.path ? `\`${comment.path}${comment.line ? `:${comment.line}` : ''}\`` : 'General';
          md += `- **${comment.author}** (${location}):\n  > ${comment.body.replace(/\n/g, '\n  > ')}\n\n`;
        });
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

  if (loading) {
    return <LoadingSpinner message="Loading pull requests..." />;
  }

  if (error) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="GitHub Error"
        description={error}
      />
    );
  }

  if (!isAuthenticated) {
    return (
      <EmptyState
        icon={Lock}
        title="GitHub Authentication Required"
        description="Please authenticate with GitHub to view pull requests."
        hint="Run: gh auth login"
      />
    );
  }

  if (pullRequests.length === 0) {
    return (
      <EmptyState
        icon={GitPullRequest}
        title="No Pull Requests"
        description="There are no open pull requests for this repository."
      />
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 bg-card border-b border-border">
        <h3 className="text-sm font-semibold m-0">Pull Requests</h3>
        <span className="px-2 py-0.5 bg-primary text-white text-xs font-semibold rounded-sm">{pullRequests.length}</span>
        
        {/* View toggle */}
        <div className="flex gap-1 ml-4">
          <button
            className={`py-1 px-2 text-xs border border-border rounded-sm transition-all flex items-center gap-1 ${viewMode === 'table' ? 'bg-primary border-primary text-white' : 'text-muted-foreground bg-background hover:bg-muted'}`}
            onClick={() => setViewMode('table')}
          >
            <Table className="h-3 w-3" /> Table
          </button>
          <button
            className={`py-1 px-2 text-xs border border-border rounded-sm transition-all flex items-center gap-1 ${viewMode === 'cards' ? 'bg-primary border-primary text-white' : 'text-muted-foreground bg-background hover:bg-muted'}`}
            onClick={() => setViewMode('cards')}
          >
            <LayoutGrid className="h-3 w-3" /> Cards
          </button>
        </div>

        {/* Copy button */}
        <button
          className="ml-auto py-1 px-3 text-xs border border-border rounded-sm bg-background hover:bg-muted text-foreground transition-all flex items-center gap-1"
          onClick={copyToClipboard}
        >
          {copied ? <><Check className="h-3 w-3" /> Copied!</> : <><Copy className="h-3 w-3" /> Copy Summary</>}
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
                  <th className="text-left p-2 font-semibold text-muted-foreground">Author</th>
                  <th className="text-left p-2 font-semibold text-muted-foreground">Branch</th>
                  <th className="text-left p-2 font-semibold text-muted-foreground">Comments</th>
                </tr>
              </thead>
              <tbody>
                {pullRequests.map((pr) => (
                  <>
                    <tr 
                      key={pr.number} 
                      className="border-b border-border hover:bg-muted/30 cursor-pointer transition-colors"
                      onClick={() => togglePRExpand(pr.number)}
                    >
                      <td className="p-2 font-mono text-muted-foreground">#{pr.number}</td>
                      <td className="p-2 font-medium text-foreground max-w-md truncate">{pr.title}</td>
                      <td className="p-2">
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-sm capitalize ${pr.state === 'open' ? 'bg-success text-white' : pr.state === 'merged' ? 'bg-[#6f42c1] text-white' : 'bg-destructive text-white'}`}>
                          {pr.state}
                        </span>
                      </td>
                      <td className="p-2 text-muted-foreground">{pr.author}</td>
                      <td className="p-2 font-mono text-xs text-muted-foreground">{pr.branch || '-'}</td>
                      <td className="p-2 text-muted-foreground">
                        {loadingComments === pr.number ? (
                          <span className="animate-pulse">Loading...</span>
                        ) : pr.fetchedComments ? (
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3.5 w-3.5" /> {pr.fetchedComments.length}
                            {expandedPR === pr.number ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">Click to load</span>
                        )}
                      </td>
                    </tr>
                    {/* Expanded comments row */}
                    {expandedPR === pr.number && pr.fetchedComments && pr.fetchedComments.length > 0 && (
                      <tr key={`${pr.number}-comments`}>
                        <td colSpan={6} className="p-0">
                          <div className="bg-muted/20 p-4 border-l-4 border-primary">
                            <h4 className="text-sm font-semibold mb-3 text-foreground">Review Comments</h4>
                            <div className="space-y-3">
                              {pr.fetchedComments.map((comment) => (
                                <div key={comment.id} className="bg-card p-3 rounded-md border border-border">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="font-semibold text-sm text-foreground">{comment.author}</span>
                                    {comment.path && (
                                      <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                                        {comment.path}{comment.line ? `:${comment.line}` : ''}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{comment.body}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                    {expandedPR === pr.number && pr.fetchedComments && pr.fetchedComments.length === 0 && (
                      <tr key={`${pr.number}-no-comments`}>
                        <td colSpan={6} className="p-0">
                          <div className="bg-muted/20 p-4 border-l-4 border-muted text-center text-muted-foreground text-sm">
                            No review comments on this PR
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <ul className="list-none space-y-2">
            {pullRequests.map((pr) => (
              <li key={pr.number} className="p-4 bg-card border border-border rounded-md transition-all cursor-pointer hover:border-primary hover:shadow-md">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-sm text-muted-foreground">#{pr.number}</span>
                  <span className="flex-1 font-medium text-foreground overflow-hidden text-ellipsis whitespace-nowrap">{pr.title}</span>
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-sm capitalize ${pr.state === 'open' ? 'bg-success text-white' : pr.state === 'merged' ? 'bg-[#6f42c1] text-white' : pr.state === 'closed' ? 'bg-destructive text-white' : 'bg-muted-foreground text-white'}`}>{pr.state}</span>
                </div>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>by {pr.author}</span>
                  {pr.comments && pr.comments.length > 0 && (
                    <span className="text-muted-foreground flex items-center gap-1">
                      <MessageSquare className="h-3.5 w-3.5" /> {pr.comments.length} comments
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
