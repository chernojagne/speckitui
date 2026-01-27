# Implementation Plan: More Themes

**Branch**: `006-more-themes` | **Date**: 2026-01-21 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/006-more-themes/spec.md`

## Summary

Expand SpeckitUI's theming system to support 4 independently configurable theme contexts (App UI, Terminal, Code Editor, Rendered Markdown) with popular palettes from zippystarter.com, xterm.js terminal themes, and Shiki-based syntax highlighting themes. Include theme presets for one-click unified theming and an "Auto" mode for terminal that adapts to app theme.

## Technical Context

**Language/Version**: TypeScript 5.x (frontend), Rust 1.75+ (Tauri backend)  
**Primary Dependencies**: React 19, Tauri 2.9, shadcn/ui (Radix), Zustand, xterm.js, react-markdown, Shiki 3.21  
**Storage**: Zustand persist middleware (localStorage)  
**Testing**: Vitest for unit tests, Playwright for E2E (per Constitution)  
**Target Platform**: Windows, macOS, Linux desktop (Tauri)
**Project Type**: Tauri desktop app (Rust + React)  
**Performance Goals**: Theme changes <100ms (per spec SC-005), markdown render <500ms (per Constitution)  
**Constraints**: Local-first, single user, single project (per Constitution)  
**Scale/Scope**: 8 app palettes, 15 terminal themes, 12 editor/markdown themes, 4 presets

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Simplicity First | ✅ Pass | Extends existing patterns (CSS vars, settingsStore, terminalThemes.ts) |
| II. Local-First | ✅ Pass | All themes stored locally, no remote dependencies |
| III. Tauri Standard Patterns | ✅ Pass | No new IPC commands needed; purely frontend theming |
| IV. Test-First Development | ⚠️ Defer | Tests will be written with implementation per tasks.md |
| V. Spec-Kit Compatibility | ✅ Pass | No impact on spec-kit directory structure |
| VI. shadcn/ui Component Library | ✅ Pass | Theme selector will use shadcn/ui Select, RadioGroup |
| VII. Performance Budgets | ✅ Pass | Theme switching is CSS variable updates; <100ms target achievable |

**Quality Gates**:
- ✅ Pre-Implementation Gate: spec.md exists, plan.md (this file) exists
- ⏳ Test Gate: To be satisfied during implementation
- ✅ Contract Gate: No new IPC contracts needed (frontend-only feature)

**Post-Design Re-Check (2026-01-21)**:
- ✅ All principles still satisfied after Phase 1 design
- ✅ No new complexity introduced
- ✅ Data model uses existing type patterns
- ✅ No backend modifications required

## Project Structure

### Documentation (this feature)

```text
specs/006-more-themes/
├── spec.md              # Feature specification ✅
├── plan.md              # This file ✅
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (empty - no IPC needed)
│   └── ipc-api.md       # Placeholder noting no backend changes
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── config/
│   ├── terminalThemes.ts      # Expand with 12+ themes, add mappings
│   ├── appThemes.ts           # NEW: App palette definitions (CSS var sets)
│   ├── editorThemes.ts        # NEW: Shiki theme config for editor
│   └── themePresets.ts        # NEW: Preset bundles
├── stores/
│   └── settingsStore.ts       # Extend with new theme preferences
├── styles/
│   └── globals.css            # Add new palette CSS classes
├── types/
│   └── index.ts               # Add theme-related type definitions
├── components/
│   ├── settings/
│   │   ├── ThemeSettings.tsx  # NEW: Combined theme settings section
│   │   └── ThemePreview.tsx   # NEW: Live preview component
│   └── shared/
│       └── MarkdownRenderer.tsx # Update to use dynamic Shiki theme
└── hooks/
    └── useTheme.ts            # NEW: Theme resolution hook (Auto mode logic)
```

**Structure Decision**: Extends existing single-project structure. New theme configuration files in `src/config/`, UI components in `src/components/settings/`, state in existing `settingsStore.ts`.

## Complexity Tracking

> No Constitution violations requiring justification.
