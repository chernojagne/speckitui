/**
 * GitHubAuth Component
 * GitHub authentication flow UI for settings or first-use dialog
 */

import { useState } from 'react';
import { useGitHub } from '@/hooks/useGitHub';
import { checkGitHubAuth } from '@/services/tauriCommands';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { cn } from '@/lib/utils';

interface GitHubAuthProps {
  onComplete?: () => void;
  compact?: boolean;
}

export function GitHubAuth({ onComplete, compact = false }: GitHubAuthProps) {
  const { isAuthenticated, isLoading, error, clearError, refreshAll } = useGitHub();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [checkError, setCheckError] = useState<string | null>(null);

  const handleCheckAuth = async () => {
    setIsAuthenticating(true);
    setCheckError(null);
    
    try {
      const result = await checkGitHubAuth();
      if (result.isAuthenticated) {
        await refreshAll();
        onComplete?.();
      } else {
        setCheckError('Not authenticated. Please run "gh auth login" first.');
      }
    } catch (err) {
      setCheckError(err instanceof Error ? err.message : 'Failed to check auth status');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSignIn = async () => {
    // In a real implementation, this would open OAuth flow
    // For now, we instruct users to use CLI
    handleCheckAuth();
  };

  if (isLoading) {
    return (
      <div className={cn("p-6", compact && "p-4")}>
        <LoadingSpinner message="Checking authentication..." />
      </div>
    );
  }

  const displayError = error || checkError;

  if (isAuthenticated) {
    return (
      <div className={cn("flex items-center justify-between gap-4", compact ? "p-4" : "p-6")}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">✅</span>
          <div className="flex flex-col gap-0.5">
            <span className="text-[15px] font-medium text-foreground">Connected to GitHub</span>
            <span className="text-[13px] text-muted-foreground">You can access pull requests and issues</span>
          </div>
        </div>
        
        {!compact && (
          <button 
            className="flex items-center justify-center gap-2 px-4 py-3 text-[15px] font-medium rounded-md cursor-pointer transition-all text-foreground bg-card border border-border hover:bg-accent hover:border-border"
            onClick={handleCheckAuth}
          >
            Refresh Status
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={cn(compact ? "p-4" : "p-6")}>
      {displayError && (
        <div className="flex items-center gap-2 px-3.5 py-2.5 mb-4 bg-destructive/10 text-destructive rounded-md text-[13px]">
          <span>⚠️</span>
          <span>{displayError}</span>
          <button 
            className="ml-auto p-1 text-sm leading-none bg-transparent border-none cursor-pointer rounded hover:bg-white/20"
            onClick={() => { clearError(); setCheckError(null); }}
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div className={cn("flex items-center gap-3", compact && "gap-2")}>
          <span className="text-foreground">
            <svg viewBox="0 0 16 16" width={compact ? 24 : 32} height={compact ? 24 : 32} fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
            </svg>
          </span>
          <h3 className={cn("m-0 font-semibold text-foreground", compact ? "text-base" : "text-xl")}>{compact ? "Sign in" : "Sign in to GitHub"}</h3>
        </div>

        <p className={cn("m-0 text-muted-foreground leading-relaxed", compact ? "text-[13px]" : "text-sm")}>
          Connect your GitHub account to view pull requests, issues, and status checks.
        </p>

        <div className="flex flex-col gap-4 mt-2">
          <button 
            className="flex items-center justify-center gap-2 w-full py-3 px-4 text-[15px] font-medium rounded-md cursor-pointer transition-all text-white bg-[#24292e] border-none hover:bg-[#1b1f23] disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={handleSignIn}
            disabled={isAuthenticating}
          >
            {isAuthenticating ? 'Connecting...' : 'Sign in with GitHub'}
          </button>

          <div className="flex items-center gap-3 before:content-[''] before:flex-1 before:h-px before:bg-border after:content-[''] after:flex-1 after:h-px after:bg-border">
            <span className="text-xs text-muted-foreground uppercase">or</span>
          </div>

          <div className="flex flex-col gap-2 p-4 bg-card border border-border rounded-lg">
            <p className="m-0 text-[13px] text-muted-foreground">Use GitHub CLI for authentication:</p>
            <code className="block px-3 py-2 font-mono text-sm text-foreground bg-background border border-border rounded">
              gh auth login
            </code>
            <p className="m-0 text-xs text-muted-foreground leading-snug">
              After running this command in your terminal, click "Check Status" to verify.
            </p>
            <button 
              className="mt-2 flex items-center justify-center gap-2 w-full py-3 px-4 text-[15px] font-medium rounded-md cursor-pointer transition-all text-foreground bg-card border border-border hover:bg-accent disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={handleCheckAuth}
              disabled={isAuthenticating}
            >
              Check Status
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
