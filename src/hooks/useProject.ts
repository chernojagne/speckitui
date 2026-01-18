/**
 * useProject Hook
 * Provides project opening, management, and recent projects functionality
 */

import { useCallback, useState } from 'react';
import { open } from '@tauri-apps/plugin-dialog';
import {
  openProject,
  getRecentProjects,
  getChangedFiles,
  getGitStatus,
  type RecentProject,
} from '@/services/tauriCommands';
import type { Project, ChangedFile, GitStatus } from '@/types';
import { useProjectStore } from '@/stores/projectStore';
import { useSettingsStore } from '@/stores/settingsStore';

interface UseProjectReturn {
  // State
  isOpening: boolean;
  error: string | null;

  // Actions
  openProjectDialog: () => Promise<Project | null>;
  openProjectPath: (path: string) => Promise<Project | null>;
  loadRecentProjects: () => Promise<RecentProject[]>;
  getChangedFilesForProject: () => Promise<ChangedFile[]>;
  getProjectGitStatus: () => Promise<GitStatus | null>;
  closeProject: () => void;
}

export function useProject(): UseProjectReturn {
  const [isOpening, setIsOpening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { project, setProject, setLoading, setError: setStoreError, reset } = useProjectStore();
  const { addRecentProject } = useSettingsStore();

  /**
   * Open a native folder dialog and load the selected project
   */
  const openProjectDialog = useCallback(async (): Promise<Project | null> => {
    setError(null);
    setIsOpening(true);
    setLoading(true);

    try {
      // Open native folder picker
      const selectedPath = await open({
        directory: true,
        multiple: false,
        title: 'Select Project Folder',
      });

      if (!selectedPath) {
        setIsOpening(false);
        setLoading(false);
        return null;
      }

      // Load the project
      const loadedProject = await openProject(selectedPath as string);

      // Update store
      setProject(loadedProject);

      // Add to recent projects
      addRecentProject(loadedProject.path);

      setIsOpening(false);
      return loadedProject;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to open project';
      setError(errorMessage);
      setStoreError(errorMessage);
      setIsOpening(false);
      return null;
    }
  }, [setProject, setLoading, setStoreError, addRecentProject]);

  /**
   * Open a project by path (used for recent projects)
   */
  const openProjectPath = useCallback(async (path: string): Promise<Project | null> => {
    setError(null);
    setIsOpening(true);
    setLoading(true);

    try {
      const loadedProject = await openProject(path);

      // Update store
      setProject(loadedProject);

      // Add/update in recent projects
      addRecentProject(loadedProject.path);

      setIsOpening(false);
      return loadedProject;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to open project';
      setError(errorMessage);
      setStoreError(errorMessage);
      setIsOpening(false);
      return null;
    }
  }, [setProject, setLoading, setStoreError, addRecentProject]);

  /**
   * Load the list of recent projects
   */
  const loadRecentProjects = useCallback(async (): Promise<RecentProject[]> => {
    try {
      const projects = await getRecentProjects();
      return projects;
    } catch (err) {
      console.error('Failed to load recent projects:', err);
      return [];
    }
  }, []);

  /**
   * Get changed files for the current project
   */
  const getChangedFilesForProject = useCallback(async (): Promise<ChangedFile[]> => {
    if (!project) {
      return [];
    }

    try {
      const files = await getChangedFiles(project.path);
      return files;
    } catch (err) {
      console.error('Failed to get changed files:', err);
      return [];
    }
  }, [project]);

  /**
   * Get Git status for the current project
   */
  const getProjectGitStatus = useCallback(async (): Promise<GitStatus | null> => {
    if (!project) {
      return null;
    }

    try {
      const status = await getGitStatus(project.path);
      return status;
    } catch (err) {
      console.error('Failed to get git status:', err);
      return null;
    }
  }, [project]);

  /**
   * Close the current project
   */
  const closeProject = useCallback(() => {
    reset();
  }, [reset]);

  return {
    isOpening,
    error,
    openProjectDialog,
    openProjectPath,
    loadRecentProjects,
    getChangedFilesForProject,
    getProjectGitStatus,
    closeProject,
  };
}
