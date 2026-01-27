import { useState, useEffect, useMemo, useCallback } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import { readArtifact, updateCheckbox } from '@/services/tauriCommands';
import { MarkdownRenderer } from '../shared/MarkdownRenderer';
import { MarkdownEditor } from '../shared/MarkdownEditor';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { EmptyState } from '../shared/EmptyState';
import { useMarkdownEditor } from '@/hooks/useMarkdownEditor';
import { useArtifactWatcher } from '@/hooks/useFileWatcher';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckSquare, Pencil } from 'lucide-react';

interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  percentComplete: number;
}

export function TasksView() {
  const { activeSpec } = useProjectStore();
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filePath = activeSpec ? `${activeSpec.path}/tasks.md` : null;

  const editor = useMarkdownEditor({
    artifactId: 'tasks',
    filePath: filePath || '',
    initialContent: content ?? undefined,
  });

  // Sync editor content with local state when loading completes
  useEffect(() => {
    if (content && !editor.content) {
      // Initial load - content will be synced via initialContent
    }
  }, [content, editor.content]);

  // File watcher for external changes
  const handleExternalChange = useCallback((changedPath: string, _kind: 'create' | 'modify' | 'delete' | 'rename') => {
    if (filePath && changedPath.includes('tasks.md') && !editor.isEditing) {
      loadTasks();
    }
  }, [filePath, editor.isEditing]);

  useArtifactWatcher(handleExternalChange);

  const loadTasks = async () => {
    if (!activeSpec || !activeSpec.artifacts.hasTasks || !filePath) {
      setContent(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await readArtifact(filePath);
      setContent(result.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [activeSpec, filePath]);

  // Calculate task statistics
  const stats: TaskStats = useMemo(() => {
    if (!content) {
      return { total: 0, completed: 0, pending: 0, percentComplete: 0 };
    }

    const lines = content.split('\n');
    let total = 0;
    let completed = 0;

    for (const line of lines) {
      const match = line.match(/^(\s*)-\s*\[([ xX])\]/);
      if (match) {
        total++;
        if (match[2].toLowerCase() === 'x') {
          completed++;
        }
      }
    }

    return {
      total,
      completed,
      pending: total - completed,
      percentComplete: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [content]);

  const handleCheckboxToggle = async (lineNumber: number, checked: boolean) => {
    if (!filePath || editor.isEditing) return;

    try {
      await updateCheckbox({ filePath, lineNumber, checked });
      // Reload content after update
      const result = await readArtifact(filePath);
      setContent(result.content);
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  // Handle editor save - reload content after save
  const handleSave = async (): Promise<boolean> => {
    const success = await editor.saveContent();
    if (success) {
      // Reload to update stats
      await loadTasks();
    }
    return success;
  };

  if (loading) {
    return <LoadingSpinner message="Loading tasks..." />;
  }

  if (error) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Error Loading Tasks"
        description={error}
      />
    );
  }

  if (!content) {
    return (
      <EmptyState
        icon={CheckSquare}
        title="No Tasks"
        description="This spec instance has no tasks.md yet."
        hint="Run: speckit tasks"
      />
    );
  }

  // Edit mode - show editor
  if (editor.isEditing) {
    return (
      <MarkdownEditor
        content={editor.content}
        isEditing={editor.isEditing}
        hasUnsavedChanges={editor.hasUnsavedChanges}
        isSaving={editor.isSaving}
        error={editor.error}
        filePath={filePath || ''}
        onStartEditing={editor.startEditing}
        onCancelEditing={editor.cancelEditing}
        onContentChange={editor.updateContent}
        onSave={handleSave}
      />
    );
  }

  // Use editor content when in editing flow, otherwise use local content
  const displayContent = editor.content || content;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Progress bar with edit button */}
      <div className="flex items-center gap-4 p-4 bg-card border-b border-border flex-shrink-0">
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>
            <strong className="text-foreground">{stats.completed}</strong> / {stats.total} completed
          </span>
          <span className="text-warning">
            {stats.pending} pending
          </span>
        </div>
        <div className="flex-1 h-2 bg-muted rounded-lg overflow-hidden">
          <div
            className="h-full bg-success transition-[width]"
            style={{ width: `${stats.percentComplete}%` }}
          />
        </div>
        <span className="text-sm font-semibold text-success min-w-[40px] text-right">{stats.percentComplete}%</span>
        <Button
          variant="outline"
          size="sm"
          onClick={editor.startEditing}
          className="h-7 px-2 ml-2"
        >
          <Pencil className="h-3.5 w-3.5 mr-1" />
          Edit
        </Button>
      </div>

      {/* Task content */}
      <div className="flex-1 overflow-auto p-6">
        <MarkdownRenderer
          content={displayContent}
          filePath={filePath ?? undefined}
          onCheckboxToggle={handleCheckboxToggle}
        />
      </div>
    </div>
  );
}
