/**
 * OfflineMessage Component
 * Displays message when offline or GitHub features are unavailable
 */

import { WifiOff, Lock, Clock, type LucideIcon } from 'lucide-react';

interface OfflineMessageProps {
  type?: 'offline' | 'auth-required' | 'rate-limited';
  title?: string;
  message?: string;
  onRetry?: () => void;
  onAuth?: () => void;
}

const DEFAULT_MESSAGES: Record<string, { title: string; message: string; icon: LucideIcon }> = {
  offline: {
    title: 'You are offline',
    message: 'GitHub features require an internet connection. Please check your network and try again.',
    icon: WifiOff,
  },
  'auth-required': {
    title: 'GitHub authentication required',
    message: 'Sign in to GitHub to access pull requests, issues, and other repository features.',
    icon: Lock,
  },
  'rate-limited': {
    title: 'Rate limit exceeded',
    message: 'Too many requests to GitHub. Please wait a moment before trying again.',
    icon: Clock,
  },
};

const typeClasses = {
  offline: 'bg-card rounded-lg',
  'auth-required': 'bg-gradient-to-br from-card to-primary/5 rounded-lg',
  'rate-limited': 'bg-warning/10 rounded-lg',
};

export function OfflineMessage({
  type = 'offline',
  title,
  message,
  onRetry,
  onAuth,
}: OfflineMessageProps) {
  const defaults = DEFAULT_MESSAGES[type];
  const IconComponent = defaults.icon;

  return (
    <div className={`flex flex-col items-center justify-center text-center px-8 py-12 min-h-50 ${typeClasses[type]}`}>
      <IconComponent className="h-12 w-12 mb-4 text-muted-foreground opacity-80" />
      <h3 className="text-lg font-semibold text-foreground m-0 mb-2">{title ?? defaults.title}</h3>
      <p className="text-sm text-muted-foreground max-w-75 m-0 mb-6 leading-relaxed">{message ?? defaults.message}</p>
      
      <div className="flex gap-3">
        {type === 'auth-required' && onAuth && (
          <button 
            className="px-4 py-2 text-sm font-medium rounded-md bg-primary border-primary text-primary-foreground cursor-pointer transition-colors hover:bg-primary/90"
            onClick={onAuth}
          >
            Sign in to GitHub
          </button>
        )}
        {onRetry && (
          <button 
            className="px-4 py-2 text-sm font-medium rounded-md border border-border bg-card text-foreground cursor-pointer transition-all hover:bg-muted hover:border-muted-foreground"
            onClick={onRetry}
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
}
