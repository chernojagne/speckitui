/**
 * StatusCheckList Component
 * Displays CI/CD status checks for a pull request
 */

import './StatusCheckList.css';

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
    <div className={`status-check-list status-${overallStatus}`}>
      <div className="status-check-header">
        <span className="status-check-title">{title}</span>
        <span className="status-check-summary">
          {successCount > 0 && <span className="count success">{successCount} passed</span>}
          {failureCount > 0 && <span className="count failure">{failureCount} failed</span>}
          {pendingCount > 0 && <span className="count pending">{pendingCount} pending</span>}
        </span>
      </div>

      <div className="status-check-items">
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
  const icon = getStatusIcon(check.status);

  return (
    <div className={`status-check-item status-${check.status}`}>
      <span className="status-icon">{icon}</span>
      <span className="status-name">{check.name}</span>
      {check.detailsUrl && (
        <a
          href={check.detailsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="status-details-link"
        >
          Details
        </a>
      )}
    </div>
  );
}

function getStatusIcon(status: StatusCheck['status']): string {
  switch (status) {
    case 'success':
      return '✓';
    case 'failure':
    case 'error':
      return '✗';
    case 'pending':
      return '○';
    case 'running':
      return '◐';
    case 'skipped':
      return '⊘';
    default:
      return '?';
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
    return <span className="status-badge failure">✗ {failureCount} failed</span>;
  }
  if (pendingCount > 0) {
    return <span className="status-badge pending">◐ {pendingCount} running</span>;
  }
  if (successCount > 0) {
    return <span className="status-badge success">✓ All passed</span>;
  }
  return null;
}
