/**
 * Theme Presets Registry
 * Pre-configured theme bundles that set all 4 themable components at once
 * 
 * @module config/themePresets
 * @feature 006-more-themes
 */

import type { ThemePreset, AppPaletteId, TerminalThemeId, ShikiThemeId } from '@/types';

/**
 * 4 pre-configured theme presets for quick switching
 * Each preset applies cohesive styling across all components
 */
export const themePresets: ThemePreset[] = [
  {
    id: 'caffeine',
    name: 'Caffeine',
    appPalette: 'caffeine',
    terminalTheme: 'caffeine-dark',
    editorTheme: 'github-dark',
    markdownTheme: 'github-dark',
  },
  {
    id: 'catppuccin',
    name: 'Catppuccin',
    appPalette: 'catppuccin',
    terminalTheme: 'catppuccin-mocha',
    editorTheme: 'catppuccin-mocha',
    markdownTheme: 'catppuccin-mocha',
  },
  {
    id: 'nord',
    name: 'Nord',
    appPalette: 'nord',
    terminalTheme: 'nord',
    editorTheme: 'nord',
    markdownTheme: 'nord',
  },
  {
    id: 'gruvbox',
    name: 'Gruvbox',
    appPalette: 'gruvbox',
    terminalTheme: 'gruvbox-dark',
    editorTheme: 'monokai', // Gruvbox not in Shiki, use similar warm tones
    markdownTheme: 'monokai',
  },
];

/**
 * Get a specific theme preset by ID
 */
export function getThemePreset(id: string): ThemePreset | undefined {
  return themePresets.find((preset) => preset.id === id);
}

/**
 * Get the default theme preset (Caffeine)
 */
export function getDefaultThemePreset(): ThemePreset {
  return themePresets[0];
}

/**
 * Apply a theme preset by returning all theme values
 * This is a pure function - actual application happens in the store
 */
export interface ThemePresetValues {
  appPalette: AppPaletteId;
  terminalTheme: TerminalThemeId | 'auto';
  editorTheme: ShikiThemeId;
  markdownTheme: ShikiThemeId;
}

export function getPresetValues(presetId: string): ThemePresetValues | undefined {
  const preset = getThemePreset(presetId);
  if (!preset) return undefined;
  
  return {
    appPalette: preset.appPalette,
    terminalTheme: preset.terminalTheme,
    editorTheme: preset.editorTheme,
    markdownTheme: preset.markdownTheme,
  };
}

/**
 * Check if current settings match any preset
 * Returns the matching preset ID or undefined
 */
export function findMatchingPreset(
  appPalette: AppPaletteId,
  terminalTheme: TerminalThemeId | 'auto',
  editorTheme: ShikiThemeId,
  markdownTheme: ShikiThemeId
): string | undefined {
  const matchingPreset = themePresets.find(
    (preset) =>
      preset.appPalette === appPalette &&
      preset.terminalTheme === terminalTheme &&
      preset.editorTheme === editorTheme &&
      preset.markdownTheme === markdownTheme
  );
  
  return matchingPreset?.id;
}
