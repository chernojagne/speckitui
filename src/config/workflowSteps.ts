import type { WorkflowStep, WorkflowStepId } from '@/types';
import { 
  PenLine,
  FileText, 
  Map, 
  CheckSquare, 
  Code, 
  FlaskConical, 
  Upload, 
  GitPullRequest, 
  Bug 
} from 'lucide-react';

/**
 * Workflow step configuration
 * Defines the 9 workflow steps with their properties
 */
export const workflowSteps: WorkflowStep[] = [
  {
    id: 'describe',
    label: 'Describe',
    icon: PenLine,
    artifactPatterns: ['description.md'],
    requiresGitHub: false,
    hasContent: false,
  },
  {
    id: 'specify',
    label: 'Specify',
    icon: FileText,
    artifactPatterns: ['spec.md', 'checklists/requirements.md'],
    requiresGitHub: false,
    hasContent: false,
  },
  {
    id: 'plan',
    label: 'Plan',
    icon: Map,
    artifactPatterns: ['plan.md', 'research.md', 'data-model.md', 'quickstart.md', 'contracts/*'],
    requiresGitHub: false,
    hasContent: false,
  },
  {
    id: 'tasks',
    label: 'Tasks',
    icon: CheckSquare,
    artifactPatterns: ['tasks.md'],
    requiresGitHub: false,
    hasContent: false,
  },
  {
    id: 'implement',
    label: 'Implement',
    icon: Code,
    artifactPatterns: [], // Uses file tree instead of artifacts
    requiresGitHub: false,
    hasContent: false,
  },
  {
    id: 'test',
    label: 'Test',
    icon: FlaskConical,
    artifactPatterns: ['test-results.md'],
    requiresGitHub: false,
    hasContent: false,
  },
  {
    id: 'push',
    label: 'Push',
    icon: Upload,
    artifactPatterns: [], // Uses git status
    requiresGitHub: false,
    hasContent: false,
  },
  {
    id: 'pr',
    label: 'PR',
    icon: GitPullRequest,
    artifactPatterns: [], // Uses GitHub API
    requiresGitHub: true,
    hasContent: false,
  },
  {
    id: 'bugfix',
    label: 'Bug Fix',
    icon: Bug,
    artifactPatterns: [], // Uses GitHub Issues API
    requiresGitHub: true,
    hasContent: false,
  },
];

/**
 * Get a workflow step by ID
 */
export function getWorkflowStep(id: WorkflowStepId): WorkflowStep | undefined {
  return workflowSteps.find((step) => step.id === id);
}

/**
 * Get artifact files for a step based on manifest
 */
export function getStepArtifactFiles(
  stepId: WorkflowStepId,
  hasSpec: boolean,
  hasPlan: boolean,
  hasResearch: boolean,
  hasDataModel: boolean,
  hasQuickstart: boolean,
  hasTasks: boolean,
  contractFiles: string[],
  checklistFiles: string[]
): string[] {
  switch (stepId) {
    case 'specify':
      const specifyFiles: string[] = [];
      if (hasSpec) specifyFiles.push('spec.md');
      checklistFiles.forEach((f) => specifyFiles.push(`checklists/${f}`));
      return specifyFiles;

    case 'plan':
      const planFiles: string[] = [];
      if (hasPlan) planFiles.push('plan.md');
      if (hasResearch) planFiles.push('research.md');
      if (hasDataModel) planFiles.push('data-model.md');
      if (hasQuickstart) planFiles.push('quickstart.md');
      contractFiles.forEach((f) => planFiles.push(`contracts/${f}`));
      return planFiles;

    case 'tasks':
      return hasTasks ? ['tasks.md'] : [];

    default:
      return [];
  }
}
