# Data Model: More Themes

**Feature**: 006-more-themes  
**Date**: 2026-01-21  
**Status**: Complete

## Entities

### AppThemePalette

A named collection of CSS custom property values defining a complete UI color scheme.

| Field | Type | Description |
|-------|------|-------------|
| id | `string` | Unique identifier (e.g., "catppuccin", "nord") |
| name | `string` | Display name (e.g., "Catppuccin", "Nord") |
| light | `Record<string, string>` | CSS variable values for light mode |
| dark | `Record<string, string>` | CSS variable values for dark mode |

**CSS Variables Required** (per shadcn/ui):
- `--background`, `--foreground`
- `--card`, `--card-foreground`
- `--popover`, `--popover-foreground`
- `--primary`, `--primary-foreground`
- `--secondary`, `--secondary-foreground`
- `--muted`, `--muted-foreground`
- `--accent`, `--accent-foreground`
- `--destructive`, `--destructive-foreground`
- `--border`, `--input`, `--ring`
- `--sidebar`, `--sidebar-foreground`, `--sidebar-*` variants
- `--success`, `--success-foreground`
- `--warning`, `--warning-foreground`

---

### TerminalTheme

An xterm.js ITheme configuration for terminal colors.

| Field | Type | Description |
|-------|------|-------------|
| id | `TerminalThemeId` | Unique identifier |
| name | `string` | Display name |
| theme | `ITheme` | xterm.js theme object |

**ITheme Properties**:
- `background`, `foreground`, `cursor`, `cursorAccent`
- `selectionBackground`, `selectionForeground`, `selectionInactiveBackground`
- 16 ANSI colors: `black`, `red`, `green`, `yellow`, `blue`, `magenta`, `cyan`, `white`
- 8 bright variants: `brightBlack`, `brightRed`, etc.

---

### EditorTheme / MarkdownTheme

A Shiki-compatible theme identifier.

| Field | Type | Description |
|-------|------|-------------|
| id | `BundledTheme` | Shiki theme identifier (e.g., "github-dark") |
| name | `string` | Display name |
| mode | `'light' \| 'dark'` | Theme mode for filtering |

---

### ThemePreset

A named bundle that configures all 4 theme contexts at once.

| Field | Type | Description |
|-------|------|-------------|
| id | `string` | Unique identifier (e.g., "full-catppuccin") |
| name | `string` | Display name (e.g., "Full Catppuccin") |
| appPalette | `string` | App palette ID |
| terminalTheme | `TerminalThemeId` | Terminal theme ID (or "auto") |
| editorTheme | `BundledTheme` | Editor Shiki theme |
| markdownTheme | `BundledTheme` | Markdown Shiki theme |

---

### ThemePreferences (extends AppSettings)

User's saved theme selections, persisted via Zustand.

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| theme | `'light' \| 'dark' \| 'system'` | `'system'` | Light/dark mode (existing) |
| appPalette | `AppPaletteId` | `'caffeine'` | Selected app palette |
| terminalTheme | `TerminalThemeId \| 'auto'` | `'auto'` | Terminal theme selection |
| editorTheme | `BundledTheme` | `'github-dark'` | Editor syntax theme |
| markdownTheme | `BundledTheme` | `'github-dark'` | Rendered markdown code theme |

---

## Type Definitions

```typescript
// src/types/index.ts additions

export type AppPaletteId = 
  | 'caffeine' 
  | 'catppuccin' 
  | 'nord' 
  | 'gruvbox' 
  | 'amber' 
  | 'blue' 
  | 'emerald' 
  | 'fuchsia';

export type TerminalThemeId = 
  | 'dark' 
  | 'light' 
  | 'caffeine-dark' 
  | 'caffeine-light' 
  | 'monokai' 
  | 'dracula'
  | 'catppuccin-mocha'
  | 'catppuccin-latte'
  | 'nord'
  | 'gruvbox-dark'
  | 'gruvbox-light'
  | 'solarized-dark'
  | 'solarized-light'
  | 'one-dark'
  | 'tokyo-night';

export interface ThemePreset {
  id: string;
  name: string;
  appPalette: AppPaletteId;
  terminalTheme: TerminalThemeId | 'auto';
  editorTheme: BundledTheme;
  markdownTheme: BundledTheme;
}
```

---

## State Shape

```typescript
// settingsStore.ts extended state
interface SettingsState extends AppSettings {
  // Existing fields...
  
  // Theme preferences (new)
  appPalette: AppPaletteId;
  editorTheme: BundledTheme;
  markdownTheme: BundledTheme;
  
  // Actions (new)
  setAppPalette: (palette: AppPaletteId) => void;
  setEditorTheme: (theme: BundledTheme) => void;
  setMarkdownTheme: (theme: BundledTheme) => void;
  applyThemePreset: (presetId: string) => void;
}
```

---

## Relationships

```
ThemePreset
    ├── references → AppThemePalette (by id)
    ├── references → TerminalTheme (by id)
    ├── references → EditorTheme (Shiki BundledTheme)
    └── references → MarkdownTheme (Shiki BundledTheme)

ThemePreferences
    ├── stores → appPalette (AppPaletteId)
    ├── stores → terminalTheme (TerminalThemeId | 'auto')
    ├── stores → editorTheme (BundledTheme)
    └── stores → markdownTheme (BundledTheme)

MarkdownRenderer
    └── uses → markdownTheme (from settingsStore)

Terminal (xterm.js)
    └── uses → terminalTheme resolved via useTheme hook

App UI (CSS)
    └── uses → appPalette applied to :root CSS variables
```
