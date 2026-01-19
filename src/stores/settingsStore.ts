import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AppSettings } from '@/types';

export type TerminalThemeSetting = 'auto' | 'dark' | 'light' | 'caffeine-dark' | 'caffeine-light' | 'monokai' | 'dracula';

// Helper to apply theme to document
const applyTheme = (theme: 'light' | 'dark' | 'system') => {
  const root = document.documentElement;
  
  if (theme === 'system') {
    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  } else if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

// Listen for system theme changes
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const currentTheme = useSettingsStore.getState().theme;
    if (currentTheme === 'system') {
      if (e.matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  });
}

interface SettingsState extends AppSettings {
  // Actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setTerminalPanelHeight: (height: number) => void;
  setTerminalPanelCollapsed: (collapsed: boolean) => void;
  addRecentProject: (path: string) => void;
  setLastProject: (path: string, specId?: string) => void;
  // Editor settings actions
  setEditorFontSize: (size: number) => void;
  setEditorLineNumbers: (show: boolean) => void;
  setEditorWordWrap: (wrap: boolean) => void;
  // Sidebar settings actions
  setSidebarShowIcons: (show: boolean) => void;
  setSidebarCompactMode: (compact: boolean) => void;
  // Terminal settings actions
  setTerminalFontSize: (size: number) => void;
  setTerminalFontFamily: (family: string) => void;
  setTerminalTheme: (theme: TerminalThemeSetting) => void;
  setTerminalCursorBlink: (blink: boolean) => void;
  setDefaultTerminal: (shell: 'cmd' | 'powershell' | 'bash') => void;
  // Navigation pane settings actions
  setNavPaneWidth: (width: number) => void;
  setNavPaneCollapsed: (collapsed: boolean) => void;
  toggleNavPaneCollapsed: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      // Initial state
      recentProjects: [],
      lastProjectPath: undefined,
      lastSpecId: undefined,
      terminalPanelHeight: 200,
      terminalPanelCollapsed: true,
      theme: 'system',
      // Editor settings
      editorFontSize: 14,
      editorLineNumbers: true,
      editorWordWrap: false,
      // Sidebar settings
      sidebarShowIcons: true,
      sidebarCompactMode: false,
      // Terminal settings
      terminalFontSize: 14,
      terminalFontFamily: 'Consolas, "Courier New", monospace',
      terminalTheme: 'auto',
      terminalCursorBlink: true,
      defaultTerminal: 'bash',
      // Navigation pane settings
      navPaneWidth: 220,
      navPaneCollapsed: false,

      // Actions
      setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
      },

      setTerminalPanelHeight: (height) =>
        set({ terminalPanelHeight: Math.max(100, Math.min(600, height)) }),

      setTerminalPanelCollapsed: (collapsed) => set({ terminalPanelCollapsed: collapsed }),

      addRecentProject: (path) => {
        const { recentProjects } = get();
        const filtered = recentProjects.filter((p) => p !== path);
        const updated = [path, ...filtered].slice(0, 10); // Keep last 10
        set({ recentProjects: updated });
      },

      setLastProject: (path, specId) =>
        set({
          lastProjectPath: path,
          lastSpecId: specId,
        }),

      // Editor settings actions
      setEditorFontSize: (size) => set({ editorFontSize: size }),
      setEditorLineNumbers: (show) => set({ editorLineNumbers: show }),
      setEditorWordWrap: (wrap) => set({ editorWordWrap: wrap }),
      
      // Sidebar settings actions
      setSidebarShowIcons: (show) => set({ sidebarShowIcons: show }),
      setSidebarCompactMode: (compact) => set({ sidebarCompactMode: compact }),

      // Terminal settings actions
      setTerminalFontSize: (size) => set({ terminalFontSize: size }),
      setTerminalFontFamily: (family) => set({ terminalFontFamily: family }),
      setTerminalTheme: (theme) => set({ terminalTheme: theme }),
      setTerminalCursorBlink: (blink) => set({ terminalCursorBlink: blink }),
      setDefaultTerminal: (shell) => set({ defaultTerminal: shell }),

      // Navigation pane settings actions
      setNavPaneWidth: (width) =>
        set({ navPaneWidth: Math.max(180, Math.min(400, width)) }),
      setNavPaneCollapsed: (collapsed) => set({ navPaneCollapsed: collapsed }),
      toggleNavPaneCollapsed: () =>
        set((state) => ({ navPaneCollapsed: !state.navPaneCollapsed })),
    }),
    {
      name: 'speckitui-settings',
      version: 1, // Increment to force migration and reset navPaneCollapsed
      storage: createJSONStorage(() => localStorage),
      // Exclude navPaneCollapsed from persistence - always start expanded
      partialize: (state) => {
        const { navPaneCollapsed, ...rest } = state;
        return rest;
      },
      migrate: (persistedState: unknown) => {
        // Migration: ensure navPaneCollapsed is always false on version upgrade
        const state = persistedState as Record<string, unknown>;
        return { ...state, navPaneCollapsed: false };
      },
      onRehydrateStorage: () => (state) => {
        // Apply theme when store is rehydrated from localStorage
        if (state?.theme) {
          applyTheme(state.theme);
        }
      },
    }
  )
);
