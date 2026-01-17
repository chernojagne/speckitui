/**
 * LoadingSkeleton Component
 * Animated placeholder for loading states
 */

import './LoadingSkeleton.css';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  variant?: 'text' | 'rect' | 'circle';
  animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({
  width,
  height,
  className = '',
  variant = 'text',
  animation = 'pulse',
}: SkeletonProps) {
  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div
      className={`skeleton skeleton--${variant} skeleton--${animation} ${className}`}
      style={style}
    />
  );
}

/**
 * Pre-built skeleton layouts
 */

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="skeleton-text">
      {Array.from({ length: lines }).map((_, idx) => (
        <Skeleton
          key={idx}
          variant="text"
          width={idx === lines - 1 ? '70%' : '100%'}
        />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <Skeleton variant="rect" height={120} />
      <div className="skeleton-card-content">
        <Skeleton variant="text" width="80%" />
        <Skeleton variant="text" width="60%" />
      </div>
    </div>
  );
}

export function SkeletonListItem() {
  return (
    <div className="skeleton-list-item">
      <Skeleton variant="circle" width={40} height={40} />
      <div className="skeleton-list-item-content">
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="40%" height={12} />
      </div>
    </div>
  );
}

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="skeleton-list">
      {Array.from({ length: count }).map((_, idx) => (
        <SkeletonListItem key={idx} />
      ))}
    </div>
  );
}

export function SkeletonMarkdown() {
  return (
    <div className="skeleton-markdown">
      <Skeleton variant="text" width="40%" height={28} />
      <div style={{ height: '1rem' }} />
      <SkeletonText lines={4} />
      <div style={{ height: '1.5rem' }} />
      <Skeleton variant="text" width="30%" height={20} />
      <div style={{ height: '0.5rem' }} />
      <SkeletonText lines={3} />
      <div style={{ height: '1rem' }} />
      <Skeleton variant="rect" height={100} />
      <div style={{ height: '1rem' }} />
      <SkeletonText lines={2} />
    </div>
  );
}

export function SkeletonNavPane() {
  return (
    <div className="skeleton-nav-pane">
      {Array.from({ length: 8 }).map((_, idx) => (
        <div key={idx} className="skeleton-nav-item">
          <Skeleton variant="circle" width={24} height={24} />
          <Skeleton variant="text" width="70%" />
        </div>
      ))}
    </div>
  );
}
