import { useRef, useState, useCallback, useEffect } from 'react';
import { useTerminalStore } from '@/stores/terminalStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTerminal, type ShellType } from '@/hooks/useTerminal';
import { useTerminalHotkeys } from '@/hooks/useTerminalHotkeys';
import { TerminalInstance } from '@/components/terminal/TerminalInstance';
import { TerminalTabs } from '@/components/terminal/TerminalTabs';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import './TerminalPanel.css';

const MIN_PANEL_HEIGHT = 100;

// Shell configuration for display names and icons
const SHELL_CONFIG = {
  cmd: {
    name: 'Command Prompt',
    icon: '>_',
  },
  powershell: {
    name: 'PowerShell',
    icon: 'PS',
  },
  bash: {
    name: 'Bash',
    icon: '$_',
  },
} as const;

export function TerminalPanel() {
  const { sessions, activeSessionId, panelHeight, setPanelHeight } = useTerminalStore();
  const { defaultTerminal, terminalPanelHeight, setTerminalPanelHeight } = useSettingsStore();
  const { createSession, closeSession } = useTerminal();
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(0);

  // Sync panel height with settings
  useEffect(() => {
    if (terminalPanelHeight !== panelHeight) {
      setPanelHeight(terminalPanelHeight);
    }
  }, [terminalPanelHeight, panelHeight, setPanelHeight]);

  // Handle drag resize
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    dragStartY.current = e.clientY;
    dragStartHeight.current = panelHeight;

    const handleDragMove = (moveEvent: MouseEvent) => {
      const deltaY = dragStartY.current - moveEvent.clientY;
      const newHeight = Math.max(MIN_PANEL_HEIGHT, dragStartHeight.current + deltaY);
      setPanelHeight(newHeight);
      setTerminalPanelHeight(newHeight);
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

  // Register terminal keyboard shortcuts
  useTerminalHotkeys({
    onNewTerminal: handleNewTerminal,
    onCloseTerminal: handleCloseTerminal,
    enabled: true,
  });

  // Full terminal panel with resize handle
  return (
    <div 
      ref={panelRef}
      className={cn(
        "relative flex flex-col bg-background border-t border-border shrink-0",
        isResizing && "select-none"
      )}
      style={{ height: `${panelHeight}px` }}
    >
      {/* Resize handle at top */}
      <div 
        className="terminal-resize-handle"
        onMouseDown={handleDragStart}
        role="separator"
        aria-orientation="horizontal"
        aria-label="Resize terminal panel"
        tabIndex={0}
      />

      {/* Terminal header with tabs */}
      <div className="flex items-center justify-between shrink-0">
        <TerminalTabs 
          onNewTerminal={handleNewTerminal}
          onCloseTerminal={handleCloseTerminal}
        />
      </div>

      {/* Terminal content - keep all instances mounted, hide via visibility/opacity for inactive */}
      <div className="flex-1 overflow-hidden relative">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
            <span className="font-mono text-4xl font-bold text-primary">
              {SHELL_CONFIG[defaultTerminal].icon}
            </span>
            <p className="text-sm">Click to open a new {SHELL_CONFIG[defaultTerminal].name} terminal</p>
            <Button 
              variant="outline" 
              size="sm"
              className="gap-2"
              onClick={() => handleNewTerminal(defaultTerminal)}
            >
              <Plus className="h-4 w-4" />
              New {SHELL_CONFIG[defaultTerminal].name}
            </Button>
          </div>
        ) : (
          <>
            {sessions.map((session) => (
              <div 
                key={session.id}
                className="absolute inset-0"
                style={{
                  opacity: session.id === activeSessionId ? 1 : 0,
                  visibility: session.id === activeSessionId ? 'visible' : 'hidden',
                  pointerEvents: session.id === activeSessionId ? 'auto' : 'none',
                }}
              >
                <TerminalInstance
                  sessionId={session.id}
                  isActive={session.id === activeSessionId}
                  onExit={() => closeSession(session.id, true)}
                />
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
