import { create } from 'zustand';

/**
 * Editor Store - Tracks unsaved changes and editing state for markdown files
 * Part of 005-ui-enhancements feature
 */
interface EditorStoreState {
  // State
  activeArtifact: string | null;
  unsavedChanges: Record<string, string>;
  isEditing: boolean;

  // Actions
  setActiveArtifact: (id: string | null) => void;
  setEditing: (editing: boolean) => void;
  updateContent: (artifactId: string, content: string) => void;
  clearUnsavedChanges: (artifactId: string) => void;
  clearAllUnsavedChanges: () => void;
  hasUnsavedChanges: () => boolean;
  getUnsavedContent: (artifactId: string) => string | undefined;
}

export const useEditorStore = create<EditorStoreState>((set, get) => ({
  // Initial state
  activeArtifact: null,
  unsavedChanges: {},
  isEditing: false,

  // Actions
  setActiveArtifact: (id) => set({ activeArtifact: id }),

  setEditing: (editing) => set({ isEditing: editing }),

  updateContent: (artifactId, content) =>
    set((state) => ({
      unsavedChanges: {
        ...state.unsavedChanges,
        [artifactId]: content,
      },
    })),

  clearUnsavedChanges: (artifactId) =>
    set((state) => {
      const { [artifactId]: _, ...rest } = state.unsavedChanges;
      return { unsavedChanges: rest };
    }),

  clearAllUnsavedChanges: () => set({ unsavedChanges: {} }),

  hasUnsavedChanges: () => Object.keys(get().unsavedChanges).length > 0,

  getUnsavedContent: (artifactId) => get().unsavedChanges[artifactId],
}));
