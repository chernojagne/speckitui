/**
 * ProgressIndicator Component
 * Shows completion status (X/Y complete, percentage)
 */

interface ProgressIndicatorProps {
  completed: number;
  total: number;
  showPercentage?: boolean;
  showCounts?: boolean;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

const sizeClasses = {
  sm: {
    container: 'gap-2',
    bar: 'h-1',
    counts: 'text-xs',
    percentage: 'text-xs',
  },
  md: {
    container: 'gap-3',
    bar: 'h-1.5',
    counts: 'text-[0.8125rem]',
    percentage: 'text-sm',
  },
  lg: {
    container: 'gap-4',
    bar: 'h-2',
    counts: 'text-sm',
    percentage: 'text-base',
  },
};

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
  const classes = sizeClasses[size];

  return (
    <div className={`flex items-center ${classes.container}`}>
      {label && <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">{label}</span>}
      
      <div className={`flex-1 min-w-[60px] bg-muted rounded-sm overflow-hidden ${classes.bar}`}>
        <div
          className={`h-full rounded-sm transition-[width] duration-300 ${isComplete ? 'bg-success' : 'bg-primary'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex items-center gap-2 whitespace-nowrap">
        {showCounts && (
          <span className={`font-mono text-muted-foreground ${classes.counts}`}>
            {completed}/{total}
          </span>
        )}
        {showPercentage && (
          <span className={`font-semibold ${classes.percentage} ${isComplete ? 'text-success' : 'text-foreground'}`}>
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
    <span className={`inline-flex items-center justify-center font-mono text-xs font-medium px-2 py-0.5 rounded-full ${isComplete ? 'bg-success/15 text-success' : 'bg-muted text-muted-foreground'}`}>
      {completed}/{total}
    </span>
  );
}
