/**
 * MarkdownEditor Component
 * Reusable markdown editor with edit/preview toggle
 * Part of 005-ui-enhancements feature
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MarkdownRenderer } from '@/components/shared/MarkdownRenderer';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Pencil, Eye, Save, X, Loader2 } from 'lucide-react';

interface MarkdownEditorProps {
  /** Current content to display/edit */
  content: string;
  /** Whether in edit mode */
  isEditing: boolean;
  /** Whether there are unsaved changes */
  hasUnsavedChanges: boolean;
  /** Whether currently saving */
  isSaving: boolean;
  /** Error message if any */
  error?: string | null;
  /** File path (for checkbox updates in preview) */
  filePath?: string;
  /** Placeholder text for empty content */
  placeholder?: string;
  /** Called when edit button clicked */
  onStartEditing: () => void;
  /** Called when cancel button clicked */
  onCancelEditing: () => void;
  /** Called when content changes */
  onContentChange: (content: string) => void;
  /** Called when save button clicked */
  onSave: () => Promise<boolean>;
  /** Class name for container */
  className?: string;
  /** Show header with buttons */
  showHeader?: boolean;
}

export function MarkdownEditor({
  content,
  isEditing,
  hasUnsavedChanges,
  isSaving,
  error,
  filePath,
  placeholder = 'Start typing markdown content...',
  onStartEditing,
  onCancelEditing,
  onContentChange,
  onSave,
  className = '',
  showHeader = true,
}: MarkdownEditorProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<'cancel' | 'navigate' | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus textarea when entering edit mode
  useEffect(() => {
    if (isEditing && textareaRef.current && !showPreview) {
      textareaRef.current.focus();
    }
  }, [isEditing, showPreview]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isEditing) return;
      
      // Ctrl/Cmd + S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        onSave();
      }
      
      // Escape to cancel (with confirmation if unsaved)
      if (e.key === 'Escape') {
        e.preventDefault();
        handleCancelClick();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditing, hasUnsavedChanges, onSave]);

  const handleCancelClick = useCallback(() => {
    if (hasUnsavedChanges) {
      setPendingAction('cancel');
      setShowUnsavedDialog(true);
    } else {
      onCancelEditing();
    }
  }, [hasUnsavedChanges, onCancelEditing]);

  const handleConfirmDiscard = useCallback(() => {
    setShowUnsavedDialog(false);
    if (pendingAction === 'cancel') {
      onCancelEditing();
    }
    setPendingAction(null);
  }, [pendingAction, onCancelEditing]);

  const handleSaveAndClose = useCallback(async () => {
    const success = await onSave();
    if (success) {
      setShowUnsavedDialog(false);
      setPendingAction(null);
    }
  }, [onSave]);

  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* Header with action buttons */}
      {showHeader && (
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <div className="flex items-center gap-2">
            {isEditing && (
              <>
                <Button
                  variant={showPreview ? 'outline' : 'secondary'}
                  size="sm"
                  onClick={() => setShowPreview(false)}
                  className="h-7 px-2"
                >
                  <Pencil className="h-3.5 w-3.5 mr-1" />
                  Edit
                </Button>
                <Button
                  variant={showPreview ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => setShowPreview(true)}
                  className="h-7 px-2"
                >
                  <Eye className="h-3.5 w-3.5 mr-1" />
                  Preview
                </Button>
              </>
            )}
            {hasUnsavedChanges && (
              <span className="text-xs text-muted-foreground ml-2">
                • Unsaved changes
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelClick}
                  disabled={isSaving}
                  className="h-7 px-2"
                >
                  <X className="h-3.5 w-3.5 mr-1" />
                  Cancel
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={onSave}
                  disabled={isSaving || !hasUnsavedChanges}
                  className="h-7 px-2"
                >
                  {isSaving ? (
                    <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                  ) : (
                    <Save className="h-3.5 w-3.5 mr-1" />
                  )}
                  Save
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={onStartEditing}
                className="h-7 px-2"
              >
                <Pencil className="h-3.5 w-3.5 mr-1" />
                Edit
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="px-4 py-2 bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Content area */}
      <div className="flex-1 overflow-hidden">
        {isEditing && !showPreview ? (
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            placeholder={placeholder}
            className="h-full w-full resize-none border-0 rounded-none focus-visible:ring-0 font-mono text-sm p-4"
          />
        ) : (
          <div className="h-full overflow-y-auto p-4">
            {content ? (
              <MarkdownRenderer content={content} filePath={filePath} />
            ) : (
              <div className="text-muted-foreground text-sm italic">
                {placeholder}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Unsaved changes dialog */}
      <Dialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Unsaved Changes</DialogTitle>
            <DialogDescription>
              You have unsaved changes. Do you want to save them before closing?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowUnsavedDialog(false)}>
              Keep Editing
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDiscard}
            >
              Discard Changes
            </Button>
            <Button onClick={handleSaveAndClose}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
