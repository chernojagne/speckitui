import { useState } from 'react';
import { FolderOpen, FolderPlus, RefreshCw, Loader2, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NewProjectDialog } from '../shared/NewProjectDialog';

interface ProjectHeaderProps {
  projectName: string;
  onOpenProject: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export function ProjectHeader({ projectName, onOpenProject, onRefresh, isRefreshing = false }: ProjectHeaderProps) {
  const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false);

  return (
    <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-card">
      <span className="font-semibold text-foreground text-sm uppercase truncate flex-1">
        {projectName}
      </span>
      <div className="flex items-center gap-1">
        {/* Refresh button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0"
              onClick={onRefresh}
              disabled={isRefreshing}
              aria-label="Refresh project"
            >
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>{isRefreshing ? 'Refreshing...' : 'Refresh project'}</p>
          </TooltipContent>
        </Tooltip>

        {/* Project menu */}
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  aria-label="Project options"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Project options</p>
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onOpenProject}>
              <FolderOpen className="h-4 w-4 mr-2" />
              Open Project...
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsNewProjectDialogOpen(true)}>
              <FolderPlus className="h-4 w-4 mr-2" />
              New Project...
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <NewProjectDialog
        open={isNewProjectDialogOpen}
        onOpenChange={setIsNewProjectDialogOpen}
      />
    </div>
  );
}
