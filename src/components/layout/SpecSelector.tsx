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
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Plus } from 'lucide-react';
import { createSpec, getSpecInstances } from '@/services/tauriCommands';

export function SpecSelector() {
  const { project, activeSpec, setActiveSpec, setProject } = useProjectStore();
  const { updateContentStatus } = useWorkflowStore();
  const { setLastProject } = useSettingsStore();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newSpecName, setNewSpecName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleCreateSpec = async () => {
    if (!newSpecName.trim()) {
      setError('Please enter a spec name');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      await createSpec(project.path, newSpecName.trim());
      
      // Refresh spec instances
      const specs = await getSpecInstances(project.path);
      setProject({ ...project, specInstances: specs });
      
      // Select the new spec
      const newSpec = specs.find((s) => s.shortName === newSpecName.trim().toLowerCase().replace(/\s+/g, '-'));
      if (newSpec) {
        setActiveSpec(newSpec);
        updateContentStatus(newSpec.artifacts);
        setLastProject(project.path, newSpec.id);
      }
      
      setIsDialogOpen(false);
      setNewSpecName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsCreating(false);
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Spec</DialogTitle>
            <DialogDescription>
              Enter a name for your new spec. It will be created in the specs/ directory.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Input
              value={newSpecName}
              onChange={(e) => setNewSpecName(e.target.value)}
              placeholder="e.g., user-authentication"
              disabled={isCreating}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreateSpec();
                }
              }}
            />
            {error && (
              <p className="text-sm text-destructive mt-2">{error}</p>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setNewSpecName('');
                setError(null);
              }}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateSpec}
              disabled={isCreating || !newSpecName.trim()}
            >
              {isCreating ? 'Creating...' : 'Create Spec'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
