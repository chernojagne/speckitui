import { EmptyState } from '../shared/EmptyState';

export function TestView() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <EmptyState
        icon="🧪"
        title="Test Step"
        description="Run tests and view results here."
        hint="This feature is coming soon. Use the terminal to run tests."
      />
    </div>
  );
}
