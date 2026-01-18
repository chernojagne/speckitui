import { create } from 'zustand';
import type { Project, SpecInstance } from '@/types';

interface ProjectState {
  // State
  project: Project | null;
  activeSpec: SpecInstance | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setProject: (project: Project | null) => void;
  setActiveSpec: (spec: SpecInstance | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  // Initial state
  project: null,
  activeSpec: null,
  isLoading: false,
  error: null,

  // Actions
  setProject: (project) =>
    set({
      project,
      // Auto-select first spec if available
      activeSpec: project?.specInstances[0] ?? null,
      error: null,
    }),

  setActiveSpec: (spec) =>
    set({
      activeSpec: spec,
    }),

  setLoading: (isLoading) =>
    set({
      isLoading,
    }),

  setError: (error) =>
    set({
      error,
      isLoading: false,
    }),

  reset: () =>
    set({
      project: null,
      activeSpec: null,
      isLoading: false,
      error: null,
    }),
}));
