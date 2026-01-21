/**
 * EditableMarkdownView Component
 * Reusable component for displaying and editing markdown files
 * Part of 005-ui-enhancements feature
 */

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { MarkdownRenderer } from './MarkdownRenderer';
import { MarkdownEditor } from './MarkdownEditor';
import { LoadingSpinner } from './LoadingSpinner';
import { useMarkdownEditor } from '@/hooks/useMarkdownEditor';
import { useArtifactWatcher } from '@/hooks/useFileWatcher';
import { Pencil } from 'lucide-react';

interface EditableMarkdownViewProps {
  /** Unique artifact ID for tracking */
  artifactId: string;
  /** File path to the markdown file */
  filePath: string;
  /** Initial content (optional - will load from file) */
  initialContent?: string;
  /** Whether to show the edit button in header */
  showEditButton?: boolean;
  /** Whether to allow checkbox toggling in view mode */
  allowCheckboxToggle?: boolean;
  /** Callback when checkbox is toggled */
  onCheckboxToggle?: (lineNumber: number, checked: boolean) => void;
  /** Custom header component */
  headerContent?: React.ReactNode;
  /** Class name for content wrapper */
  contentClassName?: string;
}

export function EditableMarkdownView({
  artifactId,
  filePath,
  initialContent,
  showEditButton = true,
  allowCheckboxToggle = false,
  onCheckboxToggle,
  headerContent,
  contentClassName = 'p-6',
}: EditableMarkdownViewProps) {
  const [localContent, setLocalContent] = useState<string | null>(initialContent ?? null);

  const editor = useMarkdownEditor({
    artifactId,
    filePath,
    initialContent,
  });

  // Sync initial content when provided
  useEffect(() => {
    if (initialContent !== undefined) {
      setLocalContent(initialContent);
    }
  }, [initialContent]);

  // File watcher for external changes
  const handleExternalChange = useCallback((changedPath: string, _kind: 'create' | 'modify' | 'delete' | 'rename') => {
    if (changedPath.includes(filePath.split('/').pop() || '') && !editor.isEditing) {
      editor.reloadContent();
    }
  }, [filePath, editor.isEditing, editor.reloadContent]);

  useArtifactWatcher(handleExternalChange);

  // Use editor content when available, otherwise use local content
  const displayContent = editor.content || localContent || '';

  if (editor.isLoading && !displayContent) {
    return <LoadingSpinner message="Loading..." />;
  }

  // Edit mode - show full editor
  if (editor.isEditing) {
    return (
      <MarkdownEditor
        content={editor.content}
        isEditing={editor.isEditing}
        hasUnsavedChanges={editor.hasUnsavedChanges}
        isSaving={editor.isSaving}
        error={editor.error}
        filePath={filePath}
        onStartEditing={editor.startEditing}
        onCancelEditing={editor.cancelEditing}
        onContentChange={editor.updateContent}
        onSave={editor.saveContent}
      />
    );
  }

  // View mode - show renderer with optional edit button
  return (
    <div className="flex flex-col h-full">
      {/* Header with edit button */}
      {(showEditButton || headerContent) && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card/50">
          <div className="flex items-center gap-2">
            {headerContent}
          </div>
          {showEditButton && (
            <Button
              variant="outline"
              size="sm"
              onClick={editor.startEditing}
              className="h-7 px-2"
            >
              <Pencil className="h-3.5 w-3.5 mr-1" />
              Edit
            </Button>
          )}
        </div>
      )}

      {/* Content */}
      <div className={`flex-1 overflow-y-auto ${contentClassName}`}>
        <MarkdownRenderer
          content={displayContent}
          filePath={filePath}
          onCheckboxToggle={allowCheckboxToggle ? onCheckboxToggle : undefined}
        />
      </div>
    </div>
  );
}
