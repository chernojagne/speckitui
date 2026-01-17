/**
 * ChecklistItem Component
 * Interactive checkbox item for markdown checklists
 */

import { useState, useCallback, memo } from 'react';
import './ChecklistItem.css';

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
      className={`checklist-item ${localChecked ? 'checked' : ''} ${isPending ? 'pending' : ''} ${disabled ? 'disabled' : ''}`}
    >
      <input
        type="checkbox"
        checked={localChecked}
        onChange={handleChange}
        disabled={disabled || isPending}
        className="checklist-checkbox"
      />
      <span className="checklist-text">
        {taskId && <span className="task-id">{taskId}</span>}
        <span className="task-text">{text.replace(/^\[?T\d+\]?\s*/, '')}</span>
      </span>
      {isPending && <span className="pending-indicator" />}
    </label>
  );
});
