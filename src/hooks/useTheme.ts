/**
 * Theme hooks for accessing resolved theme values
 * Provides convenient access to current theme settings with mode resolution
 * 
 * @module hooks/useTheme
 * @feature 006-more-themes
 */

import { useMemo, useSyncExternalStore } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import { getTerminalTheme, getAutoTerminalTheme } from '@/config/terminalThemes';
import { getEditorTheme, getShikiThemeName } from '@/config/editorThemes';
import { getAppPalette } from '@/config/appThemes';
import { findMatchingPreset } from '@/config/themePresets';
import type { TerminalThemeId } from '@/types';
import type { ITheme } from '@xterm/xterm';

/**
 * Subscribe to system color scheme changes
 * Handles edge cases like missing matchMedia support (T056)
 */
function subscribeToSystemTheme(callback: () => void) {
  // Edge case: matchMedia not supported
  if (typeof window === 'undefined' || !window.matchMedia) {
    return () => {};
  }
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  // Edge case: older browsers may not support addEventListener
  if (mq.addEventListener) {
    mq.addEventListener('change', callback);
    return () => mq.removeEventListener('change', callback);
  } else if (mq.addListener) {
    // Deprecated but needed for older Safari
    mq.addListener(callback);
    return () => mq.removeListener(callback);
  }
  return () => {};
}

/**
 * Get current system theme preference
 * Returns 'dark' as fallback if matchMedia not available (T056)
 */
function getSystemTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return 'dark'; // Fallback for environments without matchMedia
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Get snapshot of system theme for SSR
 */
function getServerSnapshot(): 'dark' | 'light' {
  return 'dark'; // Default to dark for SSR
}

/**
 * Hook to get the current theme mode (resolved from system if needed)
 * Reactively updates when system preference changes
 */
export function useThemeMode(): 'dark' | 'light' {
  const theme = useSettingsStore((state) => state.theme);
  
  const systemTheme = useSyncExternalStore(
    subscribeToSystemTheme,
    getSystemTheme,
    getServerSnapshot
  );

  return theme === 'system' ? systemTheme : theme;
}

/**
 * Hook for app palette configuration and actions
 */
export function useAppTheme() {
  const appPalette = useSettingsStore((state) => state.appPalette);
  const setAppPalette = useSettingsStore((state) => state.setAppPalette);
  const mode = useThemeMode();

  const paletteConfig = useMemo(() => getAppPalette(appPalette), [appPalette]);

  return {
    /** Current palette ID */
    paletteId: appPalette,
    /** Current palette configuration */
    palette: paletteConfig,
    /** Current mode (light/dark) */
    mode,
    /** Set a new palette */
    setPalette: setAppPalette,
  };
}

/**
 * Hook for terminal theme configuration and actions
 */
export function useTerminalTheme() {
  const terminalTheme = useSettingsStore((state) => state.terminalTheme);
  const appPalette = useSettingsStore((state) => state.appPalette);
  const setTerminalTheme = useSettingsStore((state) => state.setTerminalTheme);
  const mode = useThemeMode();

  // Resolve 'auto' to actual theme based on mode and palette
  const resolvedThemeId = useMemo((): TerminalThemeId => {
    if (terminalTheme === 'auto') {
      return getAutoTerminalTheme(mode, appPalette) as TerminalThemeId;
    }
    return terminalTheme;
  }, [terminalTheme, mode, appPalette]);

  // Get the actual theme configuration
  const themeConfig = useMemo(() => getTerminalTheme(resolvedThemeId), [resolvedThemeId]);

  return {
    /** Current theme setting ('auto' or specific theme) */
    themeSetting: terminalTheme,
    /** Resolved theme ID (never 'auto') */
    themeId: resolvedThemeId,
    /** Terminal theme configuration for xterm.js */
    theme: themeConfig as ITheme,
    /** Whether auto mode is enabled */
    isAuto: terminalTheme === 'auto',
    /** Set terminal theme */
    setTheme: setTerminalTheme,
  };
}

/**
 * Hook for editor (code) theme configuration and actions
 */
export function useEditorTheme() {
  const editorTheme = useSettingsStore((state) => state.editorTheme);
  const setEditorTheme = useSettingsStore((state) => state.setEditorTheme);
  const mode = useThemeMode();

  const themeConfig = useMemo(() => getEditorTheme(editorTheme), [editorTheme]);
  const shikiThemeName = useMemo(() => getShikiThemeName(editorTheme), [editorTheme]);

  return {
    /** Current editor theme ID */
    themeId: editorTheme,
    /** Editor theme configuration */
    theme: themeConfig,
    /** Shiki theme name for syntax highlighting */
    shikiTheme: shikiThemeName,
    /** Current mode (light/dark) */
    mode,
    /** Set editor theme */
    setTheme: setEditorTheme,
  };
}

/**
 * Hook for markdown preview theme configuration and actions
 */
export function useMarkdownTheme() {
  const markdownTheme = useSettingsStore((state) => state.markdownTheme);
  const setMarkdownTheme = useSettingsStore((state) => state.setMarkdownTheme);
  const mode = useThemeMode();

  const themeConfig = useMemo(() => getEditorTheme(markdownTheme), [markdownTheme]);
  const shikiThemeName = useMemo(() => getShikiThemeName(markdownTheme), [markdownTheme]);

  return {
    /** Current markdown theme ID */
    themeId: markdownTheme,
    /** Markdown theme configuration */
    theme: themeConfig,
    /** Shiki theme name for syntax highlighting */
    shikiTheme: shikiThemeName,
    /** Current mode (light/dark) */
    mode,
    /** Set markdown theme */
    setTheme: setMarkdownTheme,
  };
}

/**
 * Hook for theme presets
 */
export function useThemePreset() {
  const appPalette = useSettingsStore((state) => state.appPalette);
  const terminalTheme = useSettingsStore((state) => state.terminalTheme);
  const editorTheme = useSettingsStore((state) => state.editorTheme);
  const markdownTheme = useSettingsStore((state) => state.markdownTheme);
  const applyThemePreset = useSettingsStore((state) => state.applyThemePreset);

  // Check if current settings match any preset
  const matchingPresetId = useMemo(
    () => findMatchingPreset(appPalette, terminalTheme, editorTheme, markdownTheme),
    [appPalette, terminalTheme, editorTheme, markdownTheme]
  );

  return {
    /** ID of the currently matching preset, or undefined */
    currentPresetId: matchingPresetId,
    /** Whether current settings match any preset */
    hasMatchingPreset: matchingPresetId !== undefined,
    /** Apply a theme preset */
    applyPreset: applyThemePreset,
  };
}

/**
 * Combined hook for all theme settings
 * Provides a unified interface for theme management
 */
export function useTheme() {
  const app = useAppTheme();
  const terminal = useTerminalTheme();
  const editor = useEditorTheme();
  const markdown = useMarkdownTheme();
  const preset = useThemePreset();
  const mode = useThemeMode();

  return {
    /** Current theme mode (light/dark) */
    mode,
    /** App theme settings */
    app,
    /** Terminal theme settings */
    terminal,
    /** Editor theme settings */
    editor,
    /** Markdown theme settings */
    markdown,
    /** Preset management */
    preset,
  };
}
