/**
 * ErrorBoundary Component
 * Catches JavaScript errors and displays fallback UI
 */

import { Component, type ReactNode, type ErrorInfo } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: unknown[];
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    // Reset error state when resetKeys change
    if (this.state.hasError && this.props.resetKeys) {
      const hasChanged = this.props.resetKeys.some(
        (key, index) => key !== prevProps.resetKeys?.[index]
      );
      if (hasChanged) {
        this.setState({ hasError: false, error: null });
      }
    }
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center px-8 py-12 text-center min-h-[200px]">
          <AlertTriangle className="h-10 w-10 mb-4 text-destructive" />
          <h3 className="text-lg font-semibold text-foreground m-0 mb-2">Something went wrong</h3>
          <p className="text-sm text-muted-foreground max-w-[400px] m-0 mb-6 leading-relaxed font-mono bg-muted px-4 py-3 rounded-md break-words">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button 
            className="px-5 py-2 text-sm font-medium rounded-md border-none bg-primary text-primary-foreground cursor-pointer hover:bg-primary/90 transition-colors"
            onClick={this.handleRetry}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * ErrorDisplay Component
 * For displaying errors in a consistent way (not a boundary)
 */
interface ErrorDisplayProps {
  error: string | Error;
  title?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function ErrorDisplay({
  error,
  title = 'Error',
  onRetry,
  onDismiss,
}: ErrorDisplayProps) {
  const errorMessage = typeof error === 'string' ? error : error.message;

  return (
    <div className="bg-destructive/10 border border-destructive/30 rounded-md p-4 my-2">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="h-4 w-4 text-destructive" />
        <span className="font-semibold text-sm text-destructive flex-1">{title}</span>
        {onDismiss && (
          <button 
            className="bg-transparent border-none text-xl leading-none text-muted-foreground cursor-pointer p-0 w-6 h-6 flex items-center justify-center rounded-sm hover:bg-muted hover:text-foreground"
            onClick={onDismiss} 
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <p className="text-[0.8125rem] text-foreground m-0 leading-relaxed">{errorMessage}</p>
      {onRetry && (
        <button 
          className="mt-3 px-4 py-1.5 text-[0.8125rem] font-medium rounded-md border-none bg-primary text-primary-foreground cursor-pointer hover:bg-primary/90 transition-colors"
          onClick={onRetry}
        >
          Retry
        </button>
      )}
    </div>
  );
}
