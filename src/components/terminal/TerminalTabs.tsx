/**
 * TerminalTabs Component
 * Tab bar for managing multiple terminal sessions
 */

import { useState, useRef, useEffect } from 'react';
import { useTerminalStore } from '@/stores/terminalStore';
import type { ShellType } from '@/hooks/useTerminal';
import './TerminalTabs.css';

interface TerminalTabsProps {
  onNewTerminal?: (shell: ShellType) => void;
  onCloseTerminal?: (sessionId: string) => void;
}

export function TerminalTabs({
  onNewTerminal,
  onCloseTerminal,
}: TerminalTabsProps) {
  const { sessions, activeSessionId, setActiveSession, removeSession } = useTerminalStore();
  const [showShellMenu, setShowShellMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowShellMenu(false);
      }
    };

    if (showShellMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showShellMenu]);

  const handleTabClick = (sessionId: string) => {
    setActiveSession(sessionId);
  };

  const handleCloseTab = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    removeSession(sessionId);
    onCloseTerminal?.(sessionId);
  };

  const handleNewTerminal = (shell: ShellType) => {
    onNewTerminal?.(shell);
    setShowShellMenu(false);
  };

  const toggleShellMenu = () => {
    setShowShellMenu(!showShellMenu);
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

      <div className="tabs-actions" ref={menuRef}>
        <button
          className="new-terminal-btn"
          onClick={toggleShellMenu}
          title="New Terminal"
          aria-label="Create new terminal"
          aria-expanded={showShellMenu}
          aria-haspopup="menu"
        >
          <span className="plus-icon">+</span>
          <span className="dropdown-arrow">▾</span>
        </button>
        
        {showShellMenu && (
          <div className="shell-menu" role="menu">
            <button 
              className="shell-menu-item" 
              onClick={() => handleNewTerminal('powershell')}
              role="menuitem"
            >
              <span className="shell-icon">⚡</span>
              PowerShell
            </button>
            <button 
              className="shell-menu-item" 
              onClick={() => handleNewTerminal('bash')}
              role="menuitem"
            >
              <span className="shell-icon">$</span>
              Bash
            </button>
            <div className="shell-menu-divider" />
            <button 
              className="shell-menu-item" 
              onClick={() => handleNewTerminal('default')}
              role="menuitem"
            >
              <span className="shell-icon">▸</span>
              Default Terminal
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
