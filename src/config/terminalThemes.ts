/**
 * Terminal Theme Configuration
 * Predefined themes for xterm.js that match shadcn/ui themes
 */

import type { ITheme } from '@xterm/xterm';

export type TerminalThemeId = 'dark' | 'light' | 'caffeine-dark' | 'caffeine-light' | 'monokai' | 'dracula';

export interface TerminalThemeConfig {
  id: TerminalThemeId;
  name: string;
  theme: ITheme;
}

// Dark theme - matches shadcn dark mode
const darkTheme: ITheme = {
  background: '#1e1e1e',
  foreground: '#d4d4d4',
  cursor: '#d4d4d4',
  cursorAccent: '#1e1e1e',
  selectionBackground: '#264f78',
  selectionForeground: '#ffffff',
  selectionInactiveBackground: '#3a3d41',
  black: '#000000',
  red: '#cd3131',
  green: '#0dbc79',
  yellow: '#e5e510',
  blue: '#2472c8',
  magenta: '#bc3fbc',
  cyan: '#11a8cd',
  white: '#e5e5e5',
  brightBlack: '#666666',
  brightRed: '#f14c4c',
  brightGreen: '#23d18b',
  brightYellow: '#f5f543',
  brightBlue: '#3b8eea',
  brightMagenta: '#d670d6',
  brightCyan: '#29b8db',
  brightWhite: '#ffffff',
};

// Light theme - matches shadcn light mode
const lightTheme: ITheme = {
  background: '#ffffff',
  foreground: '#383a42',
  cursor: '#383a42',
  cursorAccent: '#ffffff',
  selectionBackground: '#add6ff',
  selectionForeground: '#000000',
  selectionInactiveBackground: '#e5ebf1',
  black: '#383a42',
  red: '#e45649',
  green: '#50a14f',
  yellow: '#c18401',
  blue: '#4078f2',
  magenta: '#a626a4',
  cyan: '#0184bc',
  white: '#a0a1a7',
  brightBlack: '#4f525e',
  brightRed: '#e06c75',
  brightGreen: '#98c379',
  brightYellow: '#e5c07b',
  brightBlue: '#61afef',
  brightMagenta: '#c678dd',
  brightCyan: '#56b6c2',
  brightWhite: '#ffffff',
};

// Caffeine Dark - matches the app's caffeine theme dark mode
const caffeineDarkTheme: ITheme = {
  background: '#1a1a1a',
  foreground: '#e8e8e8',
  cursor: '#d4a574',
  cursorAccent: '#1a1a1a',
  selectionBackground: '#4a4033',
  selectionForeground: '#ffffff',
  selectionInactiveBackground: '#333333',
  black: '#1a1a1a',
  red: '#e06c75',
  green: '#98c379',
  yellow: '#d4a574', // Coffee/caramel accent
  blue: '#61afef',
  magenta: '#c678dd',
  cyan: '#56b6c2',
  white: '#abb2bf',
  brightBlack: '#5c6370',
  brightRed: '#be5046',
  brightGreen: '#7ec16e',
  brightYellow: '#e5c07b',
  brightBlue: '#528bff',
  brightMagenta: '#7e3ff2',
  brightCyan: '#56b6c2',
  brightWhite: '#ffffff',
};

// Caffeine Light - matches the app's caffeine theme light mode
const caffeineLightTheme: ITheme = {
  background: '#faf8f5',
  foreground: '#3d3d3d',
  cursor: '#7a5230',
  cursorAccent: '#faf8f5',
  selectionBackground: '#e8dcc8',
  selectionForeground: '#3d3d3d',
  selectionInactiveBackground: '#f0ebe3',
  black: '#3d3d3d',
  red: '#c91b00',
  green: '#00a600',
  yellow: '#7a5230', // Coffee brown accent
  blue: '#0451a5',
  magenta: '#bc05bc',
  cyan: '#0598bc',
  white: '#808080',
  brightBlack: '#5c5c5c',
  brightRed: '#e74c3c',
  brightGreen: '#2ecc71',
  brightYellow: '#a67c52',
  brightBlue: '#3498db',
  brightMagenta: '#9b59b6',
  brightCyan: '#1abc9c',
  brightWhite: '#e8e8e8',
};

// Monokai theme
const monokaiTheme: ITheme = {
  background: '#272822',
  foreground: '#f8f8f2',
  cursor: '#f8f8f2',
  cursorAccent: '#272822',
  selectionBackground: '#49483e',
  selectionForeground: '#f8f8f2',
  selectionInactiveBackground: '#3e3d32',
  black: '#272822',
  red: '#f92672',
  green: '#a6e22e',
  yellow: '#f4bf75',
  blue: '#66d9ef',
  magenta: '#ae81ff',
  cyan: '#a1efe4',
  white: '#f8f8f2',
  brightBlack: '#75715e',
  brightRed: '#f92672',
  brightGreen: '#a6e22e',
  brightYellow: '#f4bf75',
  brightBlue: '#66d9ef',
  brightMagenta: '#ae81ff',
  brightCyan: '#a1efe4',
  brightWhite: '#f9f8f5',
};

// Dracula theme
const draculaTheme: ITheme = {
  background: '#282a36',
  foreground: '#f8f8f2',
  cursor: '#f8f8f2',
  cursorAccent: '#282a36',
  selectionBackground: '#44475a',
  selectionForeground: '#f8f8f2',
  selectionInactiveBackground: '#3e4052',
  black: '#21222c',
  red: '#ff5555',
  green: '#50fa7b',
  yellow: '#f1fa8c',
  blue: '#bd93f9',
  magenta: '#ff79c6',
  cyan: '#8be9fd',
  white: '#f8f8f2',
  brightBlack: '#6272a4',
  brightRed: '#ff6e6e',
  brightGreen: '#69ff94',
  brightYellow: '#ffffa5',
  brightBlue: '#d6acff',
  brightMagenta: '#ff92df',
  brightCyan: '#a4ffff',
  brightWhite: '#ffffff',
};

export const terminalThemes: TerminalThemeConfig[] = [
  { id: 'dark', name: 'Dark', theme: darkTheme },
  { id: 'light', name: 'Light', theme: lightTheme },
  { id: 'caffeine-dark', name: 'Caffeine Dark', theme: caffeineDarkTheme },
  { id: 'caffeine-light', name: 'Caffeine Light', theme: caffeineLightTheme },
  { id: 'monokai', name: 'Monokai', theme: monokaiTheme },
  { id: 'dracula', name: 'Dracula', theme: draculaTheme },
];

export function getTerminalTheme(id: TerminalThemeId): ITheme {
  const config = terminalThemes.find((t) => t.id === id);
  return config?.theme ?? darkTheme;
}

/**
 * Get the appropriate terminal theme based on app theme
 * Maps 'auto' to the correct theme based on current app mode
 */
export function getAutoTerminalTheme(appTheme: 'light' | 'dark' | 'system'): TerminalThemeId {
  if (appTheme === 'light') {
    return 'caffeine-light';
  }
  if (appTheme === 'dark') {
    return 'caffeine-dark';
  }
  // System theme - check actual document class
  const isDark = document.documentElement.classList.contains('dark');
  return isDark ? 'caffeine-dark' : 'caffeine-light';
}
