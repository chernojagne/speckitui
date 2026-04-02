/**
 * TerminalTabs Component
 * Tab bar for managing multiple terminal sessions with drag-to-reorder
 * 
 * @feature 006-more-themes - Updated to use useTerminalTheme hook
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { useTerminalStore } from '@/stores/terminalStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTerminalTheme } from '@/hooks/useTheme';
import type { ShellType } from '@/hooks/useTerminal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { X, ChevronDown, Check, Plus } from 'lucide-react';
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
  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    draggedIndex: number;
    currentIndex: number;
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  // Ref to access current sessions during drag (avoid stale closure)
  const sessionsRef = useRef(sessions);
  sessionsRef.current = sessions;
  
  // Get terminal theme to match selected tab background with terminal (006-more-themes)
  const { theme: terminalThemeConfig } = useTerminalTheme();
  const terminalBackground = terminalThemeConfig.background;

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
    // Stop propagation for all keys to prevent parent handlers from interfering
    e.stopPropagation();
    
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

  // Mouse-based drag handlers for real-time tab reordering
  const handleTabDragStart = useCallback((e: React.MouseEvent, index: number) => {
    if (e.button !== 0) return; // Only left click
    e.preventDefault();
    
    let currentIdx = index;
    setDragState({ isDragging: true, draggedIndex: index, currentIndex: index });
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!tabsContainerRef.current) return;
      
      const container = tabsContainerRef.current;
      const tabs = Array.from(container.querySelectorAll('[data-tab-index]')) as HTMLElement[];
      
      // Find which tab position we're over based on mouse position
      let newIndex = 0;
      for (let i = 0; i < tabs.length; i++) {
        const rect = tabs[i].getBoundingClientRect();
        const midpoint = rect.left + rect.width / 2;
        if (moveEvent.clientX > midpoint) {
          newIndex = i + 1;
        } else {
          break;
        }
      }
      newIndex = Math.min(newIndex, sessionsRef.current.length - 1);
      newIndex = Math.max(newIndex, 0);
      
      if (currentIdx !== newIndex) {
        // Reorder in real-time
        reorderSessions(currentIdx, newIndex);
        currentIdx = newIndex;
        setDragState({ isDragging: true, draggedIndex: index, currentIndex: newIndex });
      }
    };
    
    const handleMouseUp = () => {
      setDragState(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [sessions.length, reorderSessions]);

  return (
    <div className="flex items-center justify-between h-8 bg-card border-b border-border">
      <div ref={tabsContainerRef} className="flex items-center gap-px overflow-x-auto flex-1 scrollbar-none">
        {sessions.map((session, index) => {
          const displayLabel = session.label || `Terminal ${index + 1}`;
          const isEditing = editingTabId === session.id;
          const isDragging = dragState?.currentIndex === index;

          return (
            <div
              key={session.id}
              data-tab-index={index}
              className={cn(
                "group flex items-center gap-1.5 h-8 px-3 text-xs border-r border-border transition-colors select-none",
                session.id === activeSessionId 
                  ? "text-foreground" 
                  : "text-muted-foreground hover:bg-accent/50",
                isDragging && dragState?.isDragging && "opacity-70 ring-2 ring-primary",
                !isEditing && "cursor-grab active:cursor-grabbing"
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
                } else if (e.button === 0 && !isEditing) {
                  // Left-click starts drag
                  handleTabDragStart(e, index);
                }
              }}
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
          className="h-6 px-1.5 gap-0.5"
          onClick={() => handleNewTerminal(defaultTerminal)}
          title={`New ${SHELL_CONFIG[defaultTerminal].fullName} (default)`}
        >
          <ShellIcon shell={defaultTerminal} className="text-muted-foreground" />
          <Plus className="h-3 w-3 text-muted-foreground" />
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
