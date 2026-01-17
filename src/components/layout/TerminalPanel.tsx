import { useRef, useState, useCallback } from 'react';
import { useTerminalStore } from '@/stores/terminalStore';
import { useTerminal, type ShellType } from '@/hooks/useTerminal';
import { TerminalInstance } from '@/components/terminal/TerminalInstance';
import { TerminalTabs } from '@/components/terminal/TerminalTabs';
import './TerminalPanel.css';

interface TerminalPanelProps {
  minimized?: boolean;
}

const MIN_PANEL_HEIGHT = 100;
const MAX_PANEL_HEIGHT = 600;

export function TerminalPanel({ minimized = false }: TerminalPanelProps) {
  const { isCollapsed, toggleCollapsed, sessions, activeSessionId, panelHeight, setPanelHeight } = useTerminalStore();
  const { createSession, closeSession } = useTerminal();
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(0);

  // Handle drag resize
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    dragStartY.current = e.clientY;
    dragStartHeight.current = panelHeight;

    const handleDragMove = (moveEvent: MouseEvent) => {
      const deltaY = dragStartY.current - moveEvent.clientY;
      const newHeight = Math.min(MAX_PANEL_HEIGHT, Math.max(MIN_PANEL_HEIGHT, dragStartHeight.current + deltaY));
      setPanelHeight(newHeight);
    };

    const handleDragEnd = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
    };

    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
  }, [panelHeight, setPanelHeight]);

  // Handle new terminal creation
  const handleNewTerminal = useCallback(async (shell: ShellType = 'default') => {
    await createSession(shell);
  }, [createSession]);

  // Handle close terminal
  const handleCloseTerminal = useCallback(async (sessionId: string) => {
    await closeSession(sessionId);
  }, [closeSession]);

  // Minimized view (just the toggle bar)
  if (minimized || isCollapsed) {
    return (
      <div className="terminal-toggle-bar">
        <button className="terminal-toggle-btn" onClick={toggleCollapsed}>
          <span className="toggle-icon">{isCollapsed ? '▲' : '▼'}</span>
          <span className="toggle-label">Terminal</span>
          {sessions.length > 0 && <span className="session-count">{sessions.length}</span>}
        </button>
      </div>
    );
  }

  // Full terminal panel
  return (
    <div 
      ref={panelRef}
      className={`terminal-panel ${isResizing ? 'resizing' : ''}`}
      style={{ height: panelHeight }}
    >
      {/* Resize handle */}
      <div 
        className="terminal-resize-handle"
        onMouseDown={handleDragStart}
        role="separator"
        aria-orientation="horizontal"
        aria-label="Resize terminal panel"
      />

      {/* Terminal header with tabs */}
      <div className="terminal-header">
        <TerminalTabs 
          onNewTerminal={handleNewTerminal}
          onCloseTerminal={handleCloseTerminal}
        />
        <div className="terminal-header-actions">
          <button 
            className="terminal-toggle-btn" 
            onClick={toggleCollapsed} 
            title="Collapse Terminal Panel"
            aria-label="Collapse terminal panel"
          >
            ▼
          </button>
        </div>
      </div>

      {/* Terminal content */}
      <div className="terminal-content">
        {sessions.length === 0 ? (
          <div className="terminal-placeholder">
            <p>Click + to open a new terminal</p>
            <button className="new-terminal-placeholder-btn" onClick={() => handleNewTerminal('default')}>
              + New Terminal
            </button>
          </div>
        ) : (
          <div className="terminal-instances">
            {sessions.map((session) => (
              <TerminalInstance
                key={session.id}
                sessionId={session.id}
                isActive={session.id === activeSessionId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
