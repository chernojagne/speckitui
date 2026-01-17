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

interface UseTerminalReturn {
  // State
  sessions: TerminalSession[];
  activeSession: TerminalSession | null;
  activeSessionId: string | null;
  isCollapsed: boolean;
  
  // Session Management
  createSession: (title?: string) => Promise<string | null>;
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

  // Create a new terminal session
  const createSession = useCallback(async (label?: string): Promise<string | null> => {
    try {
      const cwd = getCwd();
      const result = await createTerminal(cwd);
      
      const newSession: TerminalSession = {
        id: result.sessionId,
        label: label || `Terminal ${sessions.length + 1}`,
        cwd,
        shell: 'default',
        status: 'running',
        isActive: true,
      };
      
      addSession(newSession);
      storeSetActiveSession(result.sessionId);
      setCollapsed(false);
      
      return result.sessionId;
    } catch (err) {
      console.error('Failed to create terminal session:', err);
      return null;
    }
  }, [getCwd, sessions.length, addSession, storeSetActiveSession, setCollapsed]);

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
