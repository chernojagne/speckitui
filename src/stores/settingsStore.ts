import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AppSettings, AppPaletteId, TerminalThemeId, ShikiThemeId, MarkdownPreviewThemeId } from '@/types';
import { applyAppPalette } from '@/config/appThemes';
import { getPresetValues } from '@/config/themePresets';
import { applyMarkdownPreviewTheme, MARKDOWN_PREVIEW_THEME_IDS } from '@/config/markdownPreviewThemes';

// Valid theme IDs for fallback validation (006-more-themes T055)
const VALID_APP_PALETTES: AppPaletteId[] = [
  'caffeine', 'catppuccin', 'nord', 'gruvbox', 'amber', 'blue', 'emerald', 'fuchsia'
];

const VALID_TERMINAL_THEMES: (TerminalThemeId | 'auto')[] = [
  'auto', 'dark', 'light', 'caffeine-dark', 'caffeine-light', 'monokai', 'dracula',
  'catppuccin-mocha', 'catppuccin-latte', 'nord', 'gruvbox-dark', 'gruvbox-light',
  'solarized-dark', 'solarized-light', 'one-dark', 'tokyo-night'
];

const VALID_SHIKI_THEMES: ShikiThemeId[] = [
  'github-dark', 'github-light', 'catppuccin-mocha', 'catppuccin-latte', 'nord',
  'dracula', 'monokai', 'one-dark-pro', 'solarized-dark', 'solarized-light',
  'tokyo-night', 'min-light'
];

const VALID_MARKDOWN_PREVIEW_THEMES: MarkdownPreviewThemeId[] = MARKDOWN_PREVIEW_THEME_IDS;

// Default theme values
const DEFAULT_APP_PALETTE: AppPaletteId = 'caffeine';
const DEFAULT_TERMINAL_THEME: TerminalThemeId | 'auto' = 'auto';
const DEFAULT_EDITOR_THEME: ShikiThemeId = 'github-dark';
const DEFAULT_MARKDOWN_THEME: ShikiThemeId = 'github-dark';
const DEFAULT_MARKDOWN_PREVIEW_THEME: MarkdownPreviewThemeId = 'default';
const DEFAULT_RADIUS = '0.625rem';

// Validation helpers
const isValidAppPalette = (value: unknown): value is AppPaletteId =>
  VALID_APP_PALETTES.includes(value as AppPaletteId);

const isValidTerminalTheme = (value: unknown): value is TerminalThemeId | 'auto' =>
  VALID_TERMINAL_THEMES.includes(value as TerminalThemeId | 'auto');

const isValidShikiTheme = (value: unknown): value is ShikiThemeId =>
  VALID_SHIKI_THEMES.includes(value as ShikiThemeId);

const isValidMarkdownPreviewTheme = (value: unknown): value is MarkdownPreviewThemeId =>
  VALID_MARKDOWN_PREVIEW_THEMES.includes(value as MarkdownPreviewThemeId);

// Helper to get current theme mode
const getThemeMode = (theme: 'light' | 'dark' | 'system'): 'light' | 'dark' => {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return theme;
};

// Helper to apply theme mode to document
const applyThemeMode = (theme: 'light' | 'dark' | 'system') => {
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

// Combined helper to apply theme mode and palette
const applyTheme = (
  theme: 'light' | 'dark' | 'system',
  appPalette: AppPaletteId
) => {
  applyThemeMode(theme);
  const mode = getThemeMode(theme);
  applyAppPalette(appPalette, mode);
};

// Apply corner radius override
const applyCornerRadius = (squareCorners: boolean) => {
  const root = document.documentElement;
  root.style.setProperty('--radius', squareCorners ? '0rem' : DEFAULT_RADIUS);
};

// Listen for system theme changes
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const state = useSettingsStore.getState();
    if (state.theme === 'system') {
      if (e.matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      // Re-apply palette with new mode
      applyAppPalette(state.appPalette, e.matches ? 'dark' : 'light');
      applyMarkdownPreviewTheme(state.markdownPreviewTheme, e.matches ? 'dark' : 'light');
    }
  });
}

interface SettingsState extends AppSettings {
  // Actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setAppPalette: (palette: AppPaletteId) => void;
  setTerminalPanelHeight: (height: number) => void;
  setTerminalPanelCollapsed: (collapsed: boolean) => void;
  addRecentProject: (path: string) => void;
  setLastProject: (path: string, specId?: string) => void;
  // Editor settings actions
  setEditorFontSize: (size: number) => void;
  setEditorLineNumbers: (show: boolean) => void;
  setEditorWordWrap: (wrap: boolean) => void;
  setEditorTheme: (theme: ShikiThemeId) => void;
  // Markdown settings actions
  setMarkdownTheme: (theme: ShikiThemeId) => void;
  // Markdown preview settings actions
  setMarkdownPreviewTheme: (theme: MarkdownPreviewThemeId) => void;
  // Sidebar settings actions
  setSidebarShowIcons: (show: boolean) => void;
  setSidebarCompactMode: (compact: boolean) => void;
  // UI settings actions
  setSquareCorners: (square: boolean) => void;
  // Terminal settings actions
  setTerminalFontSize: (size: number) => void;
  setTerminalFontFamily: (family: string) => void;
  setTerminalTheme: (theme: TerminalThemeId | 'auto') => void;
  setTerminalCursorBlink: (blink: boolean) => void;
  setDefaultTerminal: (shell: 'cmd' | 'powershell' | 'bash') => void;
  // Navigation pane settings actions
  setNavPaneWidth: (width: number) => void;
  setNavPaneCollapsed: (collapsed: boolean) => void;
  toggleNavPaneCollapsed: () => void;
  // Theme preset action
  applyThemePreset: (presetId: string) => void;
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
      // App palette (006-more-themes)
      appPalette: 'caffeine',
      // Editor settings
      editorFontSize: 14,
      editorLineNumbers: true,
      editorWordWrap: false,
      editorTheme: 'github-dark',
      // Markdown theme (006-more-themes)
      markdownTheme: 'github-dark',
      // Markdown preview theme
      markdownPreviewTheme: 'default',
      // Sidebar settings
      sidebarShowIcons: true,
      sidebarCompactMode: false,
      // UI settings
      squareCorners: false,
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
        const { appPalette } = get();
        applyTheme(theme, appPalette);
        applyMarkdownPreviewTheme(get().markdownPreviewTheme, getThemeMode(theme));
        set({ theme });
      },

      setAppPalette: (palette) => {
        const { theme } = get();
        const mode = getThemeMode(theme);
        applyAppPalette(palette, mode);
        set({ appPalette: palette });
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
      setEditorTheme: (theme) => set({ editorTheme: theme }),
      
      // Markdown settings actions
      setMarkdownTheme: (theme) => set({ markdownTheme: theme }),

      // Markdown preview settings actions
      setMarkdownPreviewTheme: (theme) => {
        applyMarkdownPreviewTheme(theme, getThemeMode(get().theme));
        set({ markdownPreviewTheme: theme });
      },
      
      // Sidebar settings actions
      setSidebarShowIcons: (show) => set({ sidebarShowIcons: show }),
      setSidebarCompactMode: (compact) => set({ sidebarCompactMode: compact }),

      // UI settings actions
      setSquareCorners: (square) => {
        applyCornerRadius(square);
        set({ squareCorners: square });
      },

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

      // Theme preset action
      applyThemePreset: (presetId) => {
        const values = getPresetValues(presetId);
        if (!values) {
          console.warn(`Theme preset "${presetId}" not found`);
          return;
        }
        const { theme } = get();
        const mode = getThemeMode(theme);
        applyAppPalette(values.appPalette, mode);
        set({
          appPalette: values.appPalette,
          terminalTheme: values.terminalTheme,
          editorTheme: values.editorTheme,
          markdownTheme: values.markdownTheme,
        });
      },
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
        if (!state) return;

        // Validate and fix invalid theme preferences (006-more-themes T055)
        let needsUpdate = false;
        const fixes: Partial<SettingsState> = {};

        if (!isValidAppPalette(state.appPalette)) {
          console.warn(`Invalid appPalette "${state.appPalette}", falling back to "${DEFAULT_APP_PALETTE}"`);
          fixes.appPalette = DEFAULT_APP_PALETTE;
          needsUpdate = true;
        }

        if (!isValidTerminalTheme(state.terminalTheme)) {
          console.warn(`Invalid terminalTheme "${state.terminalTheme}", falling back to "${DEFAULT_TERMINAL_THEME}"`);
          fixes.terminalTheme = DEFAULT_TERMINAL_THEME;
          needsUpdate = true;
        }

        if (!isValidShikiTheme(state.editorTheme)) {
          console.warn(`Invalid editorTheme "${state.editorTheme}", falling back to "${DEFAULT_EDITOR_THEME}"`);
          fixes.editorTheme = DEFAULT_EDITOR_THEME;
          needsUpdate = true;
        }

        if (!isValidShikiTheme(state.markdownTheme)) {
          console.warn(`Invalid markdownTheme "${state.markdownTheme}", falling back to "${DEFAULT_MARKDOWN_THEME}"`);
          fixes.markdownTheme = DEFAULT_MARKDOWN_THEME;
          needsUpdate = true;
        }

        if (!isValidMarkdownPreviewTheme(state.markdownPreviewTheme)) {
          console.warn(`Invalid markdownPreviewTheme "${state.markdownPreviewTheme}", falling back to "${DEFAULT_MARKDOWN_PREVIEW_THEME}"`);
          fixes.markdownPreviewTheme = DEFAULT_MARKDOWN_PREVIEW_THEME;
          needsUpdate = true;
        }

        // Apply fixes if any invalid values found
        if (needsUpdate) {
          useSettingsStore.setState(fixes);
        }

        // Apply theme mode and palette when store is rehydrated from localStorage
        const effectivePalette = (fixes.appPalette ?? state.appPalette) as AppPaletteId;
        if (state.theme) {
          applyTheme(state.theme, effectivePalette);
        }

        const effectiveMarkdownPreviewTheme = (fixes.markdownPreviewTheme ?? state.markdownPreviewTheme) as MarkdownPreviewThemeId;
        if (state.theme) {
          applyMarkdownPreviewTheme(effectiveMarkdownPreviewTheme, getThemeMode(state.theme));
        }

        if (typeof state.squareCorners === 'boolean') {
          applyCornerRadius(state.squareCorners);
        }
      },
    }
  )
);
