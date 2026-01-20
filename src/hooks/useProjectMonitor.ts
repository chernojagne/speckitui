/**
 * useProjectMonitor Hook
 * Monitors the project directory for initialization changes (.git, .specify)
 * and triggers refresh when they are created
 */

import { useEffect, useRef, useCallback } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import { openProject } from '@/services/tauriCommands';

interface UseProjectMonitorOptions {
  /** Polling interval in milliseconds (default: 2000) */
  intervalMs?: number;
  /** Whether monitoring is enabled (default: true when project is uninitialized) */
  enabled?: boolean;
}

interface UseProjectMonitorReturn {
  /** Manually trigger a project refresh */
  refresh: () => Promise<void>;
  /** Whether a refresh is in progress */
  isRefreshing: boolean;
}

export function useProjectMonitor({
  intervalMs = 2000,
  enabled,
}: UseProjectMonitorOptions = {}): UseProjectMonitorReturn {
  const project = useProjectStore((state) => state.project);
  const setProject = useProjectStore((state) => state.setProject);
  const isLoading = useProjectStore((state) => state.isLoading);
  
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isRefreshingRef = useRef(false);

  // Determine if we should monitor
  // Default: monitor when project exists but is uninitialized
  const shouldMonitor = enabled ?? (project && !project.hasSpecifyDir);

  // Refresh the project from disk
  const refresh = useCallback(async () => {
    if (!project?.path || isRefreshingRef.current) return;

    isRefreshingRef.current = true;
    
    try {
      const updatedProject = await openProject(project.path);
      setProject(updatedProject);
    } catch (err) {
      console.warn('Failed to refresh project:', err);
    } finally {
      isRefreshingRef.current = false;
    }
  }, [project?.path, setProject]);

  // Silent refresh for polling (doesn't set loading state)
  const silentRefresh = useCallback(async () => {
    if (!project?.path || isRefreshingRef.current) return;

    isRefreshingRef.current = true;
    
    try {
      const updatedProject = await openProject(project.path);
      
      // Only update if initialization status changed
      const wasUninitialized = !project.hasSpecifyDir || !project.hasGitDir;
      const isNowInitialized = updatedProject.hasSpecifyDir && updatedProject.hasGitDir;
      const statusChanged = 
        project.hasSpecifyDir !== updatedProject.hasSpecifyDir ||
        project.hasGitDir !== updatedProject.hasGitDir ||
        project.specInstances.length !== updatedProject.specInstances.length;

      if (statusChanged) {
        setProject(updatedProject);
        
        // If project became fully initialized, stop monitoring will happen
        // automatically via the shouldMonitor check
        if (wasUninitialized && isNowInitialized) {
          console.log('Project initialized, stopping monitor');
        }
      }
    } catch (err) {
      // Silent fail for polling
    } finally {
      isRefreshingRef.current = false;
    }
  }, [project?.path, project?.hasSpecifyDir, project?.hasGitDir, project?.specInstances.length, setProject]);

  // Set up polling interval
  useEffect(() => {
    if (shouldMonitor) {
      // Start polling
      intervalRef.current = setInterval(silentRefresh, intervalMs);
      
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    } else {
      // Stop polling if it was running
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [shouldMonitor, intervalMs, silentRefresh]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    refresh,
    isRefreshing: isLoading,
  };
}
