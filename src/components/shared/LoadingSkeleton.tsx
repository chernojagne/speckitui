/**
 * LoadingSkeleton Component
 * Animated placeholder for loading states
 */

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  variant?: 'text' | 'rect' | 'circle';
  animation?: 'pulse' | 'wave' | 'none';
}

const variantClasses = {
  text: 'h-[1em] my-1',
  rect: 'w-full',
  circle: 'rounded-full',
};

const animationClasses = {
  pulse: 'animate-pulse',
  wave: 'relative overflow-hidden',
  none: '',
};

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
      className={`bg-muted rounded-sm ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
    />
  );
}

/**
 * Pre-built skeleton layouts
 */

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="flex flex-col gap-2">
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
    <div className="border border-border rounded-md overflow-hidden">
      <Skeleton variant="rect" height={120} />
      <div className="p-4 flex flex-col gap-2">
        <Skeleton variant="text" width="80%" />
        <Skeleton variant="text" width="60%" />
      </div>
    </div>
  );
}

export function SkeletonListItem() {
  return (
    <div className="flex items-center gap-3 py-3">
      <Skeleton variant="circle" width={40} height={40} />
      <div className="flex-1 flex flex-col gap-1">
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="40%" height={12} />
      </div>
    </div>
  );
}

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="flex flex-col">
      {Array.from({ length: count }).map((_, idx) => (
        <SkeletonListItem key={idx} />
      ))}
    </div>
  );
}

export function SkeletonMarkdown() {
  return (
    <div className="p-4">
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
    <div className="flex flex-col gap-2 p-4">
      {Array.from({ length: 8 }).map((_, idx) => (
        <div key={idx} className="flex items-center gap-3 p-2">
          <Skeleton variant="circle" width={24} height={24} />
          <Skeleton variant="text" width="70%" />
        </div>
      ))}
    </div>
  );
}
