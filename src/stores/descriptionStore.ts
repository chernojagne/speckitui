import { create } from 'zustand';

interface DescriptionState {
  // State
  content: string;
  isDirty: boolean;
  isLoading: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  error: string | null;

  // Actions
  setContent: (content: string) => void;
  markDirty: () => void;
  markClean: () => void;
  setLoading: (loading: boolean) => void;
  setSaving: (saving: boolean) => void;
  setLastSaved: (date: Date) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  content: '',
  isDirty: false,
  isLoading: false,
  isSaving: false,
  lastSaved: null,
  error: null,
};

export const useDescriptionStore = create<DescriptionState>((set) => ({
  // Initial state
  ...initialState,

  // Actions
  setContent: (content) => set({ content, isDirty: true }),

  markDirty: () => set({ isDirty: true }),

  markClean: () => set({ isDirty: false }),

  setLoading: (loading) => set({ isLoading: loading }),

  setSaving: (saving) => set({ isSaving: saving }),

  setLastSaved: (date) => set({ lastSaved: date, isDirty: false }),

  setError: (error) => set({ error }),

  reset: () => set(initialState),
}));
