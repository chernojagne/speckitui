import { useState, useCallback, useEffect, useRef } from 'react';
import { NavPane } from './NavPane';
import { DetailPane } from './DetailPane';
import { StatusBar } from './StatusBar';
import { TerminalPanel } from './TerminalPanel';
import { TitleBar } from './TitleBar';
import { SettingsPanel } from '@/components/settings/SettingsPanel';
import { useProjectMonitor, useArtifactCreationWatcher } from '@/hooks';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';
import { useProjectStore } from '@/stores/projectStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { open } from '@tauri-apps/plugin-dialog';
import { openProject, watchArtifactFiles, unwatchArtifactFiles } from '@/services/tauriCommands';
import { useWorkflowStore } from '@/stores/workflowStore';
import { Button } from '@/components/ui/button';
import { X, AlertTriangle } from 'lucide-react';

export function AppShell() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const watchIdRef = useRef<string | null>(null);
  const { error, project, setProject, setLoading, setError, setActiveSpec } =
    useProjectStore();
  
  // Monitor for project initialization changes
  useProjectMonitor();
  const { updateContentStatus } = useWorkflowStore();
  const { 
    addRecentProject, 
    setLastProject, 
    navPaneCollapsed,
    setNavPaneWidth,
    toggleNavPaneCollapsed 
  } = useSettingsStore();

  // Start watching specs directory when project is opened
  useEffect(() => {
    const setupWatcher = async () => {
      if (project?.path && project.hasSpecsDir) {
        try {
          // Stop any existing watcher
          if (watchIdRef.current) {
            await unwatchArtifactFiles(watchIdRef.current).catch(() => {});
          }
          // Start watching the specs directory
          const specsDir = `${project.path}/specs`;
          const watchId = await watchArtifactFiles(specsDir);
          watchIdRef.current = watchId;
          console.log('[AppShell] Started watching specs directory:', specsDir);
        } catch (err) {
          console.warn('[AppShell] Failed to start file watcher:', err);
        }
      }
    };
    
    setupWatcher();
    
    return () => {
      // Cleanup watcher on unmount or project change
      if (watchIdRef.current) {
        unwatchArtifactFiles(watchIdRef.current).catch(() => {});
        watchIdRef.current = null;
      }
    };
  }, [project?.path, project?.hasSpecsDir]);

  // Use pixel-based sizes for predictable layout
  const navDefaultSize = "220px";
  const navMinSize = "180px";
  const navMaxSize = "400px";
  const navCollapsedSize = "48px";

  const handlePanelResize = useCallback((layout: { [panelId: string]: number }) => {
    // Get the nav-pane size
    const navSize = layout['nav-pane'];
    if (!navPaneCollapsed && navSize) {
      // Store the width (convert percentage to approximate pixels)
      const newWidth = Math.round((navSize / 100) * window.innerWidth);
      setNavPaneWidth(newWidth);
    }
  }, [navPaneCollapsed, setNavPaneWidth]);

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

  const handleOpenSettings = () => {
    setIsSettingsOpen(true);
  };

  // Manual refresh - reloads project from disk
  const handleRefreshProject = useCallback(async () => {
    if (!project?.path || isRefreshing) return;
    
    // Remember current spec ID to preserve selection
    const currentSpecId = useProjectStore.getState().activeSpec?.id;
    
    setIsRefreshing(true);
    try {
      const proj = await openProject(project.path);
      setProject(proj);
      
      // Try to re-select the same spec that was active before refresh
      if (currentSpecId && proj.specInstances.length > 0) {
        const matchingSpec = proj.specInstances.find(s => s.id === currentSpecId);
        if (matchingSpec) {
          setActiveSpec(matchingSpec);
          updateContentStatus(matchingSpec.artifacts);
        } else {
          // Spec was removed, fall back to first available
          const spec = proj.specInstances[0];
          setActiveSpec(spec);
          updateContentStatus(spec.artifacts);
        }
      } else if (proj.specInstances.length > 0) {
        // No previous spec, select first one
        const spec = proj.specInstances[0];
        setActiveSpec(spec);
        updateContentStatus(spec.artifacts);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsRefreshing(false);
    }
  }, [project?.path, isRefreshing, setProject, setActiveSpec, updateContentStatus, setError]);

  // Watch for new artifact file creation and auto-refresh
  useArtifactCreationWatcher(handleRefreshProject);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Custom title bar */}
      <TitleBar />

      {/* Settings Panel */}
      <SettingsPanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* Error display */}
      {error && (
        <div className="flex items-center justify-between px-4 py-2 bg-destructive text-destructive-foreground text-sm">
          <span className="flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> {error}</span>
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
      <ResizablePanelGroup 
        orientation="horizontal" 
        className="flex-1 overflow-hidden"
        onLayoutChanged={handlePanelResize}
      >
        <ResizablePanel 
          id="nav-pane"
          defaultSize={navPaneCollapsed ? navCollapsedSize : navDefaultSize}
          minSize={navPaneCollapsed ? navCollapsedSize : navMinSize}
          maxSize={navPaneCollapsed ? navCollapsedSize : navMaxSize}
          className="transition-all duration-200"
        >
          <NavPane 
            onOpenProject={handleOpenProject} 
            onSettings={handleOpenSettings}
            isCollapsed={navPaneCollapsed}
            onToggleCollapse={toggleNavPaneCollapsed}
            onRefresh={handleRefreshProject}
            isRefreshing={isRefreshing}
          />
        </ResizablePanel>
        <ResizableHandle disabled={navPaneCollapsed} className="hover:bg-primary/20 transition-colors" />
        <ResizablePanel id="main-content" className="!overflow-hidden">
          {/* Vertical layout: DetailPane fills remaining space, Terminal at bottom with fixed height */}
          <div className="flex flex-col h-full overflow-hidden">
            <main className="flex-1 flex flex-col overflow-hidden min-h-0">
              <DetailPane onRefresh={handleRefreshProject} isRefreshing={isRefreshing} />
            </main>
            <TerminalPanel />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Status bar spans full width below nav and main content */}
      <StatusBar />
    </div>
  );
}
