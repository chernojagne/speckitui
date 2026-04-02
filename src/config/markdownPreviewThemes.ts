/**
 * Markdown Preview Theme Registry
 * Defines CSS custom property values for markdown preview rendering
 *
 * @module config/markdownPreviewThemes
 */

import type { MarkdownPreviewThemeId } from '@/types';

type MarkdownThemeMode = 'light' | 'dark';

export interface MarkdownPreviewThemeColors {
  foreground: string;
  muted: string;
  h1: string;
  h2: string;
  h3: string;
  bold: string;
  italic: string;
  link: string;
  linkHover: string;
  code: string;
  codeBackground: string;
  inlineCodeBackground: string;
  border: string;
  blockquoteBorder: string;
  blockquoteBackground: string;
  tableHeaderBackground: string;
  tableRowAlt: string;
  highlightBackground: string;
}

export interface MarkdownPreviewThemeConfig {
  id: MarkdownPreviewThemeId;
  name: string;
  description: string;
  light: MarkdownPreviewThemeColors;
  dark: MarkdownPreviewThemeColors;
}

const DEFAULT_LIGHT: MarkdownPreviewThemeColors = {
  foreground: 'var(--foreground)',
  muted: 'var(--muted-foreground)',
  h1: 'var(--primary)',
  h2: 'var(--foreground)',
  h3: 'var(--muted-foreground)',
  bold: 'var(--primary)',
  italic: 'var(--muted-foreground)',
  link: 'var(--primary)',
  linkHover: 'var(--primary)',
  code: 'var(--foreground)',
  codeBackground: 'var(--muted)',
  inlineCodeBackground: 'var(--muted)',
  border: 'var(--border)',
  blockquoteBorder: 'var(--primary)',
  blockquoteBackground: 'var(--muted)',
  tableHeaderBackground: 'var(--card)',
  tableRowAlt: 'var(--muted)',
  highlightBackground: 'var(--accent)',
};

const DEFAULT_DARK: MarkdownPreviewThemeColors = {
  foreground: 'var(--foreground)',
  muted: 'var(--muted-foreground)',
  h1: 'var(--primary)',
  h2: 'var(--foreground)',
  h3: 'var(--muted-foreground)',
  bold: 'var(--primary)',
  italic: 'var(--muted-foreground)',
  link: 'var(--primary)',
  linkHover: 'var(--primary)',
  code: 'var(--foreground)',
  codeBackground: 'var(--muted)',
  inlineCodeBackground: 'var(--muted)',
  border: 'var(--border)',
  blockquoteBorder: 'var(--primary)',
  blockquoteBackground: 'var(--muted)',
  tableHeaderBackground: 'var(--card)',
  tableRowAlt: 'var(--muted)',
  highlightBackground: 'var(--accent)',
};

export const markdownPreviewThemes: MarkdownPreviewThemeConfig[] = [
  {
    id: 'default',
    name: 'Default',
    description: 'Matches the app palette tokens',
    light: DEFAULT_LIGHT,
    dark: DEFAULT_DARK,
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Clean, readable contrast inspired by GitHub',
    light: {
      foreground: '#24292f',
      muted: '#57606a',
      h1: '#0550ae',
      h2: '#24292f',
      h3: '#57606a',
      bold: '#0550ae',
      italic: '#57606a',
      link: '#0969da',
      linkHover: '#054da7',
      code: '#24292f',
      codeBackground: '#f6f8fa',
      inlineCodeBackground: '#f6f8fa',
      border: '#d0d7de',
      blockquoteBorder: '#d0d7de',
      blockquoteBackground: '#f6f8fa',
      tableHeaderBackground: '#f6f8fa',
      tableRowAlt: '#f6f8fa',
      highlightBackground: '#ddf4ff',
    },
    dark: {
      foreground: '#c9d1d9',
      muted: '#8b949e',
      h1: '#58a6ff',
      h2: '#f0f6fc',
      h3: '#8b949e',
      bold: '#58a6ff',
      italic: '#8b949e',
      link: '#58a6ff',
      linkHover: '#1f6feb',
      code: '#c9d1d9',
      codeBackground: '#161b22',
      inlineCodeBackground: '#161b22',
      border: '#30363d',
      blockquoteBorder: '#30363d',
      blockquoteBackground: '#0d1117',
      tableHeaderBackground: '#161b22',
      tableRowAlt: '#161b22',
      highlightBackground: '#1f6feb33',
    },
  },
  {
    id: 'nord',
    name: 'Nord',
    description: 'Cool arctic accents for headings and links',
    light: {
      foreground: '#2e3440',
      muted: '#4c566a',
      h1: '#5e81ac',
      h2: '#2e3440',
      h3: '#4c566a',
      bold: '#5e81ac',
      italic: '#4c566a',
      link: '#5e81ac',
      linkHover: '#81a1c1',
      code: '#2e3440',
      codeBackground: '#eceff4',
      inlineCodeBackground: '#e5e9f0',
      border: '#d8dee9',
      blockquoteBorder: '#81a1c1',
      blockquoteBackground: '#e5e9f0',
      tableHeaderBackground: '#e5e9f0',
      tableRowAlt: '#eceff4',
      highlightBackground: '#ebcb8b33',
    },
    dark: {
      foreground: '#d8dee9',
      muted: '#a6adc8',
      h1: '#88c0d0',
      h2: '#eceff4',
      h3: '#a6adc8',
      bold: '#88c0d0',
      italic: '#a6adc8',
      link: '#81a1c1',
      linkHover: '#88c0d0',
      code: '#d8dee9',
      codeBackground: '#2e3440',
      inlineCodeBackground: '#3b4252',
      border: '#434c5e',
      blockquoteBorder: '#81a1c1',
      blockquoteBackground: '#2e3440',
      tableHeaderBackground: '#3b4252',
      tableRowAlt: '#2e3440',
      highlightBackground: '#88c0d033',
    },
  },
  {
    id: 'solarized',
    name: 'Solarized',
    description: 'Balanced hues with readable accents',
    light: {
      foreground: '#586e75',
      muted: '#657b83',
      h1: '#268bd2',
      h2: '#073642',
      h3: '#657b83',
      bold: '#cb4b16',
      italic: '#657b83',
      link: '#268bd2',
      linkHover: '#2aa198',
      code: '#586e75',
      codeBackground: '#fdf6e3',
      inlineCodeBackground: '#f5efdc',
      border: '#eee8d5',
      blockquoteBorder: '#93a1a1',
      blockquoteBackground: '#fdf6e3',
      tableHeaderBackground: '#f5efdc',
      tableRowAlt: '#fdf6e3',
      highlightBackground: '#b5890033',
    },
    dark: {
      foreground: '#93a1a1',
      muted: '#839496',
      h1: '#268bd2',
      h2: '#eee8d5',
      h3: '#839496',
      bold: '#cb4b16',
      italic: '#839496',
      link: '#268bd2',
      linkHover: '#2aa198',
      code: '#93a1a1',
      codeBackground: '#002b36',
      inlineCodeBackground: '#073642',
      border: '#073642',
      blockquoteBorder: '#268bd2',
      blockquoteBackground: '#002b36',
      tableHeaderBackground: '#073642',
      tableRowAlt: '#002b36',
      highlightBackground: '#b5890033',
    },
  },
  {
    id: 'dracula',
    name: 'Dracula',
    description: 'Vibrant contrasts on deep backgrounds',
    light: {
      foreground: '#2b2a33',
      muted: '#5b5f6a',
      h1: '#6c5ce7',
      h2: '#1e1e24',
      h3: '#5b5f6a',
      bold: '#6c5ce7',
      italic: '#5b5f6a',
      link: '#6c5ce7',
      linkHover: '#4f46e5',
      code: '#2b2a33',
      codeBackground: '#f3f4f6',
      inlineCodeBackground: '#f3f4f6',
      border: '#e5e7eb',
      blockquoteBorder: '#6c5ce7',
      blockquoteBackground: '#f3f4f6',
      tableHeaderBackground: '#f3f4f6',
      tableRowAlt: '#f8fafc',
      highlightBackground: '#d946ef33',
    },
    dark: {
      foreground: '#f8f8f2',
      muted: '#b3b3bf',
      h1: '#bd93f9',
      h2: '#ff79c6',
      h3: '#8be9fd',
      bold: '#ff79c6',
      italic: '#8be9fd',
      link: '#8be9fd',
      linkHover: '#50fa7b',
      code: '#f8f8f2',
      codeBackground: '#282a36',
      inlineCodeBackground: '#44475a',
      border: '#44475a',
      blockquoteBorder: '#bd93f9',
      blockquoteBackground: '#282a36',
      tableHeaderBackground: '#44475a',
      tableRowAlt: '#282a36',
      highlightBackground: '#ff79c633',
    },
  },
  {
    id: 'gruvbox',
    name: 'Gruvbox',
    description: 'Warm, earthy tones with lively accents',
    light: {
      foreground: '#3c3836',
      muted: '#7c6f64',
      h1: '#9d0006',
      h2: '#282828',
      h3: '#7c6f64',
      bold: '#9d0006',
      italic: '#7c6f64',
      link: '#b57614',
      linkHover: '#af3a03',
      code: '#3c3836',
      codeBackground: '#fbf1c7',
      inlineCodeBackground: '#f2e5bc',
      border: '#ebdbb2',
      blockquoteBorder: '#b57614',
      blockquoteBackground: '#f2e5bc',
      tableHeaderBackground: '#f2e5bc',
      tableRowAlt: '#fbf1c7',
      highlightBackground: '#d7992133',
    },
    dark: {
      foreground: '#ebdbb2',
      muted: '#bdae93',
      h1: '#fb4934',
      h2: '#fabd2f',
      h3: '#83a598',
      bold: '#fb4934',
      italic: '#bdae93',
      link: '#fabd2f',
      linkHover: '#fe8019',
      code: '#ebdbb2',
      codeBackground: '#282828',
      inlineCodeBackground: '#3c3836',
      border: '#3c3836',
      blockquoteBorder: '#fabd2f',
      blockquoteBackground: '#282828',
      tableHeaderBackground: '#3c3836',
      tableRowAlt: '#282828',
      highlightBackground: '#fabd2f33',
    },
  },
];

export const MARKDOWN_PREVIEW_THEME_IDS = markdownPreviewThemes.map((theme) => theme.id);

export function getMarkdownPreviewTheme(id: MarkdownPreviewThemeId): MarkdownPreviewThemeConfig {
  return markdownPreviewThemes.find((theme) => theme.id === id) ?? markdownPreviewThemes[0];
}

export function applyMarkdownPreviewTheme(id: MarkdownPreviewThemeId, mode: MarkdownThemeMode) {
  const root = document.documentElement;
  const theme = getMarkdownPreviewTheme(id);
  const colors = mode === 'dark' ? theme.dark : theme.light;

  root.style.setProperty('--md-foreground', colors.foreground);
  root.style.setProperty('--md-muted', colors.muted);
  root.style.setProperty('--md-h1', colors.h1);
  root.style.setProperty('--md-h2', colors.h2);
  root.style.setProperty('--md-h3', colors.h3);
  root.style.setProperty('--md-bold', colors.bold);
  root.style.setProperty('--md-italic', colors.italic);
  root.style.setProperty('--md-link', colors.link);
  root.style.setProperty('--md-link-hover', colors.linkHover);
  root.style.setProperty('--md-code', colors.code);
  root.style.setProperty('--md-code-bg', colors.codeBackground);
  root.style.setProperty('--md-inline-code-bg', colors.inlineCodeBackground);
  root.style.setProperty('--md-border', colors.border);
  root.style.setProperty('--md-blockquote-border', colors.blockquoteBorder);
  root.style.setProperty('--md-blockquote-bg', colors.blockquoteBackground);
  root.style.setProperty('--md-table-header-bg', colors.tableHeaderBackground);
  root.style.setProperty('--md-table-row-alt', colors.tableRowAlt);
  root.style.setProperty('--md-highlight-bg', colors.highlightBackground);
}
