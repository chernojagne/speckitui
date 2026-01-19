import { useWorkflowStore } from '@/stores/workflowStore';
import { useProjectStore } from '@/stores/projectStore';
import { DescribeStep } from '../workflow/DescribeStep';
import { SpecifyView } from '../workflow/SpecifyView';
import { PlanView } from '../workflow/PlanView';
import { TasksView } from '../workflow/TasksView';
import { ImplementView } from '../workflow/ImplementView';
import { TestView } from '../workflow/TestView';
import { PushView } from '../workflow/PushView';
import { PRView } from '../workflow/PRView';
import { BugFixView } from '../workflow/BugFixView';
import { ConstitutionView } from '../settings/ConstitutionView';
import { EmptyState } from '../shared/EmptyState';
import { FolderOpen, FileText, HelpCircle } from 'lucide-react';

export function DetailPane() {
  const { selectedStep } = useWorkflowStore();
  const { project, activeSpec } = useProjectStore();

  // No project loaded
  if (!project) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden bg-background">
        <EmptyState
          icon={FolderOpen}
          title="No Project Open"
          description="Open a project folder to get started with spec-driven development."
        />
      </div>
    );
  }

  // Constitution view works without a spec
  if (selectedStep === 'constitution') {
    return <div className="flex-1 flex flex-col overflow-hidden bg-background"><ConstitutionView /></div>;
  }

  // No spec instances found (for non-constitution views)
  if (!activeSpec) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden bg-background">
        <EmptyState
          icon={FileText}
          title="No Spec Instances"
          description="This project has no spec instances in the specs/ directory."
          hint="Create a new spec using the spec-kit CLI: speckit specify"
        />
      </div>
    );
  }

  // Render the appropriate view based on selected step
  const renderView = () => {
    switch (selectedStep) {
      case 'describe':
        return <DescribeStep />;
      case 'specify':
        return <SpecifyView />;
      case 'plan':
        return <PlanView />;
      case 'tasks':
        return <TasksView />;
      case 'implement':
        return <ImplementView />;
      case 'test':
        return <TestView />;
      case 'push':
        return <PushView />;
      case 'pr':
        return <PRView />;
      case 'bugfix':
        return <BugFixView />;
      default:
        return (
          <EmptyState
            icon={HelpCircle}
            title="Unknown Step"
            description={`No view available for step: ${selectedStep}`}
          />
        );
    }
  };

  return <div className="flex-1 flex flex-col overflow-hidden bg-background">{renderView()}</div>;
}
