/**
 * Editor/Markdown Syntax Highlighting Theme Registry
 * Uses Shiki bundled themes for syntax highlighting
 * 
 * @module config/editorThemes
 * @feature 006-more-themes
 */

import type { ShikiThemeId } from '@/types';

export interface EditorThemeConfig {
  id: ShikiThemeId;
  name: string;
  type: 'dark' | 'light';
  shikiName: string; // The actual Shiki bundled theme name
}

/**
 * Registry of available Shiki themes for editor and markdown rendering
 * 12 themes total: 7 dark, 5 light
 */
export const editorThemes: EditorThemeConfig[] = [
  // Dark themes
  {
    id: 'github-dark',
    name: 'GitHub Dark',
    type: 'dark',
    shikiName: 'github-dark',
  },
  {
    id: 'catppuccin-mocha',
    name: 'Catppuccin Mocha',
    type: 'dark',
    shikiName: 'catppuccin-mocha',
  },
  {
    id: 'nord',
    name: 'Nord',
    type: 'dark',
    shikiName: 'nord',
  },
  {
    id: 'dracula',
    name: 'Dracula',
    type: 'dark',
    shikiName: 'dracula',
  },
  {
    id: 'monokai',
    name: 'Monokai',
    type: 'dark',
    shikiName: 'monokai',
  },
  {
    id: 'one-dark-pro',
    name: 'One Dark Pro',
    type: 'dark',
    shikiName: 'one-dark-pro',
  },
  {
    id: 'tokyo-night',
    name: 'Tokyo Night',
    type: 'dark',
    shikiName: 'tokyo-night',
  },
  // Light themes
  {
    id: 'github-light',
    name: 'GitHub Light',
    type: 'light',
    shikiName: 'github-light',
  },
  {
    id: 'catppuccin-latte',
    name: 'Catppuccin Latte',
    type: 'light',
    shikiName: 'catppuccin-latte',
  },
  {
    id: 'solarized-dark',
    name: 'Solarized Dark',
    type: 'dark',
    shikiName: 'solarized-dark',
  },
  {
    id: 'solarized-light',
    name: 'Solarized Light',
    type: 'light',
    shikiName: 'solarized-light',
  },
  {
    id: 'min-light',
    name: 'Min Light',
    type: 'light',
    shikiName: 'min-light',
  },
];

/**
 * Get a specific editor theme configuration by ID
 */
export function getEditorTheme(id: ShikiThemeId): EditorThemeConfig | undefined {
  return editorThemes.find((theme) => theme.id === id);
}

/**
 * Get the Shiki theme name for a given theme ID
 * Falls back to github-dark if not found
 */
export function getShikiThemeName(id: ShikiThemeId): string {
  const theme = getEditorTheme(id);
  return theme?.shikiName ?? 'github-dark';
}

/**
 * Get all dark editor themes
 */
export function getDarkEditorThemes(): EditorThemeConfig[] {
  return editorThemes.filter((theme) => theme.type === 'dark');
}

/**
 * Get all light editor themes
 */
export function getLightEditorThemes(): EditorThemeConfig[] {
  return editorThemes.filter((theme) => theme.type === 'light');
}

/**
 * Get themes compatible with a system theme mode
 * Returns themes matching the mode, with fallback to all themes
 */
export function getEditorThemesForMode(mode: 'dark' | 'light'): EditorThemeConfig[] {
  return mode === 'dark' ? getDarkEditorThemes() : getLightEditorThemes();
}

/**
 * Get a default theme for a given mode
 */
export function getDefaultEditorTheme(mode: 'dark' | 'light'): ShikiThemeId {
  return mode === 'dark' ? 'github-dark' : 'github-light';
}
