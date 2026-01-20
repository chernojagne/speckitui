import { useState } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import { useWorkflowStore } from '@/stores/workflowStore';
import { useSettingsStore } from '@/stores/settingsStore';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Plus } from 'lucide-react';
import { NewSpecDialog } from '../shared/NewSpecDialog';

export function SpecSelector() {
  const { project, activeSpec, setActiveSpec } = useProjectStore();
  const { updateContentStatus } = useWorkflowStore();
  const { setLastProject } = useSettingsStore();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (!project) {
    return null;
  }

  const handleSpecChange = (specId: string) => {
    const spec = project.specInstances.find((s) => s.id === specId);
    if (spec) {
      setActiveSpec(spec);
      updateContentStatus(spec.artifacts);
      setLastProject(project.path, spec.id);
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      <Select
        value={activeSpec?.id ?? ''}
        onValueChange={handleSpecChange}
      >
        <SelectTrigger className="flex-1 min-w-0 h-8 text-sm">
          <SelectValue placeholder="Select a spec..." />
        </SelectTrigger>
        <SelectContent>
          {project.specInstances.length === 0 ? (
            <SelectItem value="__empty__" disabled>
              No specs found
            </SelectItem>
          ) : (
            project.specInstances.map((spec) => (
              <SelectItem key={spec.id} value={spec.id}>
                {String(spec.number).padStart(3, '0')} - {spec.displayName}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => setIsDialogOpen(true)}
            aria-label="Create new spec"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Create new spec</p>
        </TooltipContent>
      </Tooltip>

      <NewSpecDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
      />
    </div>
  );
}
