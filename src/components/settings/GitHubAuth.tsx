/**
 * GitHubAuth Component
 * GitHub authentication flow UI for settings or first-use dialog
 */

import { useState } from 'react';
import { useGitHub } from '@/hooks/useGitHub';
import { checkGitHubAuth } from '@/services/tauriCommands';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import './GitHubAuth.css';

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
      if (result.authenticated) {
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
      <div className={`github-auth ${compact ? 'compact' : ''}`}>
        <LoadingSpinner message="Checking authentication..." />
      </div>
    );
  }

  const displayError = error || checkError;

  if (isAuthenticated) {
    return (
      <div className={`github-auth authenticated ${compact ? 'compact' : ''}`}>
        <div className="auth-status">
          <span className="status-icon">✅</span>
          <div className="status-info">
            <span className="status-label">Connected to GitHub</span>
            <span className="status-detail">You can access pull requests and issues</span>
          </div>
        </div>
        
        {!compact && (
          <button className="auth-btn secondary" onClick={handleCheckAuth}>
            Refresh Status
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`github-auth ${compact ? 'compact' : ''}`}>
      {displayError && (
        <div className="auth-error">
          <span>⚠️</span>
          <span>{displayError}</span>
          <button onClick={() => { clearError(); setCheckError(null); }}>✕</button>
        </div>
      )}

      <div className="auth-content">
        <div className="auth-header">
          <span className="github-icon">
            <svg viewBox="0 0 16 16" width="32" height="32" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
            </svg>
          </span>
          <h3 className="auth-title">Sign in to GitHub</h3>
        </div>

        <p className="auth-description">
          Connect your GitHub account to view pull requests, issues, and status checks.
        </p>

        <div className="auth-methods">
          <button 
            className="auth-btn primary"
            onClick={handleSignIn}
            disabled={isAuthenticating}
          >
            {isAuthenticating ? 'Connecting...' : 'Sign in with GitHub'}
          </button>

          <div className="auth-divider">
            <span>or</span>
          </div>

          <div className="cli-auth">
            <p className="cli-hint">Use GitHub CLI for authentication:</p>
            <code className="cli-command">gh auth login</code>
            <p className="cli-note">
              After running this command in your terminal, click "Check Status" to verify.
            </p>
            <button 
              className="auth-btn secondary"
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
