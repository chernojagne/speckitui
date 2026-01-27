# Quickstart: More Themes

**Feature**: 006-more-themes  
**Date**: 2026-01-21

## Overview

This guide covers implementing the expanded theming system with 4 independent theme contexts.

## Prerequisites

- Node.js 20+, Rust 1.75+
- SpeckitUI development environment running
- Familiarity with Zustand state management
- Understanding of CSS custom properties

## Key Files

| File | Purpose |
|------|---------|
| `src/config/appThemes.ts` | App palette definitions (NEW) |
| `src/config/terminalThemes.ts` | Terminal theme expansion (MODIFY) |
| `src/config/themePresets.ts` | Preset bundles (NEW) |
| `src/stores/settingsStore.ts` | State and actions (MODIFY) |
| `src/styles/globals.css` | Keep as default; palettes override dynamically |
| `src/hooks/useTheme.ts` | Theme resolution logic (NEW) |
| `src/components/settings/ThemeSettings.tsx` | UI for theme selection (NEW) |
| `src/components/shared/MarkdownRenderer.tsx` | Dynamic Shiki theme (MODIFY) |

## Implementation Sequence

### Phase 1: Configuration Files

1. **Create `src/config/appThemes.ts`**
   - Define `AppPaletteId` type
   - Export `palettes` object with light/dark CSS variable sets
   - Export `applyAppPalette(id, mode)` function

2. **Expand `src/config/terminalThemes.ts`**
   - Add 9 new terminal themes (Catppuccin, Nord, Gruvbox, Solarized, One Dark, Tokyo Night)
   - Update `TerminalThemeId` type
   - Add `autoThemeMap` for palette → terminal theme mapping

3. **Create `src/config/themePresets.ts`**
   - Define 4 presets: Full Catppuccin, Full Nord, Full Gruvbox, Full GitHub
   - Export `presets` array and `getPreset(id)` function

### Phase 2: State Management

4. **Update `src/types/index.ts`**
   - Add `AppPaletteId`, extended `TerminalThemeId`, `ThemePreset` types
   - Extend `AppSettings` interface with new theme fields

5. **Update `src/stores/settingsStore.ts`**
   - Add `appPalette`, `editorTheme`, `markdownTheme` state fields
   - Add corresponding setter actions
   - Add `applyThemePreset` action
   - Update `setTheme` to also apply palette

### Phase 3: Theme Hooks

6. **Create `src/hooks/useTheme.ts`**
   - `useAppTheme()` - Returns current palette and mode, applies on mount
   - `useTerminalTheme()` - Resolves "auto" mode to actual theme
   - `useEditorTheme()` - Returns Shiki theme for editor
   - `useMarkdownTheme()` - Returns Shiki theme for renderer

### Phase 4: Update Existing Components

7. **Update `src/components/shared/MarkdownRenderer.tsx`**
   - Use `useMarkdownTheme()` hook
   - Reload highlighter when theme changes
   - Handle theme loading gracefully

8. **Update terminal initialization**
   - Use `useTerminalTheme()` for resolved theme
   - Re-apply theme when settings change

### Phase 5: Settings UI

9. **Create `src/components/settings/ThemeSettings.tsx`**
   - Presets selector (button group or dropdown)
   - App palette selector with color swatches
   - Terminal theme dropdown with "Auto" option
   - Editor theme dropdown
   - Markdown theme dropdown

10. **Integrate into Settings panel**
    - Add ThemeSettings section to existing Settings component
    - Move existing mode toggle into ThemeSettings

## Testing Approach

### Unit Tests
- `appThemes.test.ts`: Verify palette structure, applyAppPalette function
- `terminalThemes.test.ts`: Verify theme retrieval, auto mapping
- `settingsStore.test.ts`: Verify state updates, preset application

### E2E Tests
- Select app palette → verify CSS variables change
- Select terminal theme → verify terminal colors
- Apply preset → verify all 4 contexts update
- Persist and reload → verify settings survive restart

## Common Patterns

### Applying App Palette

```typescript
// In settingsStore.ts
setAppPalette: (palette) => {
  const mode = get().theme === 'dark' ? 'dark' : 
               get().theme === 'light' ? 'light' :
               document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  applyAppPalette(palette, mode);
  set({ appPalette: palette });
},
```

### Resolving Auto Terminal Theme

```typescript
// In useTheme.ts
export function useTerminalTheme(): TerminalThemeId {
  const { terminalTheme, appPalette, theme } = useSettingsStore();
  
  if (terminalTheme !== 'auto') {
    return terminalTheme;
  }
  
  const mode = resolveMode(theme);
  return autoThemeMap[appPalette][mode];
}
```

### Dynamic Shiki Theme

```typescript
// In MarkdownRenderer.tsx
const markdownTheme = useMarkdownTheme();

useEffect(() => {
  // Recreate highlighter with new theme
  createHighlighter({
    themes: [markdownTheme],
    langs: COMMON_LANGUAGES,
  }).then(setHighlighter);
}, [markdownTheme]);
```

## Gotchas

1. **CSS Variable Priority**: Dynamic styles on `documentElement.style` override CSS file values
2. **Shiki Theme Loading**: Themes are loaded on-demand; handle async loading states
3. **Mode Sync**: When mode changes (light/dark), also re-apply the current palette for that mode
4. **Preset Application**: Fire-and-forget; don't track active preset state

## Success Criteria Checklist

- [ ] 8 app palettes available and apply correctly
- [ ] 15 terminal themes available, "Auto" resolves correctly
- [ ] 12 editor/markdown themes available via Shiki
- [ ] 4 presets apply all 4 contexts at once
- [ ] Theme changes apply within 100ms
- [ ] Settings persist across app restart
- [ ] No visual glitches when switching themes
