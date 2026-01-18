/**
 * StatusCheckList Component
 * Displays CI/CD status checks for a pull request
 */

import { cn } from '@/lib/utils';
import { Check, X, Circle, Loader2, Ban, HelpCircle, CheckCircle, XCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface StatusCheck {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'success' | 'failure' | 'error' | 'skipped';
  conclusion?: string;
  detailsUrl?: string;
  startedAt?: string;
  completedAt?: string;
}

interface StatusCheckListProps {
  checks: StatusCheck[];
  title?: string;
}

export function StatusCheckList({ checks, title = 'Status Checks' }: StatusCheckListProps) {
  if (checks.length === 0) {
    return null;
  }

  const successCount = checks.filter((c) => c.status === 'success').length;
  const failureCount = checks.filter((c) => c.status === 'failure' || c.status === 'error').length;
  const pendingCount = checks.filter((c) => c.status === 'pending' || c.status === 'running').length;

  const overallStatus = failureCount > 0 ? 'failure' : pendingCount > 0 ? 'pending' : 'success';

  return (
    <div className={cn(
      "border border-border rounded-md overflow-hidden",
      overallStatus === 'success' && "border-success/50",
      overallStatus === 'failure' && "border-destructive/50",
      overallStatus === 'pending' && "border-warning/50"
    )}>
      <div className="flex items-center justify-between px-3 py-2.5 bg-muted border-b border-border">
        <span className="font-semibold text-[13px] text-foreground">{title}</span>
        <span className="flex gap-3 text-xs">
          {successCount > 0 && <span className="font-medium text-success">{successCount} passed</span>}
          {failureCount > 0 && <span className="font-medium text-destructive">{failureCount} failed</span>}
          {pendingCount > 0 && <span className="font-medium text-warning">{pendingCount} pending</span>}
        </span>
      </div>

      <div className="p-2">
        {checks.map((check) => (
          <StatusCheckItem key={check.id} check={check} />
        ))}
      </div>
    </div>
  );
}

interface StatusCheckItemProps {
  check: StatusCheck;
}

function StatusCheckItem({ check }: StatusCheckItemProps) {
  const IconComponent = getStatusIcon(check.status);

  return (
    <div className={cn(
      "flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-muted"
    )}>
      <span className={cn(
        "w-[18px] h-[18px] flex items-center justify-center text-xs font-semibold rounded-full",
        check.status === 'success' && "text-success bg-success/15",
        (check.status === 'failure' || check.status === 'error') && "text-destructive bg-destructive/15",
        check.status === 'pending' && "text-warning bg-warning/15",
        check.status === 'running' && "text-primary bg-primary/15",
        check.status === 'skipped' && "text-muted-foreground bg-muted"
      )}>
        <IconComponent className={cn("h-3 w-3", check.status === 'running' && "animate-spin")} />
      </span>
      <span className="flex-1 text-[13px] text-foreground">{check.name}</span>
      {check.detailsUrl && (
        <a
          href={check.detailsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary no-underline hover:underline"
        >
          Details
        </a>
      )}
    </div>
  );
}

function getStatusIcon(status: StatusCheck['status']): LucideIcon {
  switch (status) {
    case 'success':
      return Check;
    case 'failure':
    case 'error':
      return X;
    case 'pending':
      return Circle;
    case 'running':
      return Loader2;
    case 'skipped':
      return Ban;
    default:
      return HelpCircle;
  }
}

/**
 * Compact status indicator for PR list items
 */
export function StatusCheckBadge({ checks }: { checks: StatusCheck[] }) {
  const successCount = checks.filter((c) => c.status === 'success').length;
  const failureCount = checks.filter((c) => c.status === 'failure' || c.status === 'error').length;
  const pendingCount = checks.filter((c) => c.status === 'pending' || c.status === 'running').length;

  if (failureCount > 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-full text-destructive bg-destructive/15">
        <XCircle className="h-3 w-3" /> {failureCount} failed
      </span>
    );
  }
  if (pendingCount > 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-full text-warning bg-warning/15">
        <Loader2 className="h-3 w-3 animate-spin" /> {pendingCount} running
      </span>
    );
  }
  if (successCount > 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-full text-success bg-success/15">
        <CheckCircle className="h-3 w-3" /> All passed
      </span>
    );
  }
  return null;
}
