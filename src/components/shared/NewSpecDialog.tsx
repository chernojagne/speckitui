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
import { useFeatureEnvStore } from '@/stores/featureEnvStore';
import { executeShellScript, openProject } from '@/services/tauriCommands';
import { Loader2, Plus, AlertCircle, CheckCircle2 } from 'lucide-react';

interface CreateFeatureJsonOutput {
  BRANCH_NAME: string;
  SPEC_FILE: string;
  FEATURE_NUM: string | number;
}

interface NewSpecDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewSpecDialog({ open, onOpenChange }: NewSpecDialogProps) {
  const { project, setProject, setActiveSpec } = useProjectStore();
  const { setFromScriptOutput } = useFeatureEnvStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleCreate = useCallback(async () => {
    if (!project || !description.trim()) return;

    setIsCreating(true);
    setError(null);
    setSuccess(false);

    try {
      // Execute the create-new-feature.sh script with --json option
      // The script expects: --json [--short-name <short-name>] <feature description>
      const scriptPath = '.specify/scripts/bash/create-new-feature.sh';
      const args: string[] = ['--json'];
      
      // Add optional short-name if provided
      if (name.trim()) {
        args.push('--short-name', name.trim());
      }
      
      // Add required description
      args.push(description.trim());

      const result = await executeShellScript(scriptPath, args, project.path);

      if (result.exitCode !== 0) {
        // Check for common errors and provide helpful messages
        const errorOutput = result.stderr || result.stdout || '';
        if (errorOutput.includes('No such file or directory') && errorOutput.includes('create-new-feature')) {
          throw new Error('The create-new-feature.sh script is missing. Please run "npx specify init ." in your project folder to set up the speckit environment.');
        }
        throw new Error(errorOutput || 'Script execution failed');
      }

      // Parse JSON output from the script
      try {
        const jsonOutput: CreateFeatureJsonOutput = JSON.parse(result.stdout.trim());
        
        // Set feature environment variables in the store (pass repoPath for context file)
        setFromScriptOutput(jsonOutput, project.path);
        
        console.log('[NewSpecDialog] Feature created with JSON output:', jsonOutput);
      } catch (parseError) {
        console.warn('[NewSpecDialog] Could not parse JSON output, script may not support --json:', parseError);
        // Continue even if JSON parsing fails - the feature was still created
      }

      setSuccess(true);

      // Refresh project to get new spec list
      const updatedProject = await openProject(project.path);
      setProject(updatedProject);

      // Try to find and select the new spec (select the newest one - highest number)
      if (updatedProject.specInstances.length > 0) {
        // The new spec should be the one with the highest number
        const sortedSpecs = [...updatedProject.specInstances].sort((a, b) => b.number - a.number);
        const newSpec = sortedSpecs[0];
        setActiveSpec(newSpec);
      }

      // Close dialog after a brief delay to show success
      setTimeout(() => {
        onOpenChange(false);
        resetForm();
      }, 1500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      // Check for script not found error and provide helpful message
      if (errorMessage.includes('SCRIPT_NOT_FOUND') || 
          (errorMessage.includes('No such file or directory') && errorMessage.includes('create-new-feature'))) {
        setError('The create-new-feature.sh script is missing. Please run "npx specify init ." in your project folder to set up the speckit environment.');
      } else {
        setError(errorMessage);
      }
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

  const isValid = description.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Spec-Kit Feature Spec
          </DialogTitle>
          <DialogDescription>
            Create a new skeleton feature specification using Spec-Kit scripts.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="spec-name" className="text-sm font-medium">Short Name (Optional)</label>
            <Input
              id="spec-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., user-authentication"
              disabled={isCreating}
            />
            <p className="text-xs text-muted-foreground">
              Max 3 words, lowercase with hyphens. If omitted, it will be generated from the description.
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="spec-description" className="text-sm font-medium">Feature Description</label>
            <Textarea
              id="spec-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this feature will do..."
              rows={3}
              disabled={isCreating}
              autoFocus
            />
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
