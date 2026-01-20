/**
 * useGitStatus Hook
 * Polls git status for artifact files and updates the artifact store
 * Part of 005-ui-enhancements feature
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import { useArtifactStore } from '@/stores/artifactStore';
import { getGitStatus } from '@/services/tauriCommands';
import type { GitFileStatus, GitStatus } from '@/types';

interface UseGitStatusOptions {
  /** Files to watch for git status changes */
  files?: string[];
  /** Poll interval in milliseconds (default: 5000) */
  pollInterval?: number;
  /** Whether the watcher is enabled */
  enabled?: boolean;
}

interface UseGitStatusReturn {
  /** Current git status */
  status: GitStatus | null;
  /** Get the current git status for a file */
  getFileStatus: (filePath: string) => GitFileStatus;
  /** Refresh git status immediately */
  refresh: () => Promise<void>;
  /** Whether polling is active */
  isPolling: boolean;
}

export function useGitStatus({
  files,
  pollInterval = 5000,
  enabled = true,
}: UseGitStatusOptions = {}): UseGitStatusReturn {
  const project = useProjectStore((state) => state.project);
  const activeSpec = useProjectStore((state) => state.activeSpec);
  const updateGitStatus = useArtifactStore((state) => state.updateGitStatus);
  const artifacts = useArtifactStore((state) => state.artifacts);
  
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPollingRef = useRef(false);
  const [status, setStatus] = useState<GitStatus | null>(null);

  // Determine files to watch
  const filesToWatch = files || (activeSpec ? getSpecArtifactFiles(activeSpec) : []);

  // Fetch git status for files
  const fetchStatus = useCallback(async () => {
    if (!project) return;

    try {
      const response = await getGitStatus(project.path);
      setStatus(response);

      // Update artifact store with new statuses
      for (const filePath of filesToWatch) {
        const normalizedPath = filePath.replace(/\\/g, '/');
        const artifactId = getArtifactId(normalizedPath);
        if (artifactId) {
          let fileStatus: GitFileStatus = 'clean';
          
          // Check if file is in any of the changed arrays
          const isStaged = response.staged.some(f => normalizedPath.includes(f) || f.includes(normalizedPath.split('/').pop() || ''));
          const isUnstaged = response.unstaged.some(f => normalizedPath.includes(f) || f.includes(normalizedPath.split('/').pop() || ''));
          const isUntracked = response.untracked.some(f => normalizedPath.includes(f) || f.includes(normalizedPath.split('/').pop() || ''));

          if (isStaged) {
            fileStatus = 'staged';
          } else if (isUnstaged) {
            fileStatus = 'modified';
          } else if (isUntracked) {
            fileStatus = 'untracked';
          }

          updateGitStatus(artifactId, fileStatus);
        }
      }
    } catch (err) {
      console.error('Failed to fetch git status:', err);
    }
  }, [project, filesToWatch, updateGitStatus]);

  // Get current status for a file
  const getFileStatus = useCallback(
    (filePath: string): GitFileStatus => {
      const artifactId = getArtifactId(filePath);
      if (artifactId && artifacts[artifactId]) {
        return artifacts[artifactId].gitStatus;
      }
      return 'clean';
    },
    [artifacts]
  );

  // Start/stop polling
  useEffect(() => {
    if (!enabled || !project) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      isPollingRef.current = false;
      return;
    }

    // Initial fetch
    fetchStatus();

    // Start polling
    intervalRef.current = setInterval(fetchStatus, pollInterval);
    isPollingRef.current = true;

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      isPollingRef.current = false;
    };
  }, [enabled, project, pollInterval, fetchStatus]);

  return {
    status,
    getFileStatus,
    refresh: fetchStatus,
    isPolling: isPollingRef.current,
  };
}

/**
 * Get artifact files for a spec instance
 */
function getSpecArtifactFiles(spec: { path: string; artifacts: { 
  hasDescription: boolean;
  hasSpec: boolean;
  hasPlan: boolean;
  hasTasks: boolean;
  hasResearch: boolean;
  hasDataModel: boolean;
  hasQuickstart: boolean;
  checklistFiles: string[];
  contractFiles: string[];
}}): string[] {
  const files: string[] = [];
  const basePath = spec.path;

  if (spec.artifacts.hasDescription) files.push(`${basePath}/description.md`);
  if (spec.artifacts.hasSpec) files.push(`${basePath}/spec.md`);
  if (spec.artifacts.hasPlan) files.push(`${basePath}/plan.md`);
  if (spec.artifacts.hasTasks) files.push(`${basePath}/tasks.md`);
  if (spec.artifacts.hasResearch) files.push(`${basePath}/research.md`);
  if (spec.artifacts.hasDataModel) files.push(`${basePath}/data-model.md`);
  if (spec.artifacts.hasQuickstart) files.push(`${basePath}/quickstart.md`);

  for (const checklist of spec.artifacts.checklistFiles) {
    files.push(`${basePath}/checklists/${checklist}`);
  }

  for (const contract of spec.artifacts.contractFiles) {
    files.push(`${basePath}/contracts/${contract}`);
  }

  return files;
}

/**
 * Extract artifact ID from file path
 */
function getArtifactId(filePath: string): string | null {
  // Extract filename from path
  const parts = filePath.replace(/\\/g, '/').split('/');
  const filename = parts[parts.length - 1];
  
  if (!filename) return null;

  // Handle contract and checklist paths
  if (filePath.includes('/contracts/')) {
    return `contracts/${filename}`;
  }
  if (filePath.includes('/checklists/')) {
    return `checklist-${filename}`;
  }

  // Return the base filename without extension for other artifacts
  return filename.replace('.md', '');
}
