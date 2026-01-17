import { workflowSteps } from '@/config/workflowSteps';
import { useWorkflowStore } from '@/stores/workflowStore';
import { useProjectStore } from '@/stores/projectStore';
import type { WorkflowStepId } from '@/types';
import './NavPane.css';

export function NavPane() {
  const { selectedStep, setSelectedStep, stepContentStatus } = useWorkflowStore();
  const { project, activeSpec } = useProjectStore();

  const handleStepClick = (stepId: WorkflowStepId) => {
    setSelectedStep(stepId);
  };

  return (
    <nav className="nav-pane">
      <div className="nav-header">
        <span className="nav-title">Workflow</span>
      </div>
      <ul className="nav-steps">
        {workflowSteps.map((step) => {
          const isSelected = selectedStep === step.id;
          const hasContent = stepContentStatus[step.id];
          const isDisabled = !project || !activeSpec;

          return (
            <li key={step.id}>
              <button
                className={`nav-step ${isSelected ? 'selected' : ''} ${hasContent ? 'has-content' : ''}`}
                onClick={() => handleStepClick(step.id)}
                disabled={isDisabled}
                aria-current={isSelected ? 'page' : undefined}
              >
                <span className="step-icon">{step.icon}</span>
                <span className="step-label">{step.label}</span>
                {hasContent && <span className="content-indicator" title="Has content" />}
                {step.requiresGitHub && (
                  <span className="github-indicator" title="Requires GitHub">
                    
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
      {activeSpec && (
        <div className="nav-footer">
          <div className="spec-info">
            <span className="spec-badge">{String(activeSpec.number).padStart(3, '0')}</span>
            <span className="spec-name">{activeSpec.shortName}</span>
          </div>
        </div>
      )}
    </nav>
  );
}
