import { create } from 'zustand';
import type { WorkflowStepId, ArtifactManifest } from '@/types';

interface WorkflowState {
  // State
  selectedStep: WorkflowStepId;
  stepContentStatus: Record<WorkflowStepId, boolean>;

  // Actions
  setSelectedStep: (step: WorkflowStepId) => void;
  updateContentStatus: (manifest: ArtifactManifest | null) => void;
  hasContent: (step: WorkflowStepId) => boolean;
}

const getInitialContentStatus = (): Record<WorkflowStepId, boolean> => ({
  specify: false,
  plan: false,
  tasks: false,
  implement: false,
  test: false,
  push: false,
  pr: false,
  bugfix: false,
});

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  // Initial state
  selectedStep: 'specify',
  stepContentStatus: getInitialContentStatus(),

  // Actions
  setSelectedStep: (step) =>
    set({
      selectedStep: step,
    }),

  updateContentStatus: (manifest) => {
    if (!manifest) {
      set({ stepContentStatus: getInitialContentStatus() });
      return;
    }

    set({
      stepContentStatus: {
        specify: manifest.hasSpec,
        plan: manifest.hasPlan || manifest.hasResearch || manifest.hasDataModel,
        tasks: manifest.hasTasks,
        implement: true, // Always show (file tree)
        test: false, // Placeholder for now
        push: true, // Always show (git status)
        pr: false, // Depends on GitHub connection
        bugfix: false, // Depends on GitHub connection
      },
    });
  },

  hasContent: (step) => get().stepContentStatus[step],
}));
