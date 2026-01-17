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
import './AppShell.css';

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
    <div className="app-shell">
      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <button className="open-project-btn" onClick={handleOpenProject} disabled={isLoading}>
            {isLoading ? 'Opening...' : '📂 Open Project'}
          </button>
          {project && <span className="project-name">{project.name}</span>}
        </div>
        <div className="header-center">
          {project && project.specInstances.length > 0 && <SpecSelector />}
        </div>
        <div className="header-right">
          <button 
            className="settings-btn" 
            title="Settings"
            onClick={() => setIsSettingsOpen(true)}
            aria-label="Open settings"
          >
            ⚙️
          </button>
        </div>
      </header>

      {/* Settings Panel */}
      <SettingsPanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* Error display */}
      {error && (
        <div className="error-banner">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* Main content area */}
      <div className="app-content">
        <NavPane />
        <main className="main-area">
          <DetailPane />
        </main>
      </div>

      {/* Terminal panel (always rendered, handles minimized state internally) */}
      <TerminalPanel minimized={terminalCollapsed} />
    </div>
  );
}
