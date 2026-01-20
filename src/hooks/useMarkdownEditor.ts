/**
 * useMarkdownEditor Hook
 * Manages editing state for markdown files with save/cancel functionality
 * Part of 005-ui-enhancements feature
 */

import { useState, useCallback, useEffect } from 'react';
import { useEditorStore } from '@/stores/editorStore';
import { writeFile, readArtifact } from '@/services/tauriCommands';

interface UseMarkdownEditorOptions {
  /** Unique identifier for this artifact */
  artifactId: string;
  /** Path to the markdown file */
  filePath: string;
  /** Initial content (optional, will load from file if not provided) */
  initialContent?: string;
  /** Callback when content is saved */
  onSave?: (content: string) => void;
  /** Callback when content changes externally */
  onExternalChange?: (content: string) => void;
}

interface UseMarkdownEditorReturn {
  /** Current content (edited or original) */
  content: string;
  /** Original content from file */
  originalContent: string;
  /** Whether in edit mode */
  isEditing: boolean;
  /** Whether there are unsaved changes */
  hasUnsavedChanges: boolean;
  /** Whether currently saving */
  isSaving: boolean;
  /** Whether currently loading */
  isLoading: boolean;
  /** Error message if any */
  error: string | null;
  /** Enter edit mode */
  startEditing: () => void;
  /** Exit edit mode without saving */
  cancelEditing: () => void;
  /** Update content while editing */
  updateContent: (newContent: string) => void;
  /** Save current content to file */
  saveContent: () => Promise<boolean>;
  /** Reload content from file */
  reloadContent: () => Promise<void>;
}

export function useMarkdownEditor({
  artifactId,
  filePath,
  initialContent,
  onSave,
  onExternalChange,
}: UseMarkdownEditorOptions): UseMarkdownEditorReturn {
  // Local state
  const [originalContent, setOriginalContent] = useState(initialContent || '');
  const [editedContent, setEditedContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(!initialContent);
  const [error, setError] = useState<string | null>(null);

  // Global editor store
  const storeUpdateContent = useEditorStore((state) => state.updateContent);
  const storeClearUnsavedChanges = useEditorStore((state) => state.clearUnsavedChanges);
  const storeGetUnsavedContent = useEditorStore((state) => state.getUnsavedContent);
  const storeSetActiveArtifact = useEditorStore((state) => state.setActiveArtifact);

  // Check for unsaved changes in store
  const unsavedFromStore = storeGetUnsavedContent(artifactId);
  const hasUnsavedChanges = isEditing && editedContent !== originalContent;

  // Current content to display
  const content = isEditing ? editedContent : originalContent;

  // Load content from file
  const loadContent = useCallback(async () => {
    if (!filePath) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const result = await readArtifact(filePath);
      setOriginalContent(result.content);
      
      // If we have unsaved changes in store, restore them
      if (unsavedFromStore) {
        setEditedContent(unsavedFromStore);
        setIsEditing(true);
      }
    } catch (err) {
      // File might not exist, that's ok
      setOriginalContent('');
      setError(err instanceof Error ? err.message : 'Failed to load file');
    } finally {
      setIsLoading(false);
    }
  }, [filePath, unsavedFromStore]);

  // Load on mount
  useEffect(() => {
    if (!initialContent) {
      loadContent();
    }
  }, [initialContent, loadContent]);

  // Start editing
  const startEditing = useCallback(() => {
    setIsEditing(true);
    setEditedContent(originalContent);
    storeSetActiveArtifact(artifactId);
  }, [originalContent, artifactId, storeSetActiveArtifact]);

  // Cancel editing
  const cancelEditing = useCallback(() => {
    setIsEditing(false);
    setEditedContent('');
    storeClearUnsavedChanges(artifactId);
    storeSetActiveArtifact(null);
  }, [artifactId, storeClearUnsavedChanges, storeSetActiveArtifact]);

  // Update content while editing
  const updateContent = useCallback((newContent: string) => {
    setEditedContent(newContent);
    storeUpdateContent(artifactId, newContent);
  }, [artifactId, storeUpdateContent]);

  // Save content
  const saveContent = useCallback(async (): Promise<boolean> => {
    if (!filePath || !isEditing) return false;

    setIsSaving(true);
    setError(null);

    try {
      await writeFile(filePath, editedContent);
      setOriginalContent(editedContent);
      setIsEditing(false);
      setEditedContent('');
      storeClearUnsavedChanges(artifactId);
      storeSetActiveArtifact(null);
      onSave?.(editedContent);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save file');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [filePath, isEditing, editedContent, artifactId, storeClearUnsavedChanges, storeSetActiveArtifact, onSave]);

  // Reload content from file
  const reloadContent = useCallback(async () => {
    await loadContent();
    onExternalChange?.(originalContent);
  }, [loadContent, originalContent, onExternalChange]);

  return {
    content,
    originalContent,
    isEditing,
    hasUnsavedChanges,
    isSaving,
    isLoading,
    error,
    startEditing,
    cancelEditing,
    updateContent,
    saveContent,
    reloadContent,
  };
}
