/**
 * NewProjectDialog Component
 * Dialog for creating a new project folder
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
import { useProjectStore } from '@/stores/projectStore';
import { createDirectory, openProject } from '@/services/tauriCommands';
import { Loader2, FolderPlus, AlertCircle, CheckCircle2 } from 'lucide-react';

interface NewProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectFolder?: () => void;
}

export function NewProjectDialog({ open, onOpenChange, onSelectFolder }: NewProjectDialogProps) {
  const { setProject } = useProjectStore();
  const [name, setName] = useState('');
  const [parentPath, setParentPath] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [createdPath, setCreatedPath] = useState<string | null>(null);

  const handleCreate = useCallback(async () => {
    if (!name.trim() || !parentPath.trim()) return;

    setIsCreating(true);
    setError(null);
    setSuccess(false);

    try {
      // Create the project directory
      const projectPath = `${parentPath.replace(/[\\/]+$/, '')}/${name.trim()}`;
      
      await createDirectory(projectPath);
      setCreatedPath(projectPath);

      // Open the project - it will be uninitialized and show the initialization guide
      try {
        const newProject = await openProject(projectPath);
        setProject(newProject);
        setSuccess(true);
        
        // Auto-close dialog after successful creation and switch
        setTimeout(() => {
          onOpenChange(false);
          resetForm();
        }, 500);
      } catch (openErr) {
        // Project created but couldn't open - still a partial success
        console.warn('Project created but could not auto-open:', openErr);
        setError(`Project folder created at ${projectPath}, but failed to open: ${openErr}`);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsCreating(false);
    }
  }, [name, parentPath, setProject, onOpenChange]);

  const resetForm = () => {
    setName('');
    setParentPath('');
    setError(null);
    setSuccess(false);
    setCreatedPath(null);
  };

  const handleClose = () => {
    if (!isCreating) {
      onOpenChange(false);
      resetForm();
    }
  };

  const handleBrowse = () => {
    // Use the file picker if available
    if (onSelectFolder) {
      onSelectFolder();
    }
  };

  const isValid = name.trim().length > 0 && parentPath.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderPlus className="h-5 w-5" />
            Create New Project
          </DialogTitle>
          <DialogDescription>
            Create a new project folder. You'll need to initialize it with <code className="text-xs bg-muted px-1 rounded">specify init .</code> to set it up, and <code className="text-xs bg-muted px-1 rounded">git init</code> if you want to track it in git.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="project-name" className="text-sm font-medium">Project Name</label>
            <Input
              id="project-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., my-new-project"
              disabled={isCreating || success}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="parent-path" className="text-sm font-medium">Parent Directory</label>
            <div className="flex gap-2">
              <Input
                id="parent-path"
                value={parentPath}
                onChange={(e) => setParentPath(e.target.value)}
                placeholder="e.g., C:/Users/me/projects"
                disabled={isCreating || success}
                className="flex-1"
              />
              {onSelectFolder && (
                <Button
                  variant="outline"
                  onClick={handleBrowse}
                  disabled={isCreating || success}
                >
                  Browse
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              The project folder will be created inside this directory.
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="font-medium">Failed to create project</p>
                <p className="text-xs mt-1 opacity-90">{error}</p>
              </div>
            </div>
          )}

          {success && createdPath && (
            <div className="flex items-center gap-2 p-3 rounded-md bg-success/10 text-success text-sm">
              <CheckCircle2 className="h-4 w-4" />
              <span>Project created and initialized! Switching to it now...</span>
            </div>
          )}
        </div>

        <DialogFooter>
          {success ? (
            <Button onClick={handleClose}>
              Done
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!isValid || isCreating}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <FolderPlus className="h-4 w-4 mr-2" />
                    Create Project
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
