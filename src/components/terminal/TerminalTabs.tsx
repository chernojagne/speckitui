/**
 * TerminalTabs Component
 * Tab bar for managing multiple terminal sessions with drag-to-reorder
 */

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { X, ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

// Terminal shell configuration with icons and labels
const SHELL_CONFIG = {
  cmd: {
    icon: '>_',
    label: 'cmd',
    fullName: 'Command Prompt',
  },
  powershell: {
    icon: 'PS',
    label: 'powershell',
    fullName: 'PowerShell',
  },
  bash: {
    icon: '$_',
    label: 'bash',
    fullName: 'Bash',
  },
  default: {
    icon: '>_',
    label: 'terminal',
    fullName: 'Terminal',
  },
} as const;

// Get shell icon component
function ShellIcon({ shell, className }: { shell: ShellType; className?: string }) {
  const config = SHELL_CONFIG[shell] || SHELL_CONFIG.default;
  return (
    <span className={cn("font-mono text-[10px] font-bold", className)}>
      {config.icon}
    </span>
  );
}

interface TerminalTabsProps {
  onNewTerminal?: (shell: ShellType) => void;
  onCloseTerminal?: (sessionId: string) => void;
}

export function TerminalTabs({
  onNewTerminal,
  onCloseTerminal,
}: TerminalTabsProps) {
  const { sessions, activeSessionId, setActiveSession, removeSession, renameSession, reorderSessions } = useTerminalStore();
  const defaultTerminal = useSettingsStore((s) => s.defaultTerminal);
  const setDefaultTerminal = useSettingsStore((s) => s.setDefaultTerminal);
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
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

  // Drag and drop handlers for tab reordering
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
    // Add a slight delay to allow the drag image to be created
    requestAnimationFrame(() => {
      (e.target as HTMLElement).style.opacity = '0.5';
    });
  };

  const handleDragEnd = (e: React.DragEvent) => {
    (e.target as HTMLElement).style.opacity = '1';
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedIndex !== null && index !== draggedIndex) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    const fromIndex = draggedIndex;
    if (fromIndex !== null && fromIndex !== toIndex) {
      reorderSessions(fromIndex, toIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="flex items-center justify-between h-8 bg-card border-b border-border">
      <div className="flex items-center gap-px overflow-x-auto flex-1 scrollbar-none">
        {sessions.map((session, index) => {
          const displayLabel = session.label || `Terminal ${index + 1}`;
          const isEditing = editingTabId === session.id;
          const isDragging = draggedIndex === index;
          const isDragOver = dragOverIndex === index;

          return (
            <div
              key={session.id}
              className={cn(
                "group flex items-center gap-1.5 h-8 px-3 text-xs border-r border-border transition-colors cursor-pointer",
                session.id === activeSessionId 
                  ? "text-foreground" 
                  : "text-muted-foreground hover:bg-accent/50",
                isDragging && "opacity-50",
                isDragOver && "border-l-2 border-l-primary"
              )}
              style={{ backgroundColor: session.id === activeSessionId ? terminalBackground : undefined }}
              onClick={() => handleTabClick(session.id)}
              onDoubleClick={() => handleTabDoubleClick(session.id, displayLabel)}
              onMouseDown={(e) => {
                // Middle-click to close tab
                if (e.button === 1) {
                  e.preventDefault();
                  removeSession(session.id);
                  onCloseTerminal?.(session.id);
                }
              }}
              // Drag and drop for reordering
              draggable={!isEditing}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              title={isEditing ? undefined : `${displayLabel} (drag to reorder, double-click to rename, middle-click to close)`}
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
              <ShellIcon shell={session.shellType || 'default'} className="text-primary" />
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

      {/* Split button: Icon creates default terminal, Chevron opens menu */}
      <div className="flex items-center px-1">
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 w-6 p-0"
          onClick={() => handleNewTerminal(defaultTerminal)}
          title={`New ${SHELL_CONFIG[defaultTerminal].fullName} (default)`}
        >
          <ShellIcon shell={defaultTerminal} className="text-muted-foreground" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-4 p-0">
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            {(['cmd', 'powershell', 'bash'] as const).map((shell) => {
              const config = SHELL_CONFIG[shell];
              const isDefault = defaultTerminal === shell;
              return (
                <DropdownMenuItem 
                  key={shell}
                  onClick={() => handleNewTerminal(shell)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setDefaultTerminal(shell);
                  }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <ShellIcon shell={shell} className="text-primary" />
                    <span>{config.fullName}</span>
                  </div>
                  {isDefault && <Check className="h-4 w-4 text-primary" />}
                </DropdownMenuItem>
              );
            })}
            <div className="text-[10px] text-muted-foreground px-2 py-1 border-t mt-1">
              Right-click to set default
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
