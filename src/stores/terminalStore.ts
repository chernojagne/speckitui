import { create } from 'zustand';
import type { TerminalSession } from '@/types';

interface TerminalState {
  // State
  sessions: TerminalSession[];
  activeSessionId: string | null;
  panelHeight: number;
  isCollapsed: boolean;

  // Actions
  addSession: (session: TerminalSession) => void;
  removeSession: (sessionId: string) => void;
  setActiveSession: (sessionId: string | null) => void;
  updateSession: (sessionId: string, updates: Partial<TerminalSession>) => void;
  setPanelHeight: (height: number) => void;
  setCollapsed: (collapsed: boolean) => void;
  toggleCollapsed: () => void;
}

export const useTerminalStore = create<TerminalState>((set) => ({
  // Initial state
  sessions: [],
  activeSessionId: null,
  panelHeight: 200,
  isCollapsed: true,

  // Actions
  addSession: (session) =>
    set((state) => ({
      sessions: [...state.sessions, session],
      activeSessionId: session.id,
      isCollapsed: false, // Auto-expand when adding a terminal
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

  setPanelHeight: (height) => set({ panelHeight: Math.max(100, Math.min(600, height)) }),

  setCollapsed: (isCollapsed) => set({ isCollapsed }),

  toggleCollapsed: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
}));
