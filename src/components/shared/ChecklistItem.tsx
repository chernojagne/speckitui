/**
 * ChecklistItem Component
 * Interactive checkbox item for markdown checklists
 */

import { useState, useCallback, memo } from 'react';

interface ChecklistItemProps {
  lineNumber: number;
  text: string;
  isChecked: boolean;
  taskId?: string;
  disabled?: boolean;
  onToggle: (lineNumber: number, checked: boolean) => Promise<void>;
}

export const ChecklistItem = memo(function ChecklistItem({
  lineNumber,
  text,
  isChecked,
  taskId,
  disabled = false,
  onToggle,
}: ChecklistItemProps) {
  const [isPending, setIsPending] = useState(false);
  const [localChecked, setLocalChecked] = useState(isChecked);

  const handleChange = useCallback(async () => {
    if (disabled || isPending) return;

    const newChecked = !localChecked;
    
    // Optimistic update
    setLocalChecked(newChecked);
    setIsPending(true);

    try {
      await onToggle(lineNumber, newChecked);
    } catch (err) {
      // Revert on error
      setLocalChecked(!newChecked);
      console.error('Failed to toggle checkbox:', err);
    } finally {
      setIsPending(false);
    }
  }, [disabled, isPending, localChecked, lineNumber, onToggle]);

  // Sync local state with props when they change
  if (isChecked !== localChecked && !isPending) {
    setLocalChecked(isChecked);
  }

  return (
    <label
      className={`flex items-start gap-2 py-1.5 px-2 my-0.5 rounded-sm cursor-pointer transition-colors
        ${!disabled ? 'hover:bg-muted' : ''}
        ${localChecked ? 'text-muted-foreground' : ''}
        ${isPending ? 'opacity-70' : ''}
        ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
    >
      <input
        type="checkbox"
        checked={localChecked}
        onChange={handleChange}
        disabled={disabled || isPending}
        className="w-[18px] h-[18px] min-w-[18px] mt-0.5 cursor-inherit accent-primary disabled:cursor-not-allowed"
      />
      <span className="flex flex-wrap items-baseline gap-1.5 leading-relaxed">
        {taskId && (
          <span className="font-mono text-xs font-semibold text-primary bg-muted px-1.5 py-0.5 rounded-sm whitespace-nowrap">
            {taskId}
          </span>
        )}
        <span className={`flex-1 min-w-0 break-words ${localChecked ? 'line-through opacity-70' : ''}`}>
          {text.replace(/^\[?T\d+\]?\s*/, '')}
        </span>
      </span>
      {isPending && (
        <span className="w-3 h-3 border-2 border-border border-t-primary rounded-full animate-spin ml-auto" />
      )}
    </label>
  );
});
