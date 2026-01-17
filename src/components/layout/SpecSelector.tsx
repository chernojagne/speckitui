import { useProjectStore } from '@/stores/projectStore';
import { useWorkflowStore } from '@/stores/workflowStore';
import { useSettingsStore } from '@/stores/settingsStore';
import './SpecSelector.css';

export function SpecSelector() {
  const { project, activeSpec, setActiveSpec } = useProjectStore();
  const { updateContentStatus } = useWorkflowStore();
  const { setLastProject } = useSettingsStore();

  if (!project || project.specInstances.length === 0) {
    return null;
  }

  const handleSpecChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const specId = e.target.value;
    const spec = project.specInstances.find((s) => s.id === specId);
    if (spec) {
      setActiveSpec(spec);
      updateContentStatus(spec.artifacts);
      setLastProject(project.path, spec.id);
    }
  };

  return (
    <div className="spec-selector">
      <label htmlFor="spec-select" className="spec-selector-label">
        Spec:
      </label>
      <select
        id="spec-select"
        className="spec-selector-dropdown"
        value={activeSpec?.id ?? ''}
        onChange={handleSpecChange}
      >
        {project.specInstances.map((spec) => (
          <option key={spec.id} value={spec.id}>
            {String(spec.number).padStart(3, '0')} - {spec.displayName}
          </option>
        ))}
      </select>
    </div>
  );
}
