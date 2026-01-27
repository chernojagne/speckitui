# Research: More Themes

**Feature**: 006-more-themes  
**Date**: 2026-01-21  
**Status**: Complete

## Research Tasks

### 1. App Theme Palettes from Zippystarter

**Task**: Identify best palettes from zippystarter.com/themes for SpeckitUI

**Decision**: Use 8 curated palettes with broad aesthetic coverage

**Rationale**: Selected palettes cover different color preferences (warm, cool, neutral) and popular developer themes (Catppuccin, Nord, Gruvbox). Zippystarter provides shadcn-compatible CSS variable definitions.

**Selected Palettes**:
| Palette | Character | CSS Variable Source |
|---------|-----------|---------------------|
| Caffeine | Neutral warm (current default) | Existing globals.css |
| Catppuccin | Pastel dark, popular | zippystarter.com/themes |
| Nord | Cool blue-gray | zippystarter.com/themes |
| Gruvbox | Warm retro | zippystarter.com/themes |
| Amber | Warm orange accent | zippystarter.com/themes |
| Blue | Cool professional | zippystarter.com/themes |
| Emerald | Green accent | zippystarter.com/themes |
| Fuchsia | Vibrant pink accent | zippystarter.com/themes |

**Alternatives Considered**:
- Solarized: Excluded due to lower popularity in recent surveys
- Dracula: Excluded for app (terminal only) to avoid visual heaviness

---

### 2. Terminal Theme Expansion

**Task**: Determine which terminal themes to add to terminalThemes.ts

**Decision**: Expand from 6 to 14 themes with "Auto" mode enhancement

**Rationale**: Cover all major developer terminal themes. Existing 6 themes are a good base; add 8 more popular themes.

**Terminal Themes**:
| Theme | Mode | Source |
|-------|------|--------|
| Dark (existing) | Dark | Built-in |
| Light (existing) | Light | Built-in |
| Caffeine Dark (existing) | Dark | Built-in |
| Caffeine Light (existing) | Light | Built-in |
| Monokai (existing) | Dark | Built-in |
| Dracula (existing) | Dark | Built-in |
| Catppuccin Mocha | Dark | NEW |
| Catppuccin Latte | Light | NEW |
| Nord | Dark | NEW |
| Gruvbox Dark | Dark | NEW |
| Gruvbox Light | Light | NEW |
| Solarized Dark | Dark | NEW |
| Solarized Light | Light | NEW |
| One Dark | Dark | NEW |
| Tokyo Night | Dark | NEW |

**Auto Mode Mapping**:
| App Palette | Terminal Theme (Dark) | Terminal Theme (Light) |
|-------------|----------------------|------------------------|
| Caffeine | caffeine-dark | caffeine-light |
| Catppuccin | catppuccin-mocha | catppuccin-latte |
| Nord | nord | light |
| Gruvbox | gruvbox-dark | gruvbox-light |
| Amber | caffeine-dark | caffeine-light |
| Blue | dark | light |
| Emerald | dark | light |
| Fuchsia | dracula | light |

---

### 3. Shiki Theme Selection

**Task**: Select Shiki themes for editor and rendered markdown

**Decision**: Use 12 bundled Shiki themes covering major preferences

**Rationale**: Shiki 3.x has built-in themes that load on-demand. Selected themes match terminal themes for consistency option.

**Selected Shiki Themes**:
| Theme ID | Display Name | Mode |
|----------|--------------|------|
| github-dark | GitHub Dark | Dark |
| github-light | GitHub Light | Light |
| catppuccin-mocha | Catppuccin Mocha | Dark |
| catppuccin-latte | Catppuccin Latte | Light |
| nord | Nord | Dark |
| dracula | Dracula | Dark |
| monokai | Monokai | Dark |
| one-dark-pro | One Dark Pro | Dark |
| solarized-dark | Solarized Dark | Dark |
| solarized-light | Solarized Light | Light |
| tokyo-night | Tokyo Night | Dark |
| min-light | Min Light | Light |

**Integration Pattern**:
- MarkdownRenderer: Already uses Shiki singleton; extend to load selected theme dynamically
- Editor: If CodeMirror/Monaco is used, bridge Shiki themes or use native theme API

---

### 4. Theme Preset Bundles

**Task**: Define preset combinations for one-click theming

**Decision**: 4 presets covering major aesthetic families

**Rationale**: Presets should cover the most common "I want everything to match" scenarios.

**Presets**:
| Preset Name | App | Terminal | Editor | Markdown |
|-------------|-----|----------|--------|----------|
| Full Catppuccin | Catppuccin | catppuccin-mocha/latte | catppuccin-mocha | catppuccin-mocha |
| Full Nord | Nord | nord | nord | nord |
| Full Gruvbox | Gruvbox | gruvbox-dark/light | github-dark | github-dark |
| Full GitHub | Caffeine | dark/light | github-dark | github-dark |

---

### 5. CSS Variable Application Strategy

**Task**: How to apply app palette changes without page reload

**Decision**: Use CSS custom properties on `:root` with JavaScript updates

**Rationale**: Current approach in globals.css uses CSS variables. Extending this pattern:
1. Define each palette as a set of CSS variable values
2. Apply by setting variables on `document.documentElement.style`
3. Persist selection in settingsStore (Zustand persist)

**Pattern**:
```typescript
// appThemes.ts
export const palettes = {
  catppuccin: {
    light: { '--background': '...', '--foreground': '...', ... },
    dark: { '--background': '...', '--foreground': '...', ... },
  },
  // ...
};

// Apply function
function applyAppPalette(palette: string, mode: 'light' | 'dark') {
  const vars = palettes[palette][mode];
  Object.entries(vars).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value);
  });
}
```

---

### 6. Settings UI Organization

**Task**: How to organize theme settings in the Settings panel

**Decision**: Single "Appearance" section with 4 subsections + presets at top

**Rationale**: Group related settings logically; presets first for quick setup.

**UI Structure**:
```
Appearance
├── Theme Presets (dropdown or button group)
├── Light/Dark Mode (existing toggle, moved here)
├── App Theme (palette selector with preview swatches)
├── Terminal Theme (dropdown with "Auto" option)
├── Editor Theme (dropdown)
└── Markdown Theme (dropdown)
```

---

## Summary

All research tasks complete. No NEEDS CLARIFICATION items remain.

| Topic | Decision |
|-------|----------|
| App palettes | 8 palettes: Caffeine, Catppuccin, Nord, Gruvbox, Amber, Blue, Emerald, Fuchsia |
| Terminal themes | 15 themes (6 existing + 9 new) with Auto mode mapping |
| Shiki themes | 12 themes for editor/markdown |
| Presets | 4 unified presets |
| CSS strategy | Dynamic CSS variable updates on `:root` |
| Settings UI | Single "Appearance" section with presets at top |
