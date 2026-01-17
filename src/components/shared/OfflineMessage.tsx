/**
 * OfflineMessage Component
 * Displays message when offline or GitHub features are unavailable
 */

import './OfflineMessage.css';

interface OfflineMessageProps {
  type?: 'offline' | 'auth-required' | 'rate-limited';
  title?: string;
  message?: string;
  onRetry?: () => void;
  onAuth?: () => void;
}

const DEFAULT_MESSAGES = {
  offline: {
    title: 'You are offline',
    message: 'GitHub features require an internet connection. Please check your network and try again.',
    icon: '📡',
  },
  'auth-required': {
    title: 'GitHub authentication required',
    message: 'Sign in to GitHub to access pull requests, issues, and other repository features.',
    icon: '🔐',
  },
  'rate-limited': {
    title: 'Rate limit exceeded',
    message: 'Too many requests to GitHub. Please wait a moment before trying again.',
    icon: '⏱️',
  },
};

export function OfflineMessage({
  type = 'offline',
  title,
  message,
  onRetry,
  onAuth,
}: OfflineMessageProps) {
  const defaults = DEFAULT_MESSAGES[type];

  return (
    <div className={`offline-message offline-message--${type}`}>
      <div className="offline-icon">{defaults.icon}</div>
      <h3 className="offline-title">{title ?? defaults.title}</h3>
      <p className="offline-text">{message ?? defaults.message}</p>
      
      <div className="offline-actions">
        {type === 'auth-required' && onAuth && (
          <button className="offline-button primary" onClick={onAuth}>
            Sign in to GitHub
          </button>
        )}
        {onRetry && (
          <button className="offline-button" onClick={onRetry}>
            Try again
          </button>
        )}
      </div>
    </div>
  );
}
