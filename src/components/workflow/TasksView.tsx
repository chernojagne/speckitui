import { useState, useEffect, useMemo } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import { readArtifact, updateCheckbox } from '@/services/tauriCommands';
import { MarkdownRenderer } from '../shared/MarkdownRenderer';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { EmptyState } from '../shared/EmptyState';
import { AlertTriangle, CheckSquare } from 'lucide-react';

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

  useEffect(() => {
    if (!activeSpec || !activeSpec.artifacts.hasTasks) {
      setContent(null);
      setLoading(false);
      return;
    }

    const loadTasks = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await readArtifact(filePath!);
        setContent(result.content);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

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
    if (!filePath) return;

    try {
      await updateCheckbox({ filePath, lineNumber, checked });
      // Reload content after update
      const result = await readArtifact(filePath);
      setContent(result.content);
    } catch (err) {
      console.error('Failed to update task:', err);
    }
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

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Progress bar */}
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
      </div>

      {/* Task content */}
      <div className="flex-1 overflow-auto p-6">
        <MarkdownRenderer
          content={content}
          filePath={filePath ?? undefined}
          onCheckboxToggle={handleCheckboxToggle}
        />
      </div>
    </div>
  );
}
