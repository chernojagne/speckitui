import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AppSettings } from '@/types';

interface SettingsState extends AppSettings {
  // Actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setTerminalPanelHeight: (height: number) => void;
  setTerminalPanelCollapsed: (collapsed: boolean) => void;
  addRecentProject: (path: string) => void;
  setLastProject: (path: string, specId?: string) => void;
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

      // Actions
      setTheme: (theme) => set({ theme }),

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
    }),
    {
      name: 'speckitui-settings',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
