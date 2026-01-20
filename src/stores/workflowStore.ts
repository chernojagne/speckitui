import { create } from 'zustand';
import type { WorkflowStepId, ArtifactManifest } from '@/types';

interface WorkflowState {
  // State
  selectedStep: WorkflowStepId;
  stepContentStatus: Record<WorkflowStepId, boolean>;
  stepUncommittedStatus: Record<WorkflowStepId, boolean>;

  // Actions
  setSelectedStep: (step: WorkflowStepId) => void;
  updateContentStatus: (manifest: ArtifactManifest | null) => void;
  updateUncommittedStatus: (stepId: WorkflowStepId, hasUncommitted: boolean) => void;
  hasContent: (step: WorkflowStepId) => boolean;
  hasUncommittedChanges: (step: WorkflowStepId) => boolean;
}

const getInitialContentStatus = (): Record<WorkflowStepId, boolean> => ({
  describe: false,
  specify: false,
  plan: false,
  tasks: false,
  implement: false,
  test: false,
  push: false,
  pr: false,
  bugfix: false,
  constitution: false,
});

const getInitialUncommittedStatus = (): Record<WorkflowStepId, boolean> => ({
  describe: false,
  specify: false,
  plan: false,
  tasks: false,
  implement: false,
  test: false,
  push: false,
  pr: false,
  bugfix: false,
  constitution: false,
});

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  // Initial state
  selectedStep: 'describe',
  stepContentStatus: getInitialContentStatus(),
  stepUncommittedStatus: getInitialUncommittedStatus(),

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
        describe: manifest.hasDescription,
        specify: manifest.hasSpec,
        plan: manifest.hasPlan || manifest.hasResearch || manifest.hasDataModel,
        tasks: manifest.hasTasks,
        implement: true, // Always show (file tree)
        test: false, // Placeholder for now
        push: true, // Always show (git status)
        pr: false, // Depends on GitHub connection
        bugfix: false, // Depends on GitHub connection
        constitution: true, // Always available at project level
      },
    });
  },

  updateUncommittedStatus: (stepId, hasUncommitted) =>
    set((state) => ({
      stepUncommittedStatus: {
        ...state.stepUncommittedStatus,
        [stepId]: hasUncommitted,
      },
    })),

  hasContent: (step) => get().stepContentStatus[step],
  hasUncommittedChanges: (step) => get().stepUncommittedStatus[step],
}));
