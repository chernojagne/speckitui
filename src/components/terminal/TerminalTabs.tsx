/**
 * TerminalTabs Component
 * Tab bar for managing multiple terminal sessions
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { useTerminalStore } from '@/stores/terminalStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { getTerminalTheme, getAutoTerminalTheme, type TerminalThemeId } from '@/config/terminalThemes';
import type { ShellType } from '@/hooks/useTerminal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  const { sessions, activeSessionId, setActiveSession, removeSession, renameSession } = useTerminalStore();
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Get terminal theme to match selected tab background with terminal
  const terminalThemeSetting = useSettingsStore((s) => s.terminalTheme);
  const appTheme = useSettingsStore((s) => s.theme);
  
  const terminalBackground = useMemo(() => {
    const resolvedThemeId: TerminalThemeId = terminalThemeSetting === 'auto' 
      ? getAutoTerminalTheme(appTheme) 
      : terminalThemeSetting as TerminalThemeId;
    return getTerminalTheme(resolvedThemeId).background;
  }, [terminalThemeSetting, appTheme]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (editingTabId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingTabId]);

  const handleTabClick = (sessionId: string) => {
    if (editingTabId !== sessionId) {
      setActiveSession(sessionId);
    }
  };

  const handleTabDoubleClick = (sessionId: string, currentLabel: string) => {
    setEditingTabId(sessionId);
    setEditValue(currentLabel);
  };

  const handleSaveRename = useCallback((sessionId: string) => {
    renameSession(sessionId, editValue);
    setEditingTabId(null);
    setEditValue('');
  }, [editValue, renameSession]);

  const handleCancelRename = useCallback(() => {
    setEditingTabId(null);
    setEditValue('');
  }, []);

  const handleRenameKeyDown = useCallback((e: React.KeyboardEvent, sessionId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveRename(sessionId);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelRename();
    }
  }, [handleSaveRename, handleCancelRename]);

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
        {sessions.map((session, index) => {
          const displayLabel = session.label || `Terminal ${index + 1}`;
          const isEditing = editingTabId === session.id;

          return (
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
              onDoubleClick={() => handleTabDoubleClick(session.id, displayLabel)}
              title={isEditing ? undefined : `${displayLabel} (double-click to rename)`}
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
              {isEditing ? (
                <Input
                  ref={inputRef}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={() => handleSaveRename(session.id)}
                  onKeyDown={(e) => handleRenameKeyDown(e, session.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="h-5 w-24 px-1 py-0 text-xs"
                  aria-label="Rename terminal tab"
                />
              ) : (
                <span className="max-w-[120px] truncate lowercase">
                  {displayLabel}
                </span>
              )}
              {!isEditing && (
                <button
                  className="p-0.5 rounded hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => handleCloseTab(e, session.id)}
                  aria-label={`Close ${displayLabel}`}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          );
        })}
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
            <DropdownMenuItem onClick={() => handleNewTerminal('cmd')}>
              <Terminal className="h-4 w-4 mr-2 text-primary" />
              Command Prompt
            </DropdownMenuItem>
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
