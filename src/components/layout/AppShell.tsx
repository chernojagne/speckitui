import { useState } from 'react';
import { NavPane } from './NavPane';
import { DetailPane } from './DetailPane';
import { TerminalPanel } from './TerminalPanel';
import { SpecSelector } from './SpecSelector';
import { SettingsPanel } from '@/components/settings/SettingsPanel';
import { useProjectStore } from '@/stores/projectStore';
import { useTerminalStore } from '@/stores/terminalStore';
import { open } from '@tauri-apps/plugin-dialog';
import { openProject } from '@/services/tauriCommands';
import { useWorkflowStore } from '@/stores/workflowStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { Button } from '@/components/ui/button';
import { FolderOpen, Settings, X } from 'lucide-react';

export function AppShell() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { project, isLoading, error, setProject, setLoading, setError, setActiveSpec } =
    useProjectStore();
  const { isCollapsed: terminalCollapsed } = useTerminalStore();
  const { updateContentStatus } = useWorkflowStore();
  const { addRecentProject, setLastProject } = useSettingsStore();

  const handleOpenProject = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: 'Open Project Folder',
      });

      if (selected && typeof selected === 'string') {
        setLoading(true);
        setError(null);
        const proj = await openProject(selected);
        setProject(proj);
        addRecentProject(selected);

        // Select first spec if available
        if (proj.specInstances.length > 0) {
          const spec = proj.specInstances[0];
          setActiveSpec(spec);
          updateContentStatus(spec.artifacts);
          setLastProject(selected, spec.id);
        } else {
          setLastProject(selected);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between h-12 px-4 bg-card border-b border-border shrink-0">
        <div className="flex items-center gap-4 flex-1">
          <Button 
            variant="ghost" 
            size="sm"
            className="gap-1.5"
            onClick={handleOpenProject} 
            disabled={isLoading}
          >
            <FolderOpen className="h-4 w-4" />
          </Button>
          {project && (
            <span className="font-medium uppercase text-foreground text-sm">
              {project.name}
            </span>
          )}
        </div>
        <div className="flex items-center">
          {project && project.specInstances.length > 0 && <SpecSelector />}
        </div>
        <div className="flex items-center gap-4 flex-1 justify-end">
          <Button 
            variant="ghost"
            size="sm"
            title="Settings"
            onClick={() => setIsSettingsOpen(true)}
            aria-label="Open settings"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Settings Panel */}
      <SettingsPanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* Error display */}
      {error && (
        <div className="flex items-center justify-between px-4 py-2 bg-destructive text-destructive-foreground text-sm">
          <span>⚠️ {error}</span>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0 hover:bg-destructive/80"
            onClick={() => setError(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        <NavPane />
        <main className="flex flex-col flex-1 overflow-hidden">
          <DetailPane />
        </main>
      </div>

      {/* Terminal panel (always rendered, handles minimized state internally) */}
      <TerminalPanel minimized={terminalCollapsed} />
    </div>
  );
}
