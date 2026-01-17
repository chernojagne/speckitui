import { useWorkflowStore } from '@/stores/workflowStore';
import { useProjectStore } from '@/stores/projectStore';
import { SpecifyView } from '../workflow/SpecifyView';
import { PlanView } from '../workflow/PlanView';
import { TasksView } from '../workflow/TasksView';
import { ImplementView } from '../workflow/ImplementView';
import { TestView } from '../workflow/TestView';
import { PushView } from '../workflow/PushView';
import { PRView } from '../workflow/PRView';
import { BugFixView } from '../workflow/BugFixView';
import { EmptyState } from '../shared/EmptyState';
import './DetailPane.css';

export function DetailPane() {
  const { selectedStep } = useWorkflowStore();
  const { project, activeSpec } = useProjectStore();

  // No project loaded
  if (!project) {
    return (
      <div className="detail-pane">
        <EmptyState
          icon="📂"
          title="No Project Open"
          description="Open a project folder to get started with spec-driven development."
        />
      </div>
    );
  }

  // No spec instances found
  if (!activeSpec) {
    return (
      <div className="detail-pane">
        <EmptyState
          icon="📋"
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
            icon="❓"
            title="Unknown Step"
            description={`No view available for step: ${selectedStep}`}
          />
        );
    }
  };

  return <div className="detail-pane">{renderView()}</div>;
}
