/**
 * Feature Environment Store
 * Manages environment variables for the current feature spec
 * These variables are exported to the current process and injected into terminal sessions
 */

import { create } from 'zustand';

export interface FeatureEnvVariables {
  BRANCH_NAME?: string;
  SPEC_FILE?: string;
  FEATURE_NUM?: string;
  SPECIFY_FEATURE?: string;
  FEATURE_DIR?: string;
  FEATURE_DESC_FILE?: string;
}

interface FeatureEnvState {
  // State
  variables: FeatureEnvVariables;
  isSet: boolean;

  // Actions
  setFromScriptOutput: (output: {
    BRANCH_NAME: string;
    SPEC_FILE: string;
    FEATURE_NUM: string | number;
  }) => void;
  clearVariables: () => void;
  getEnvRecord: () => Record<string, string>;
}

export const useFeatureEnvStore = create<FeatureEnvState>((set, get) => ({
  // Initial state
  variables: {},
  isSet: false,

  // Set variables from the create-new-feature.sh --json output
  setFromScriptOutput: (output) => {
    const branchName = output.BRANCH_NAME;
    const featureNum = String(output.FEATURE_NUM);
    
    const variables: FeatureEnvVariables = {
      BRANCH_NAME: branchName,
      SPEC_FILE: output.SPEC_FILE,
      FEATURE_NUM: featureNum,
      SPECIFY_FEATURE: branchName,
      FEATURE_DIR: `./specs/${branchName}`,
      FEATURE_DESC_FILE: `./.speckitui/${branchName}/description.md`,
    };

    set({ variables, isSet: true });

    // Also set in the current process's environment (browser context)
    // Note: This won't affect the actual OS environment, but will be accessible in JS
    if (typeof window !== 'undefined') {
      // Store in a global for access
      (window as unknown as Record<string, unknown>).__SPECKITUI_FEATURE_ENV__ = variables;
    }

    console.log('[FeatureEnvStore] Set feature environment variables:', variables);
  },

  // Clear all variables
  clearVariables: () => {
    set({ variables: {}, isSet: false });
    
    if (typeof window !== 'undefined') {
      delete (window as unknown as Record<string, unknown>).__SPECKITUI_FEATURE_ENV__;
    }

    console.log('[FeatureEnvStore] Cleared feature environment variables');
  },

  // Get variables as a Record<string, string> for passing to terminal
  getEnvRecord: () => {
    const { variables } = get();
    const record: Record<string, string> = {};
    
    for (const [key, value] of Object.entries(variables)) {
      if (value !== undefined) {
        record[key] = value;
      }
    }
    
    return record;
  },
}));
