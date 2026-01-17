/**
 * RecentProjects Component
 * Shows list of recent projects with ability to open them
 */

import { useSettingsStore } from '@/stores/settingsStore';
import { useProjectStore } from '@/stores/projectStore';
import { openProject } from '@/services/tauriCommands';
import './RecentProjects.css';

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
      <div className="recent-projects">
        <div className="recent-projects-empty">
          <span className="empty-icon">📁</span>
          <p>No recent projects</p>
          <p className="hint">Projects you open will appear here for quick access.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="recent-projects">
      <div className="recent-projects-header">
        <span className="recent-count">{recentProjects.length} recent projects</span>
      </div>

      <ul className="recent-projects-list">
        {recentProjects.map((projectPath: string) => {
          const isCurrent = currentProject?.path === projectPath;
          const projectName = getProjectName(projectPath);
          
          return (
            <li 
              key={projectPath}
              className={`recent-project-item ${isCurrent ? 'current' : ''}`}
            >
              <button
                className="project-btn"
                onClick={() => handleOpenProject(projectPath)}
                disabled={isCurrent}
              >
                <span className="project-icon">📁</span>
                <div className="project-info">
                  <span className="project-name">{projectName}</span>
                  <span className="project-path">{formatPath(projectPath)}</span>
                </div>
                {isCurrent && (
                  <span className="current-badge">Current</span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
