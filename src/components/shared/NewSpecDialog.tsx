/**
 * NewSpecDialog Component
 * Dialog for creating a new feature spec with name and description
 * Part of 005-ui-enhancements feature
 */

import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useProjectStore } from '@/stores/projectStore';
import { executeShellScript, openProject } from '@/services/tauriCommands';
import { Loader2, Plus, AlertCircle, CheckCircle2 } from 'lucide-react';

interface NewSpecDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewSpecDialog({ open, onOpenChange }: NewSpecDialogProps) {
  const { project, setProject, setActiveSpec } = useProjectStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleCreate = useCallback(async () => {
    if (!project || !name.trim()) return;

    setIsCreating(true);
    setError(null);
    setSuccess(false);

    try {
      // Execute the create-new-feature.sh script
      // The script expects: feature-name "Feature description"
      const scriptPath = '.specify/scripts/bash/create-new-feature.sh';
      const args = [name.trim()];
      if (description.trim()) {
        args.push(description.trim());
      }

      const result = await executeShellScript(scriptPath, args, project.path);

      if (result.exitCode !== 0) {
        throw new Error(result.stderr || result.stdout || 'Script execution failed');
      }

      setSuccess(true);

      // Refresh project to get new spec list
      const updatedProject = await openProject(project.path);
      setProject(updatedProject);

      // Try to find and select the new spec
      const newSpecName = name.trim().toLowerCase().replace(/\s+/g, '-');
      const newSpec = updatedProject.specInstances.find(
        (spec) => spec.shortName.toLowerCase().includes(newSpecName)
      );
      if (newSpec) {
        setActiveSpec(newSpec);
      }

      // Close dialog after a brief delay to show success
      setTimeout(() => {
        onOpenChange(false);
        resetForm();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsCreating(false);
    }
  }, [project, name, description, setProject, setActiveSpec, onOpenChange]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setError(null);
    setSuccess(false);
  };

  const handleClose = () => {
    if (!isCreating) {
      onOpenChange(false);
      resetForm();
    }
  };

  const isValid = name.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Feature Spec
          </DialogTitle>
          <DialogDescription>
            Create a new feature specification with its own branch and directory structure.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="spec-name" className="text-sm font-medium">Feature Name</label>
            <Input
              id="spec-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., user-authentication"
              disabled={isCreating}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              Use lowercase with hyphens. This will be used for the directory and branch name.
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="spec-description" className="text-sm font-medium">Description (Optional)</label>
            <Textarea
              id="spec-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this feature will do..."
              rows={3}
              disabled={isCreating}
            />
            <p className="text-xs text-muted-foreground">
              This will be added to the description.md file.
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="font-medium">Failed to create spec</p>
                <p className="text-xs mt-1 opacity-90">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3 rounded-md bg-success/10 text-success text-sm">
              <CheckCircle2 className="h-4 w-4" />
              <span>Feature spec created successfully!</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!isValid || isCreating || success}
          >
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Create Spec
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
