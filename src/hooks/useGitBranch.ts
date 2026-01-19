/**
 * useGitBranch Hook
 * Provides current git branch information with automatic updates
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { listen, type UnlistenFn } from '@tauri-apps/api/event';
import { getGitBranch, type GitBranchInfo } from '@/services/tauriCommands';
import { useProjectStore } from '@/stores/projectStore';

interface UseGitBranchReturn {
  /** Current branch name, null if not a git repo or detached */
  branch: string | null;
  /** Whether the HEAD is detached (not on a branch) */
  isDetached: boolean;
  /** Short commit hash when in detached HEAD state */
  commitHash: string | null;
  /** Whether the git info is still loading */
  isLoading: boolean;
  /** Error message if fetching failed */
  error: string | null;
  /** Manually refresh the branch info */
  refresh: () => Promise<void>;
}

export function useGitBranch(): UseGitBranchReturn {
  const project = useProjectStore((state) => state.project);
  const [branchInfo, setBranchInfo] = useState<GitBranchInfo>({
    branch: null,
    isDetached: false,
    commitHash: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastPathRef = useRef<string | null>(null);

  // Fetch branch info
  const fetchBranch = useCallback(async () => {
    if (!project?.path) {
      setBranchInfo({ branch: null, isDetached: false, commitHash: null });
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const info = await getGitBranch(project.path);
      setBranchInfo(info);
    } catch (err) {
      console.error('Failed to get git branch:', err);
      setError(err instanceof Error ? err.message : String(err));
      setBranchInfo({ branch: null, isDetached: false, commitHash: null });
    } finally {
      setIsLoading(false);
    }
  }, [project?.path]);

  // Initial fetch and refetch when project changes
  useEffect(() => {
    // Only refetch if path actually changed
    if (lastPathRef.current !== project?.path) {
      lastPathRef.current = project?.path ?? null;
      fetchBranch();
    }
  }, [project?.path, fetchBranch]);

  // Listen for file watcher events on .git/HEAD
  useEffect(() => {
    if (!project?.path) return;

    let unlisten: UnlistenFn | null = null;
    let cancelled = false;

    const setupListener = async () => {
      try {
        // Listen for file changes from the file watcher
        const unlistenFn = await listen<{ path: string; eventType: string }>(
          'file-changed',
          (event) => {
            // Check if the changed file is .git/HEAD
            const changedPath = event.payload.path.toLowerCase();
            if (changedPath.includes('.git') && 
                (changedPath.endsWith('head') || changedPath.endsWith('head'))) {
              // Debounce: wait a bit for git operations to complete
              setTimeout(() => {
                fetchBranch();
              }, 100);
            }
          }
        );

        if (cancelled) {
          unlistenFn();
        } else {
          unlisten = unlistenFn;
        }
      } catch (err) {
        console.warn('Failed to setup git branch file watcher:', err);
      }
    };

    setupListener();

    return () => {
      cancelled = true;
      unlisten?.();
    };
  }, [project?.path, fetchBranch]);

  // Poll as a fallback every 5 seconds (in case file watcher misses events)
  useEffect(() => {
    if (!project?.path) return;

    const interval = setInterval(() => {
      fetchBranch();
    }, 5000);

    return () => clearInterval(interval);
  }, [project?.path, fetchBranch]);

  return {
    branch: branchInfo.branch,
    isDetached: branchInfo.isDetached,
    commitHash: branchInfo.commitHash,
    isLoading,
    error,
    refresh: fetchBranch,
  };
}
