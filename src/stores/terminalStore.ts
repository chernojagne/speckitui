import { create } from 'zustand';
import type { TerminalSession } from '@/types';

interface TerminalState {
  // State
  sessions: TerminalSession[];
  activeSessionId: string | null;
  panelHeight: number;

  // Actions
  addSession: (session: TerminalSession) => void;
  removeSession: (sessionId: string) => void;
  setActiveSession: (sessionId: string | null) => void;
  updateSession: (sessionId: string, updates: Partial<TerminalSession>) => void;
  setPanelHeight: (height: number) => void;
  renameSession: (sessionId: string, label: string) => void;
}

export const useTerminalStore = create<TerminalState>((set) => ({
  // Initial state
  sessions: [],
  activeSessionId: null,
  panelHeight: 200,

  // Actions
  addSession: (session) =>
    set((state) => ({
      sessions: [...state.sessions, session],
      activeSessionId: session.id,
    })),

  removeSession: (sessionId) =>
    set((state) => {
      const sessions = state.sessions.filter((s) => s.id !== sessionId);
      const activeSessionId =
        state.activeSessionId === sessionId
          ? sessions[sessions.length - 1]?.id ?? null
          : state.activeSessionId;
      return { sessions, activeSessionId };
    }),

  setActiveSession: (sessionId) => set({ activeSessionId: sessionId }),

  updateSession: (sessionId, updates) =>
    set((state) => ({
      sessions: state.sessions.map((s) => (s.id === sessionId ? { ...s, ...updates } : s)),
    })),

  // Remove max height constraint - only enforce minimum of 100px
  setPanelHeight: (height) => set({ panelHeight: Math.max(100, height) }),

  // Rename a terminal session - empty names revert to default "Terminal N"
  renameSession: (sessionId, label) =>
    set((state) => {
      const sessionIndex = state.sessions.findIndex((s) => s.id === sessionId);
      const newLabel = label.trim() || `Terminal ${sessionIndex + 1}`;
      return {
        sessions: state.sessions.map((s) =>
          s.id === sessionId ? { ...s, label: newLabel } : s
        ),
      };
    }),
}));
