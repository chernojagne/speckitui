/**
 * useGitHub Hook
 * Provides GitHub API operations for pull requests and issues
 */

import { useState, useCallback, useEffect } from 'react';
import { listen, type UnlistenFn } from '@tauri-apps/api/event';
import {
  getPullRequests,
  getIssues,
} from '@/services/tauriCommands';
import type { PRFeedback, GitHubIssue } from '@/types';
import { useProjectStore } from '@/stores/projectStore';

interface NetworkStatus {
  isOnline: boolean;
  lastChecked: string;
}

interface UseGitHubReturn {
  // State
  isOnline: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Pull Requests
  pullRequests: PRFeedback[];
  loadPullRequests: () => Promise<void>;

  // Issues
  issues: GitHubIssue[];
  loadIssues: (filter?: 'all' | 'bug' | 'feature') => Promise<void>;

  // Actions
  refreshAll: () => Promise<void>;
  clearError: () => void;
}

const NETWORK_STATUS_EVENT = 'network-status';

export function useGitHub(): UseGitHubReturn {
  const project = useProjectStore((state) => state.project);
  
  // Network and auth state
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data state
  const [pullRequests, setPullRequests] = useState<PRFeedback[]>([]);
  const [issues, setIssues] = useState<GitHubIssue[]>([]);

  // Listen for network status changes from Tauri
  useEffect(() => {
    let unlisten: UnlistenFn | null = null;

    const setupListener = async () => {
      try {
        unlisten = await listen<NetworkStatus>(NETWORK_STATUS_EVENT, (event) => {
          setIsOnline(event.payload.isOnline);
        });
      } catch (err) {
        console.warn('Failed to setup network listener:', err);
      }
    };

    setupListener();

    // Also listen for browser online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      if (unlisten) {
        unlisten();
      }
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check auth status on mount
  useEffect(() => {
    // TODO: Implement actual auth check when GitHub commands are ready
    // For now, assume authenticated if we have a project with git remote
    setIsAuthenticated(!!project?.gitRemote);
  }, [project?.gitRemote]);

  /**
   * Load pull requests for the current project
   */
  const loadPullRequests = useCallback(async () => {
    if (!project || !isOnline) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const prs = await getPullRequests(project.path);
      setPullRequests(prs);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load pull requests';
      setError(message);
      setPullRequests([]);
    } finally {
      setIsLoading(false);
    }
  }, [project, isOnline]);

  /**
   * Load issues for the current project
   */
  const loadIssues = useCallback(async (filter?: 'all' | 'bug' | 'feature') => {
    if (!project || !isOnline) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let allIssues = await getIssues(project.path);

      // Apply filter
      if (filter && filter !== 'all') {
        allIssues = allIssues.filter((issue) => {
          const labels = issue.labels.map((l) => l.toLowerCase());
          if (filter === 'bug') {
            return labels.some((l) => l.includes('bug'));
          }
          if (filter === 'feature') {
            return labels.some((l) => l.includes('feature') || l.includes('enhancement'));
          }
          return true;
        });
      }

      setIssues(allIssues);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load issues';
      setError(message);
      setIssues([]);
    } finally {
      setIsLoading(false);
    }
  }, [project, isOnline]);

  /**
   * Refresh all GitHub data
   */
  const refreshAll = useCallback(async () => {
    await Promise.all([
      loadPullRequests(),
      loadIssues(),
    ]);
  }, [loadPullRequests, loadIssues]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isOnline,
    isAuthenticated,
    isLoading,
    error,
    pullRequests,
    loadPullRequests,
    issues,
    loadIssues,
    refreshAll,
    clearError,
  };
}
