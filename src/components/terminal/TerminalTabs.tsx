/**
 * TerminalTabs Component
 * Tab bar for managing multiple terminal sessions
 */

import { useTerminalStore } from '@/stores/terminalStore';
import './TerminalTabs.css';

interface TerminalTabsProps {
  onNewTerminal?: () => void;
  onCloseTerminal?: (sessionId: string) => void;
}

export function TerminalTabs({
  onNewTerminal,
  onCloseTerminal,
}: TerminalTabsProps) {
  const { sessions, activeSessionId, setActiveSession, removeSession } = useTerminalStore();

  const handleTabClick = (sessionId: string) => {
    setActiveSession(sessionId);
  };

  const handleCloseTab = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    removeSession(sessionId);
    onCloseTerminal?.(sessionId);
  };

  const handleNewTerminal = () => {
    onNewTerminal?.();
  };

  return (
    <div className="terminal-tabs">
      <div className="tabs-container">
        {sessions.map((session, index) => (
          <button
            key={session.id}
            className={`terminal-tab ${session.id === activeSessionId ? 'active' : ''}`}
            onClick={() => handleTabClick(session.id)}
            title={session.label || `Terminal ${index + 1}`}
          >
            <span className="tab-icon">⬤</span>
            <span className="tab-title">{session.label || `Terminal ${index + 1}`}</span>
            <button
              className="tab-close"
              onClick={(e) => handleCloseTab(e, session.id)}
              aria-label={`Close ${session.label || `Terminal ${index + 1}`}`}
            >
              ×
            </button>
          </button>
        ))}
      </div>

      <div className="tabs-actions">
        <button
          className="new-terminal-btn"
          onClick={handleNewTerminal}
          title="New Terminal"
          aria-label="Create new terminal"
        >
          <span className="plus-icon">+</span>
        </button>
      </div>
    </div>
  );
}
