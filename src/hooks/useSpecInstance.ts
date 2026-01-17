/**
 * useSpecInstance Hook
 * Provides spec instance selection and switching functionality
 */

import { useCallback, useMemo } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import { useSettingsStore } from '@/stores/settingsStore';
import type { SpecInstance, ArtifactManifest } from '@/types';

interface UseSpecInstanceReturn {
  // State
  activeSpec: SpecInstance | null;
  specInstances: SpecInstance[];
  hasSpecs: boolean;

  // Computed
  specPath: string | null;
  specName: string | null;
  artifacts: ArtifactManifest | null;

  // Actions
  selectSpec: (specId: string) => void;
  selectSpecByPath: (specPath: string) => void;
  getArtifactPath: (artifactName: string) => string | null;
  hasArtifact: (artifactType: keyof Omit<ArtifactManifest, 'contractFiles' | 'checklistFiles'>) => boolean;
}

export function useSpecInstance(): UseSpecInstanceReturn {
  const project = useProjectStore((state) => state.project);
  const activeSpec = useProjectStore((state) => state.activeSpec);
  const setActiveSpec = useProjectStore((state) => state.setActiveSpec);
  const setLastProject = useSettingsStore((state) => state.setLastProject);

  // All spec instances from the project
  const specInstances = useMemo(() => {
    return project?.specInstances ?? [];
  }, [project?.specInstances]);

  // Whether the project has any specs
  const hasSpecs = specInstances.length > 0;

  // Current spec path for file operations
  const specPath = useMemo(() => {
    if (!activeSpec) return null;
    return activeSpec.path;
  }, [activeSpec]);

  // Current spec name for display (use displayName from SpecInstance)
  const specName = useMemo(() => {
    if (!activeSpec) return null;
    return activeSpec.displayName;
  }, [activeSpec]);

  // Artifacts manifest
  const artifacts = useMemo(() => {
    if (!activeSpec) return null;
    return activeSpec.artifacts;
  }, [activeSpec]);

  /**
   * Select a spec by its ID
   */
  const selectSpec = useCallback((specId: string) => {
    const spec = specInstances.find((s) => s.id === specId);
    if (spec && project) {
      setActiveSpec(spec);
      // Persist the selection
      setLastProject(project.path, spec.id);
    }
  }, [specInstances, setActiveSpec, setLastProject, project]);

  /**
   * Select a spec by its path
   */
  const selectSpecByPath = useCallback((path: string) => {
    const spec = specInstances.find((s) => s.path === path);
    if (spec && project) {
      setActiveSpec(spec);
      setLastProject(project.path, spec.id);
    }
  }, [specInstances, setActiveSpec, setLastProject, project]);

  /**
   * Get the full path to an artifact file within the current spec
   */
  const getArtifactPath = useCallback((artifactName: string): string | null => {
    if (!specPath) return null;
    return `${specPath}/${artifactName}`;
  }, [specPath]);

  /**
   * Check if the current spec has a specific artifact type
   */
  const hasArtifact = useCallback(
    (artifactType: keyof Omit<ArtifactManifest, 'contractFiles' | 'checklistFiles'>): boolean => {
      if (!artifacts) return false;
      return !!artifacts[artifactType];
    },
    [artifacts]
  );

  return {
    activeSpec,
    specInstances,
    hasSpecs,
    specPath,
    specName,
    artifacts,
    selectSpec,
    selectSpecByPath,
    getArtifactPath,
    hasArtifact,
  };
}
