/**
 * useTerminal Hook
 * Manages terminal operations and session lifecycle
 */

import { useCallback, useEffect } from 'react';
import { useTerminalStore } from '@/stores/terminalStore';
import { useProjectStore } from '@/stores/projectStore';
import type { TerminalSession } from '@/types';
import {
  createTerminal,
  closeTerminal,
  writeTerminal,
  resizeTerminal,
} from '@/services/tauriCommands';

export type ShellType = 'powershell' | 'bash' | 'default';

interface UseTerminalReturn {
  // State
  sessions: TerminalSession[];
  activeSession: TerminalSession | null;
  activeSessionId: string | null;
  isCollapsed: boolean;
  
  // Session Management
  createSession: (shell?: ShellType, label?: string) => Promise<string | null>;
  closeSession: (sessionId: string) => Promise<void>;
  closeAllSessions: () => Promise<void>;
  setActiveSession: (sessionId: string) => void;
  
  // Terminal Operations
  write: (sessionId: string, data: string) => Promise<void>;
  resize: (sessionId: string, rows: number, cols: number) => Promise<void>;
  
  // Panel Controls
  togglePanel: () => void;
  collapsePanel: () => void;
  expandPanel: () => void;
}

export function useTerminal(): UseTerminalReturn {
  const project = useProjectStore((state) => state.project);
  const {
    sessions,
    activeSessionId,
    isCollapsed,
    addSession,
    removeSession,
    setActiveSession: storeSetActiveSession,
    setCollapsed,
  } = useTerminalStore();

  const activeSession = sessions.find((s) => s.id === activeSessionId) ?? null;

  // Get current working directory
  const getCwd = useCallback(() => {
    return project?.path || '/';
  }, [project]);

  // Detect if running on Windows
  const isWindows = navigator.userAgent.includes('Windows') || navigator.platform.startsWith('Win');

  // Get shell executable path
  const getShellPath = useCallback((shell: ShellType): string | undefined => {
    switch (shell) {
      case 'powershell':
        return 'powershell.exe';
      case 'bash':
        // Try Git Bash on Windows, otherwise use bash
        return isWindows 
          ? 'C:\\Program Files\\Git\\bin\\bash.exe'
          : '/bin/bash';
      case 'default':
      default:
        return undefined; // Let backend decide
    }
  }, [isWindows]);

  // Get shell display name
  const getShellLabel = useCallback((shell: ShellType): string => {
    switch (shell) {
      case 'powershell':
        return 'PowerShell';
      case 'bash':
        return 'Bash';
      default:
        return 'Terminal';
    }
  }, []);

  // Create a new terminal session
  const createSession = useCallback(async (shell: ShellType = 'default', label?: string): Promise<string | null> => {
    try {
      const cwd = getCwd();
      const shellPath = getShellPath(shell);
      const result = await createTerminal(cwd, shellPath);
      
      const shellLabel = getShellLabel(shell);
      const newSession: TerminalSession = {
        id: result.sessionId,
        label: label || `${shellLabel} ${sessions.length + 1}`,
        cwd,
        shell: result.shell,
        status: 'running',
        isActive: true,
      };
      
      addSession(newSession);
      storeSetActiveSession(result.sessionId);
      setCollapsed(false);
      
      return result.sessionId;
    } catch (err) {
      console.error('Failed to create terminal session:', err, shell);
      return null;
    }
  }, [getCwd, getShellPath, getShellLabel, sessions.length, addSession, storeSetActiveSession, setCollapsed]);

  // Close a terminal session
  const closeSession = useCallback(async (sessionId: string): Promise<void> => {
    try {
      await closeTerminal(sessionId);
    } catch (err) {
      console.warn('Failed to close terminal backend:', err);
    } finally {
      removeSession(sessionId);
    }
  }, [removeSession]);

  // Close all terminal sessions
  const closeAllSessions = useCallback(async (): Promise<void> => {
    const closePromises = sessions.map((session) => 
      closeTerminal(session.id).catch(() => {})
    );
    await Promise.all(closePromises);
    // Remove each session individually
    sessions.forEach((session) => removeSession(session.id));
  }, [sessions, removeSession]);

  // Set active session
  const setActiveSession = useCallback((sessionId: string) => {
    storeSetActiveSession(sessionId);
  }, [storeSetActiveSession]);

  // Write to terminal
  const write = useCallback(async (sessionId: string, data: string): Promise<void> => {
    await writeTerminal(sessionId, data);
  }, []);

  // Resize terminal
  const resize = useCallback(async (
    sessionId: string,
    rows: number,
    cols: number
  ): Promise<void> => {
    await resizeTerminal(sessionId, rows, cols);
  }, []);

  // Panel controls
  const togglePanel = useCallback(() => {
    setCollapsed(!isCollapsed);
  }, [isCollapsed, setCollapsed]);

  const collapsePanel = useCallback(() => {
    setCollapsed(true);
  }, [setCollapsed]);

  const expandPanel = useCallback(() => {
    setCollapsed(false);
  }, [setCollapsed]);

  // Clean up sessions on unmount
  useEffect(() => {
    return () => {
      // Optionally close all sessions when component unmounts
      // sessions.forEach((session) => closeTerminal(session.id).catch(() => {}));
    };
  }, []);

  return {
    // State
    sessions,
    activeSession,
    activeSessionId,
    isCollapsed,
    
    // Session Management
    createSession,
    closeSession,
    closeAllSessions,
    setActiveSession,
    
    // Terminal Operations
    write,
    resize,
    
    // Panel Controls
    togglePanel,
    collapsePanel,
    expandPanel,
  };
}
