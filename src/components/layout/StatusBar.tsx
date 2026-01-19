/**
 * StatusBar Component
 * Shows current git branch and other status information at the bottom of the window
 */

import { useGitBranch } from '@/hooks/useGitBranch';
import { useProjectStore } from '@/stores/projectStore';
import { GitBranch, GitCommit } from 'lucide-react';
import { cn } from '@/lib/utils';
import './StatusBar.css';

export function StatusBar() {
  const project = useProjectStore((state) => state.project);
  const { branch, isDetached, commitHash, isLoading } = useGitBranch();

  // Don't render if no project is open
  if (!project) {
    return null;
  }

  return (
    <div className="status-bar">
      <div className="status-bar-left">
        {/* Git branch indicator */}
        {(branch || isDetached) && (
          <div 
            className={cn(
              "status-bar-item",
              isLoading && "opacity-50"
            )}
            title={isDetached ? `Detached at ${commitHash}` : `Branch: ${branch}`}
          >
            {isDetached ? (
              <>
                <GitCommit className="h-3.5 w-3.5 text-warning" />
                <span className="text-warning">{commitHash || 'detached'}</span>
              </>
            ) : (
              <>
                <GitBranch className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{branch}</span>
              </>
            )}
          </div>
        )}
      </div>

      <div className="status-bar-right">
        {/* Additional status items can be added here */}
      </div>
    </div>
  );
}
