import { EmptyState } from '../shared/EmptyState';
import './WorkflowView.css';

export function TestView() {
  return (
    <div className="workflow-view test-view">
      <EmptyState
        icon="🧪"
        title="Test Step"
        description="Run tests and view results here."
        hint="This feature is coming soon. Use the terminal to run tests."
      />
    </div>
  );
}
