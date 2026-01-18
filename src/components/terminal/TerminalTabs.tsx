/**
 * TerminalTabs Component
 * Tab bar for managing multiple terminal sessions
 */

import { useTerminalStore } from '@/stores/terminalStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { getTerminalTheme, getAutoTerminalTheme, type TerminalThemeId } from '@/config/terminalThemes';
import type { ShellType } from '@/hooks/useTerminal';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, X, Zap, Terminal, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

interface TerminalTabsProps {
  onNewTerminal?: (shell: ShellType) => void;
  onCloseTerminal?: (sessionId: string) => void;
}

export function TerminalTabs({
  onNewTerminal,
  onCloseTerminal,
}: TerminalTabsProps) {
  const { sessions, activeSessionId, setActiveSession, removeSession } = useTerminalStore();
  
  // Get terminal theme to match selected tab background with terminal
  const terminalThemeSetting = useSettingsStore((s) => s.terminalTheme);
  const appTheme = useSettingsStore((s) => s.theme);
  
  const terminalBackground = useMemo(() => {
    const resolvedThemeId: TerminalThemeId = terminalThemeSetting === 'auto' 
      ? getAutoTerminalTheme(appTheme) 
      : terminalThemeSetting as TerminalThemeId;
    return getTerminalTheme(resolvedThemeId).background;
  }, [terminalThemeSetting, appTheme]);

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
  };

  return (
    <div className="flex items-center justify-between h-8 bg-card border-b border-border">
      <div className="flex items-center gap-px overflow-x-auto flex-1 scrollbar-none">
        {sessions.map((session, index) => (
          <div
            key={session.id}
            className={cn(
              "group flex items-center gap-1.5 h-8 px-3 text-xs border-r border-border transition-colors cursor-pointer",
              session.id === activeSessionId 
                ? "text-foreground" 
                : "text-muted-foreground hover:bg-accent/50"
            )}
            style={{ backgroundColor: session.id === activeSessionId ? terminalBackground : undefined }}
            onClick={() => handleTabClick(session.id)}
            title={session.label || `Terminal ${index + 1}`}
            role="tab"
            aria-selected={session.id === activeSessionId}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleTabClick(session.id);
              }
            }}
          >
            <span className="text-[10px] text-success">●</span>
            <span className="max-w-[120px] truncate lowercase">
              {session.label || `Terminal ${index + 1}`}
            </span>
            <button
              className="p-0.5 rounded hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => handleCloseTab(e, session.id)}
              aria-label={`Close ${session.label || `Terminal ${index + 1}`}`}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>

      <div className="px-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 px-2 gap-1">
              <Plus className="h-4 w-4" />
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => handleNewTerminal('powershell')}>
              <Zap className="h-4 w-4 mr-2 text-primary" />
              PowerShell
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleNewTerminal('bash')}>
              <Terminal className="h-4 w-4 mr-2 text-primary" />
              Bash
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleNewTerminal('default')}>
              <Terminal className="h-4 w-4 mr-2 text-muted-foreground" />
              Default Terminal
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
