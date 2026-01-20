import { create } from 'zustand';
import type { ArtifactFile, GitFileStatus } from '@/types';

/**
 * Artifact Store - Manages artifact file states and git status
 * Part of 005-ui-enhancements feature
 */
interface ArtifactStoreState {
  // State
  artifacts: Record<string, ArtifactFile>;
  watchId: string | null;

  // Actions
  setArtifact: (id: string, artifact: ArtifactFile) => void;
  updateArtifactContent: (id: string, content: string) => void;
  updateGitStatus: (id: string, status: GitFileStatus) => void;
  setArtifactExists: (id: string, exists: boolean) => void;
  setArtifactModified: (id: string, isModified: boolean) => void;
  removeArtifact: (id: string) => void;
  clearArtifacts: () => void;
  setWatchId: (watchId: string | null) => void;
  getArtifact: (id: string) => ArtifactFile | undefined;
}

export const useArtifactStore = create<ArtifactStoreState>((set, get) => ({
  // Initial state
  artifacts: {},
  watchId: null,

  // Actions
  setArtifact: (id, artifact) =>
    set((state) => ({
      artifacts: {
        ...state.artifacts,
        [id]: artifact,
      },
    })),

  updateArtifactContent: (id, content) =>
    set((state) => {
      const artifact = state.artifacts[id];
      if (!artifact) return state;
      return {
        artifacts: {
          ...state.artifacts,
          [id]: {
            ...artifact,
            content,
            lastLoaded: new Date().toISOString(),
          },
        },
      };
    }),

  updateGitStatus: (id, status) =>
    set((state) => {
      const artifact = state.artifacts[id];
      if (!artifact) return state;
      return {
        artifacts: {
          ...state.artifacts,
          [id]: {
            ...artifact,
            gitStatus: status,
          },
        },
      };
    }),

  setArtifactExists: (id, exists) =>
    set((state) => {
      const artifact = state.artifacts[id];
      if (!artifact) return state;
      return {
        artifacts: {
          ...state.artifacts,
          [id]: {
            ...artifact,
            exists,
          },
        },
      };
    }),

  setArtifactModified: (id, isModified) =>
    set((state) => {
      const artifact = state.artifacts[id];
      if (!artifact) return state;
      return {
        artifacts: {
          ...state.artifacts,
          [id]: {
            ...artifact,
            isModified,
          },
        },
      };
    }),

  removeArtifact: (id) =>
    set((state) => {
      const { [id]: _, ...rest } = state.artifacts;
      return { artifacts: rest };
    }),

  clearArtifacts: () => set({ artifacts: {}, watchId: null }),

  setWatchId: (watchId) => set({ watchId }),

  getArtifact: (id) => get().artifacts[id],
}));
