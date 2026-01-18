/**
 * RecentProjects Component
 * Shows list of recent projects with ability to open them
 */

import { useSettingsStore } from '@/stores/settingsStore';
import { useProjectStore } from '@/stores/projectStore';
import { openProject } from '@/services/tauriCommands';
import { cn } from '@/lib/utils';

interface RecentProjectsProps {
  onProjectSelect?: () => void;
}

export function RecentProjects({ onProjectSelect }: RecentProjectsProps) {
  // recentProjects is string[] in settingsStore
  const recentProjects = useSettingsStore((state) => state.recentProjects);
  const currentProject = useProjectStore((state) => state.project);

  const handleOpenProject = async (path: string) => {
    try {
      await openProject(path);
      onProjectSelect?.();
    } catch (error) {
      console.error('Failed to open project:', error);
    }
  };

  const getProjectName = (path: string): string => {
    const parts = path.split(/[/\\]/);
    return parts[parts.length - 1] || path;
  };

  const formatPath = (path: string): string => {
    // Shorten long paths
    if (path.length > 50) {
      const parts = path.split(/[/\\]/);
      if (parts.length > 3) {
        return `${parts[0]}/.../${parts.slice(-2).join('/')}`;
      }
    }
    return path;
  };

  if (recentProjects.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <span className="text-4xl mb-4 opacity-70">📁</span>
          <p className="my-1 text-foreground">No recent projects</p>
          <p className="mt-2 text-[13px] text-muted-foreground max-w-[280px]">
            Projects you open will appear here for quick access.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <span className="text-[13px] text-muted-foreground">{recentProjects.length} recent projects</span>
      </div>

      <ul className="list-none m-0 p-0 flex flex-col gap-1">
        {recentProjects.map((projectPath: string) => {
          const isCurrent = currentProject?.path === projectPath;
          const projectName = getProjectName(projectPath);
          
          return (
            <li 
              key={projectPath}
              className={cn(
                "flex items-center gap-2 rounded-md transition-colors",
                isCurrent ? "bg-primary/10" : "hover:bg-accent"
              )}
            >
              <button
                className="flex-1 flex items-center gap-3 p-3 bg-transparent border-none cursor-pointer text-left disabled:cursor-default"
                onClick={() => handleOpenProject(projectPath)}
                disabled={isCurrent}
              >
                <span className="text-xl opacity-80">📁</span>
                <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                  <span className="text-sm font-medium text-foreground whitespace-nowrap overflow-hidden text-ellipsis">
                    {projectName}
                  </span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis">
                    {formatPath(projectPath)}
                  </span>
                </div>
                {isCurrent && (
                  <span className="px-2 py-0.5 text-[11px] font-medium text-primary bg-primary/10 rounded-full uppercase">
                    Current
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
