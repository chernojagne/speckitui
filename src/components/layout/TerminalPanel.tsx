import { useRef, useState, useCallback } from 'react';
import { useTerminalStore } from '@/stores/terminalStore';
import { useTerminal, type ShellType } from '@/hooks/useTerminal';
import { TerminalInstance } from '@/components/terminal/TerminalInstance';
import { TerminalTabs } from '@/components/terminal/TerminalTabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronUp, ChevronDown, Plus, Terminal } from 'lucide-react';
import { cn } from '@/lib/utils';

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
      <div className="flex items-center justify-between h-8 px-2 bg-card border-t border-border">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Terminal</span>
          {sessions.length > 0 && (
            <Badge variant="secondary" className="h-5 px-1.5 text-xs">
              {sessions.length}
            </Badge>
          )}
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 w-6 p-0"
          onClick={toggleCollapsed}
          title="Expand Terminal Panel"
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  // Full terminal panel
  return (
    <div 
      ref={panelRef}
      className={cn(
        "flex flex-col h-full bg-background border-t border-border",
        isResizing && "select-none"
      )}
    >
      {/* Terminal header with tabs */}
      <div className="flex items-center justify-between">
        <TerminalTabs 
          onNewTerminal={handleNewTerminal}
          onCloseTerminal={handleCloseTerminal}
        />
        <div className="px-2">
          <Button 
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={toggleCollapsed} 
            title="Collapse Terminal Panel"
            aria-label="Collapse terminal panel"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Terminal content */}
      <div className="flex-1 overflow-hidden">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
            <Terminal className="h-12 w-12" />
            <p className="text-sm">Click + to open a new terminal</p>
            <Button 
              variant="outline" 
              size="sm"
              className="gap-2"
              onClick={() => handleNewTerminal('default')}
            >
              <Plus className="h-4 w-4" />
              New Terminal
            </Button>
          </div>
        ) : (
          <div className="h-full">
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
