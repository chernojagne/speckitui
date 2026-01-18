import { useProjectStore } from '@/stores/projectStore';
import { useWorkflowStore } from '@/stores/workflowStore';
import { useSettingsStore } from '@/stores/settingsStore';

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
    <div className="flex items-center gap-2">
      <label htmlFor="spec-select" className="text-sm text-muted-foreground">
        Spec:
      </label>
      <select
        id="spec-select"
        className="px-2 py-1 pr-6 text-sm font-inherit text-foreground bg-muted border border-border rounded-md cursor-pointer min-w-[200px] appearance-none bg-no-repeat bg-[right_8px_center] hover:border-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 8L2 4h8z'/%3E%3C/svg%3E")`
        }}
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
