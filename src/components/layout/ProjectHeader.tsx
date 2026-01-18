import { FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface ProjectHeaderProps {
  projectName: string;
  onOpenProject: () => void;
}

export function ProjectHeader({ projectName, onOpenProject }: ProjectHeaderProps) {
  return (
    <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-card">
      <span className="font-semibold text-foreground text-sm uppercase truncate flex-1">
        {projectName}
      </span>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            onClick={onOpenProject}
            aria-label="Open project folder"
          >
            <FolderOpen className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>Open project folder</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
