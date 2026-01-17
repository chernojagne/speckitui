/**
 * ProgressIndicator Component
 * Shows completion status (X/Y complete, percentage)
 */

import './ProgressIndicator.css';

interface ProgressIndicatorProps {
  completed: number;
  total: number;
  showPercentage?: boolean;
  showCounts?: boolean;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export function ProgressIndicator({
  completed,
  total,
  showPercentage = true,
  showCounts = true,
  size = 'md',
  label,
}: ProgressIndicatorProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const isComplete = completed === total && total > 0;

  return (
    <div className={`progress-indicator progress-indicator--${size}`}>
      {label && <span className="progress-label">{label}</span>}
      
      <div className="progress-bar-container">
        <div
          className={`progress-bar-fill ${isComplete ? 'complete' : ''}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="progress-stats">
        {showCounts && (
          <span className="progress-counts">
            {completed}/{total}
          </span>
        )}
        {showPercentage && (
          <span className={`progress-percentage ${isComplete ? 'complete' : ''}`}>
            {percentage}%
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * Compact inline progress indicator
 */
export function ProgressBadge({
  completed,
  total,
}: {
  completed: number;
  total: number;
}) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const isComplete = percentage === 100;

  return (
    <span className={`progress-badge ${isComplete ? 'complete' : ''}`}>
      {completed}/{total}
    </span>
  );
}
