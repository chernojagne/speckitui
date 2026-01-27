/**
 * Terminal Theme Configuration
 * Predefined themes for xterm.js that match shadcn/ui themes
 * 
 * @feature 006-more-themes - Extended to 15 themes
 */

import type { ITheme } from '@xterm/xterm';
import type { TerminalThemeId, AppPaletteId } from '@/types';

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

// Catppuccin Mocha theme (dark)
const catppuccinMochaTheme: ITheme = {
  background: '#1e1e2e',
  foreground: '#cdd6f4',
  cursor: '#f5e0dc',
  cursorAccent: '#1e1e2e',
  selectionBackground: '#45475a',
  selectionForeground: '#cdd6f4',
  selectionInactiveBackground: '#313244',
  black: '#45475a',
  red: '#f38ba8',
  green: '#a6e3a1',
  yellow: '#f9e2af',
  blue: '#89b4fa',
  magenta: '#cba6f7',
  cyan: '#94e2d5',
  white: '#bac2de',
  brightBlack: '#585b70',
  brightRed: '#f38ba8',
  brightGreen: '#a6e3a1',
  brightYellow: '#f9e2af',
  brightBlue: '#89b4fa',
  brightMagenta: '#cba6f7',
  brightCyan: '#94e2d5',
  brightWhite: '#a6adc8',
};

// Catppuccin Latte theme (light)
const catppuccinLatteTheme: ITheme = {
  background: '#eff1f5',
  foreground: '#4c4f69',
  cursor: '#dc8a78',
  cursorAccent: '#eff1f5',
  selectionBackground: '#ccd0da',
  selectionForeground: '#4c4f69',
  selectionInactiveBackground: '#e6e9ef',
  black: '#5c5f77',
  red: '#d20f39',
  green: '#40a02b',
  yellow: '#df8e1d',
  blue: '#1e66f5',
  magenta: '#8839ef',
  cyan: '#179299',
  white: '#acb0be',
  brightBlack: '#6c6f85',
  brightRed: '#d20f39',
  brightGreen: '#40a02b',
  brightYellow: '#df8e1d',
  brightBlue: '#1e66f5',
  brightMagenta: '#8839ef',
  brightCyan: '#179299',
  brightWhite: '#bcc0cc',
};

// Nord theme (works for both light/dark with Nord palette)
const nordTheme: ITheme = {
  background: '#2e3440',
  foreground: '#d8dee9',
  cursor: '#d8dee9',
  cursorAccent: '#2e3440',
  selectionBackground: '#434c5e',
  selectionForeground: '#d8dee9',
  selectionInactiveBackground: '#3b4252',
  black: '#3b4252',
  red: '#bf616a',
  green: '#a3be8c',
  yellow: '#ebcb8b',
  blue: '#81a1c1',
  magenta: '#b48ead',
  cyan: '#88c0d0',
  white: '#e5e9f0',
  brightBlack: '#4c566a',
  brightRed: '#bf616a',
  brightGreen: '#a3be8c',
  brightYellow: '#ebcb8b',
  brightBlue: '#81a1c1',
  brightMagenta: '#b48ead',
  brightCyan: '#8fbcbb',
  brightWhite: '#eceff4',
};

// Gruvbox Dark theme
const gruvboxDarkTheme: ITheme = {
  background: '#282828',
  foreground: '#ebdbb2',
  cursor: '#ebdbb2',
  cursorAccent: '#282828',
  selectionBackground: '#504945',
  selectionForeground: '#ebdbb2',
  selectionInactiveBackground: '#3c3836',
  black: '#282828',
  red: '#cc241d',
  green: '#98971a',
  yellow: '#d79921',
  blue: '#458588',
  magenta: '#b16286',
  cyan: '#689d6a',
  white: '#a89984',
  brightBlack: '#928374',
  brightRed: '#fb4934',
  brightGreen: '#b8bb26',
  brightYellow: '#fabd2f',
  brightBlue: '#83a598',
  brightMagenta: '#d3869b',
  brightCyan: '#8ec07c',
  brightWhite: '#ebdbb2',
};

// Gruvbox Light theme
const gruvboxLightTheme: ITheme = {
  background: '#fbf1c7',
  foreground: '#3c3836',
  cursor: '#3c3836',
  cursorAccent: '#fbf1c7',
  selectionBackground: '#d5c4a1',
  selectionForeground: '#3c3836',
  selectionInactiveBackground: '#ebdbb2',
  black: '#fbf1c7',
  red: '#cc241d',
  green: '#98971a',
  yellow: '#d79921',
  blue: '#458588',
  magenta: '#b16286',
  cyan: '#689d6a',
  white: '#7c6f64',
  brightBlack: '#928374',
  brightRed: '#9d0006',
  brightGreen: '#79740e',
  brightYellow: '#b57614',
  brightBlue: '#076678',
  brightMagenta: '#8f3f71',
  brightCyan: '#427b58',
  brightWhite: '#3c3836',
};

// Solarized Dark theme
const solarizedDarkTheme: ITheme = {
  background: '#002b36',
  foreground: '#839496',
  cursor: '#839496',
  cursorAccent: '#002b36',
  selectionBackground: '#073642',
  selectionForeground: '#93a1a1',
  selectionInactiveBackground: '#073642',
  black: '#073642',
  red: '#dc322f',
  green: '#859900',
  yellow: '#b58900',
  blue: '#268bd2',
  magenta: '#d33682',
  cyan: '#2aa198',
  white: '#eee8d5',
  brightBlack: '#002b36',
  brightRed: '#cb4b16',
  brightGreen: '#586e75',
  brightYellow: '#657b83',
  brightBlue: '#839496',
  brightMagenta: '#6c71c4',
  brightCyan: '#93a1a1',
  brightWhite: '#fdf6e3',
};

// Solarized Light theme
const solarizedLightTheme: ITheme = {
  background: '#fdf6e3',
  foreground: '#657b83',
  cursor: '#657b83',
  cursorAccent: '#fdf6e3',
  selectionBackground: '#eee8d5',
  selectionForeground: '#586e75',
  selectionInactiveBackground: '#eee8d5',
  black: '#073642',
  red: '#dc322f',
  green: '#859900',
  yellow: '#b58900',
  blue: '#268bd2',
  magenta: '#d33682',
  cyan: '#2aa198',
  white: '#eee8d5',
  brightBlack: '#002b36',
  brightRed: '#cb4b16',
  brightGreen: '#586e75',
  brightYellow: '#657b83',
  brightBlue: '#839496',
  brightMagenta: '#6c71c4',
  brightCyan: '#93a1a1',
  brightWhite: '#fdf6e3',
};

// One Dark theme
const oneDarkTheme: ITheme = {
  background: '#282c34',
  foreground: '#abb2bf',
  cursor: '#528bff',
  cursorAccent: '#282c34',
  selectionBackground: '#3e4451',
  selectionForeground: '#abb2bf',
  selectionInactiveBackground: '#3b3f4c',
  black: '#282c34',
  red: '#e06c75',
  green: '#98c379',
  yellow: '#e5c07b',
  blue: '#61afef',
  magenta: '#c678dd',
  cyan: '#56b6c2',
  white: '#abb2bf',
  brightBlack: '#5c6370',
  brightRed: '#e06c75',
  brightGreen: '#98c379',
  brightYellow: '#e5c07b',
  brightBlue: '#61afef',
  brightMagenta: '#c678dd',
  brightCyan: '#56b6c2',
  brightWhite: '#ffffff',
};

// Tokyo Night theme
const tokyoNightTheme: ITheme = {
  background: '#1a1b26',
  foreground: '#a9b1d6',
  cursor: '#c0caf5',
  cursorAccent: '#1a1b26',
  selectionBackground: '#33467c',
  selectionForeground: '#a9b1d6',
  selectionInactiveBackground: '#292e42',
  black: '#32344a',
  red: '#f7768e',
  green: '#9ece6a',
  yellow: '#e0af68',
  blue: '#7aa2f7',
  magenta: '#ad8ee6',
  cyan: '#449dab',
  white: '#787c99',
  brightBlack: '#444b6a',
  brightRed: '#ff7a93',
  brightGreen: '#b9f27c',
  brightYellow: '#ff9e64',
  brightBlue: '#7da6ff',
  brightMagenta: '#bb9af7',
  brightCyan: '#0db9d7',
  brightWhite: '#acb0d0',
};

export const terminalThemes: TerminalThemeConfig[] = [
  { id: 'dark', name: 'Dark', theme: darkTheme },
  { id: 'light', name: 'Light', theme: lightTheme },
  { id: 'caffeine-dark', name: 'Caffeine Dark', theme: caffeineDarkTheme },
  { id: 'caffeine-light', name: 'Caffeine Light', theme: caffeineLightTheme },
  { id: 'monokai', name: 'Monokai', theme: monokaiTheme },
  { id: 'dracula', name: 'Dracula', theme: draculaTheme },
  { id: 'catppuccin-mocha', name: 'Catppuccin Mocha', theme: catppuccinMochaTheme },
  { id: 'catppuccin-latte', name: 'Catppuccin Latte', theme: catppuccinLatteTheme },
  { id: 'nord', name: 'Nord', theme: nordTheme },
  { id: 'gruvbox-dark', name: 'Gruvbox Dark', theme: gruvboxDarkTheme },
  { id: 'gruvbox-light', name: 'Gruvbox Light', theme: gruvboxLightTheme },
  { id: 'solarized-dark', name: 'Solarized Dark', theme: solarizedDarkTheme },
  { id: 'solarized-light', name: 'Solarized Light', theme: solarizedLightTheme },
  { id: 'one-dark', name: 'One Dark', theme: oneDarkTheme },
  { id: 'tokyo-night', name: 'Tokyo Night', theme: tokyoNightTheme },
];

export function getTerminalTheme(id: TerminalThemeId): ITheme {
  const config = terminalThemes.find((t) => t.id === id);
  return config?.theme ?? darkTheme;
}

/**
 * Map from app palette to recommended terminal theme for each mode
 */
const paletteTerminalMap: Record<AppPaletteId, { dark: TerminalThemeId; light: TerminalThemeId }> = {
  caffeine: { dark: 'caffeine-dark', light: 'caffeine-light' },
  catppuccin: { dark: 'catppuccin-mocha', light: 'catppuccin-latte' },
  nord: { dark: 'nord', light: 'nord' },
  gruvbox: { dark: 'gruvbox-dark', light: 'gruvbox-light' },
  amber: { dark: 'dark', light: 'light' },
  blue: { dark: 'dark', light: 'light' },
  emerald: { dark: 'dark', light: 'light' },
  fuchsia: { dark: 'dracula', light: 'light' },
};

/**
 * Get the appropriate terminal theme based on app mode and palette
 * Maps 'auto' to the correct theme based on current app mode and palette
 */
export function getAutoTerminalTheme(mode: 'light' | 'dark', appPalette: AppPaletteId = 'caffeine'): TerminalThemeId {
  const mapping = paletteTerminalMap[appPalette];
  if (!mapping) {
    return mode === 'dark' ? 'caffeine-dark' : 'caffeine-light';
  }
  return mapping[mode];
}
