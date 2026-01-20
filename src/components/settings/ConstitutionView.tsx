/**
 * ConstitutionView Component
 * Displays and allows editing of constitution.md content
 * Part of 005-ui-enhancements feature
 */

import { useState, useEffect, useCallback } from 'react';
import { MarkdownEditor } from '@/components/shared/MarkdownEditor';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { useProjectStore } from '@/stores/projectStore';
import { useMarkdownEditor } from '@/hooks/useMarkdownEditor';
import { useArtifactWatcher } from '@/hooks/useFileWatcher';
import { readArtifact, writeFile, createDirectory } from '@/services/tauriCommands';
import { Plus, ScrollText } from 'lucide-react';

// Default constitution template for new files
const DEFAULT_CONSTITUTION = `# Project Constitution

## Core Principles

1. **Principle 1**: [Describe the first guiding principle]
2. **Principle 2**: [Describe the second guiding principle]
3. **Principle 3**: [Describe the third guiding principle]

## Development Guidelines

- [Add development guidelines here]

## Quality Standards

- [Add quality standards here]

---

*This constitution governs all development decisions for this project. Deviations require explicit justification.*
`;

export function ConstitutionView() {
  const [constitutionPath, setConstitutionPath] = useState<string | null>(null);
  const [fileExists, setFileExists] = useState<boolean | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  const project = useProjectStore((state) => state.project);

  // Determine the constitution path and check if it exists
  useEffect(() => {
    if (!project) {
      setConstitutionPath(null);
      setFileExists(null);
      return;
    }

    const checkConstitution = async () => {
      setLoadError(null);
      
      // Check .specify/memory/constitution.md first (standard location)
      const memoryPath = `${project.path}/.specify/memory/constitution.md`;
      try {
        await readArtifact(memoryPath);
        setConstitutionPath(memoryPath);
        setFileExists(true);
        return;
      } catch {
        // Not found at memory path
      }

      // Check .specify/constitution.md next
      const specifyPath = `${project.path}/.specify/constitution.md`;
      try {
        await readArtifact(specifyPath);
        setConstitutionPath(specifyPath);
        setFileExists(true);
        return;
      } catch {
        // Not found
      }

      // Check root constitution.md
      const rootPath = `${project.path}/constitution.md`;
      try {
        await readArtifact(rootPath);
        setConstitutionPath(rootPath);
        setFileExists(true);
        return;
      } catch {
        // Not found anywhere - use memory path as default location for new file
        setConstitutionPath(memoryPath);
        setFileExists(false);
      }
    };

    checkConstitution();
  }, [project]);

  // Use markdown editor hook when file exists
  const editor = useMarkdownEditor({
    artifactId: 'constitution',
    filePath: constitutionPath || '',
    onSave: () => {
      // Reload to confirm save was successful
    },
  });

  // File watcher for external changes  
  const handleExternalChange = useCallback((path: string) => {
    if (constitutionPath && path.includes('constitution.md') && fileExists && !editor.isEditing) {
      editor.reloadContent();
    }
  }, [constitutionPath, fileExists, editor.isEditing, editor.reloadContent]);
  
  useArtifactWatcher(handleExternalChange);

  // Create new constitution file
  const handleCreateConstitution = async () => {
    if (!constitutionPath) return;
    
    setIsCreating(true);
    try {
      // Ensure directory exists
      const dir = constitutionPath.substring(0, constitutionPath.lastIndexOf('/'));
      await createDirectory(dir);
      
      // Write default content
      await writeFile(constitutionPath, DEFAULT_CONSTITUTION);
      
      setFileExists(true);
      // Reload editor content
      await editor.reloadContent();
    } catch (error) {
      setLoadError(`Failed to create constitution: ${error}`);
    } finally {
      setIsCreating(false);
    }
  };

  // No project loaded
  if (!project) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <ScrollText className="h-12 w-12 mb-4 text-muted-foreground opacity-70" />
          <p className="my-1 text-foreground">Open a project to view its constitution</p>
        </div>
      </div>
    );
  }

  // Still checking for file
  if (fileExists === null || constitutionPath === null) {
    return (
      <div className="h-full flex flex-col">
        <LoadingSpinner message="Loading constitution..." />
      </div>
    );
  }

  // File doesn't exist - show create prompt
  if (!fileExists) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <ScrollText className="h-12 w-12 mb-4 text-muted-foreground opacity-70" />
          <p className="my-1 text-foreground font-medium">No constitution found</p>
          <p className="mt-2 text-[13px] text-muted-foreground max-w-[300px]">
            A constitution defines the core principles and guidelines for your project.
            Create one to establish consistent development practices.
          </p>
          {loadError && (
            <p className="mt-2 text-[13px] text-destructive">{loadError}</p>
          )}
          <Button
            onClick={handleCreateConstitution}
            disabled={isCreating}
            className="mt-6"
          >
            <Plus className="h-4 w-4 mr-2" />
            {isCreating ? 'Creating...' : 'Create Constitution'}
          </Button>
          <p className="mt-4 text-[11px] text-muted-foreground">
            Will be created at: <code className="text-[11px]">.specify/memory/constitution.md</code>
          </p>
        </div>
      </div>
    );
  }

  // Loading content
  if (editor.isLoading) {
    return (
      <div className="h-full flex flex-col">
        <LoadingSpinner message="Loading constitution..." />
      </div>
    );
  }

  // Show editor
  return (
    <div className="h-full flex flex-col">
      <MarkdownEditor
        content={editor.content}
        isEditing={editor.isEditing}
        hasUnsavedChanges={editor.hasUnsavedChanges}
        isSaving={editor.isSaving}
        error={editor.error}
        filePath={constitutionPath}
        placeholder="Enter your project constitution here..."
        onStartEditing={editor.startEditing}
        onCancelEditing={editor.cancelEditing}
        onContentChange={editor.updateContent}
        onSave={editor.saveContent}
      />
    </div>
  );
}
