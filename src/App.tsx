import { useEffect } from 'react';
import { AppShell } from './components/layout/AppShell';
import { TooltipProvider } from './components/ui/tooltip';
import { useProjectStore } from './stores/projectStore';
import { useSettingsStore } from './stores/settingsStore';
import { useWorkflowStore } from './stores/workflowStore';
import { openProject } from './services/tauriCommands';

function App() {
  const { setProject, setLoading, setActiveSpec } = useProjectStore();
  const { lastProjectPath, lastSpecId } = useSettingsStore();
  const { updateContentStatus } = useWorkflowStore();

  // Session restore: load last project on startup
  useEffect(() => {
    const restoreSession = async () => {
      if (!lastProjectPath) return;

      try {
        setLoading(true);
        const project = await openProject(lastProjectPath);
        setProject(project);

        // Update workflow content status
        const spec = lastSpecId
          ? project.specInstances.find((s) => s.id === lastSpecId)
          : project.specInstances[0];

        if (spec) {
          setActiveSpec(spec);
          updateContentStatus(spec.artifacts);
        }
      } catch (err) {
        // Don't show error for session restore failure
        console.warn('Failed to restore last session:', err);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  return (
    <TooltipProvider>
      <AppShell />
    </TooltipProvider>
  );
}

export default App;
