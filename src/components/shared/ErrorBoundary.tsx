/**
 * ErrorBoundary Component
 * Catches JavaScript errors and displays fallback UI
 */

import { Component, type ReactNode, type ErrorInfo } from 'react';
import './ErrorBoundary.css';

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
        <div className="error-boundary">
          <div className="error-icon">⚠️</div>
          <h3 className="error-title">Something went wrong</h3>
          <p className="error-message">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button className="error-retry-button" onClick={this.handleRetry}>
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
    <div className="error-display">
      <div className="error-display-header">
        <span className="error-display-icon">⚠️</span>
        <span className="error-display-title">{title}</span>
        {onDismiss && (
          <button className="error-dismiss" onClick={onDismiss} aria-label="Dismiss">
            ×
          </button>
        )}
      </div>
      <p className="error-display-message">{errorMessage}</p>
      {onRetry && (
        <button className="error-retry-button" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}
