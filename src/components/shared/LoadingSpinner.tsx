interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

const sizeClasses = {
  sm: 'w-5 h-5 border-2',
  md: 'w-8 h-8 border-3',
  lg: 'w-12 h-12 border-4',
};

export function LoadingSpinner({ size = 'md', message }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      <div 
        className={`${sizeClasses[size]} border-border border-t-primary rounded-full animate-spin`}
      />
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  );
}
