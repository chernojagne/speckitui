# Tasks: More Themes

**Input**: Design documents from `/specs/006-more-themes/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, quickstart.md ✅

**Tests**: Not explicitly requested in spec - tests are OPTIONAL for this feature.

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1-US5)
- All paths are relative to repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Type definitions and shared configuration structure

- [X] T001 Add theme-related type definitions in src/types/index.ts
- [X] T002 [P] Create Shiki theme registry in src/config/editorThemes.ts
- [X] T003 [P] Create theme presets configuration in src/config/themePresets.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core theme infrastructure that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Create app palette definitions with 8 palettes in src/config/appThemes.ts
- [X] T005 Create applyAppPalette function in src/config/appThemes.ts
- [X] T006 Extend settingsStore with new theme preference fields in src/stores/settingsStore.ts
- [X] T007 Add theme setter actions to settingsStore in src/stores/settingsStore.ts
- [X] T008 [P] Create useTheme hook with mode resolution in src/hooks/useTheme.ts
- [X] T009 [P] Export useTheme hook from src/hooks/index.ts

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Customize App Theme from Popular Palettes (Priority: P1) 🎯 MVP

**Goal**: Users can select from 8 app theme palettes that apply immediately to all UI components

**Independent Test**: Open Settings → App Theme → Select "Nord" → Verify sidebar, cards, buttons all update to Nord colors

### Implementation for User Story 1

- [X] T010 [US1] Define Caffeine palette (light/dark CSS vars) in src/config/appThemes.ts
- [X] T011 [P] [US1] Define Catppuccin palette (light/dark CSS vars) in src/config/appThemes.ts
- [X] T012 [P] [US1] Define Nord palette (light/dark CSS vars) in src/config/appThemes.ts
- [X] T013 [P] [US1] Define Gruvbox palette (light/dark CSS vars) in src/config/appThemes.ts
- [X] T014 [P] [US1] Define Amber palette (light/dark CSS vars) in src/config/appThemes.ts
- [X] T015 [P] [US1] Define Blue palette (light/dark CSS vars) in src/config/appThemes.ts
- [X] T016 [P] [US1] Define Emerald palette (light/dark CSS vars) in src/config/appThemes.ts
- [X] T017 [P] [US1] Define Fuchsia palette (light/dark CSS vars) in src/config/appThemes.ts
- [X] T018 [US1] Create AppPaletteSelector component in src/components/settings/AppPaletteSelector.tsx
- [X] T019 [US1] Add color swatch preview to AppPaletteSelector in src/components/settings/AppPaletteSelector.tsx
- [X] T020 [US1] Integrate AppPaletteSelector into ThemeSettings in src/components/settings/ThemeSettings.tsx
- [X] T021 [US1] Wire setAppPalette action to apply palette immediately in src/stores/settingsStore.ts
- [X] T022 [US1] Handle light/dark mode toggle with palette preservation in src/stores/settingsStore.ts

**Checkpoint**: User Story 1 complete - App theme selection working independently

---

## Phase 4: User Story 2 - Customize Terminal Theme Independently (Priority: P1)

**Goal**: Users can select from 15 terminal themes with "Auto" mode that adapts to app theme

**Independent Test**: Open Settings → Terminal Theme → Select "Dracula" → Verify terminal uses Dracula colors regardless of app theme

### Implementation for User Story 2

- [X] T023 [US2] Add Catppuccin Mocha terminal theme in src/config/terminalThemes.ts
- [X] T024 [P] [US2] Add Catppuccin Latte terminal theme in src/config/terminalThemes.ts
- [X] T025 [P] [US2] Add Nord terminal theme in src/config/terminalThemes.ts
- [X] T026 [P] [US2] Add Gruvbox Dark terminal theme in src/config/terminalThemes.ts
- [X] T027 [P] [US2] Add Gruvbox Light terminal theme in src/config/terminalThemes.ts
- [X] T028 [P] [US2] Add Solarized Dark terminal theme in src/config/terminalThemes.ts
- [X] T029 [P] [US2] Add Solarized Light terminal theme in src/config/terminalThemes.ts
- [X] T030 [P] [US2] Add One Dark terminal theme in src/config/terminalThemes.ts
- [X] T031 [P] [US2] Add Tokyo Night terminal theme in src/config/terminalThemes.ts
- [X] T032 [US2] Update TerminalThemeId type with new theme IDs in src/config/terminalThemes.ts
- [X] T033 [US2] Create autoThemeMap for palette→terminal mapping in src/config/terminalThemes.ts
- [X] T034 [US2] Create useTerminalTheme hook with Auto resolution in src/hooks/useTheme.ts
- [X] T035 [US2] Create TerminalThemeSelector component in src/components/settings/TerminalThemeSelector.tsx
- [X] T036 [US2] Add "Auto" option to TerminalThemeSelector in src/components/settings/TerminalThemeSelector.tsx
- [X] T037 [US2] Integrate TerminalThemeSelector into ThemeSettings in src/components/settings/ThemeSettings.tsx
- [X] T038 [US2] Update terminal initialization to use useTerminalTheme in src/hooks/useTerminal.ts
- [X] T039 [US2] Re-apply theme when terminal settings change in src/hooks/useTerminal.ts

**Checkpoint**: User Story 2 complete - Terminal theme selection working independently

---

## Phase 5: User Story 3 - Customize Code/Editor Theme Independently (Priority: P2)

**Goal**: Users can select from 12 Shiki themes for syntax highlighting in markdown editor

**Independent Test**: Open Settings → Editor Theme → Select "Dracula" → Open markdown file → Verify syntax uses Dracula colors

### Implementation for User Story 3

- [X] T040 [US3] Define editorThemes array with 12 Shiki themes in src/config/editorThemes.ts
- [X] T041 [US3] Create useEditorTheme hook in src/hooks/useTheme.ts
- [X] T042 [US3] Create EditorThemeSelector component in src/components/settings/EditorThemeSelector.tsx
- [X] T043 [US3] Integrate EditorThemeSelector into ThemeSettings in src/components/settings/ThemeSettings.tsx
- [X] T044 [US3] Update code editor to use dynamic Shiki theme (if applicable) in src/components/shared/DescriptionRichEditor.tsx

**Checkpoint**: User Story 3 complete - Editor theme selection working independently

---

## Phase 6: User Story 4 - Customize Rendered Markdown Theme (Priority: P2)

**Goal**: Users can select Shiki theme for code blocks in rendered markdown

**Independent Test**: Open Settings → Markdown Theme → Select "Tokyo Night" → View rendered markdown → Verify code blocks use Tokyo Night

### Implementation for User Story 4

- [X] T045 [US4] Create useMarkdownTheme hook in src/hooks/useTheme.ts
- [X] T046 [US4] Create MarkdownThemeSelector component in src/components/settings/MarkdownThemeSelector.tsx
- [X] T047 [US4] Integrate MarkdownThemeSelector into ThemeSettings in src/components/settings/ThemeSettings.tsx
- [X] T048 [US4] Update MarkdownRenderer to use dynamic theme from useMarkdownTheme in src/components/shared/MarkdownRenderer.tsx
- [X] T049 [US4] Handle highlighter reload when theme changes in src/components/shared/MarkdownRenderer.tsx
- [X] T050 [US4] Add loading state for theme changes in src/components/shared/MarkdownRenderer.tsx

**Checkpoint**: User Story 4 complete - Markdown theme selection working independently

---

## Phase 7: User Story 5 - Theme Preset Profiles (Priority: P3)

**Goal**: Users can apply unified presets that configure all 4 theme contexts at once

**Independent Test**: Open Settings → Presets → Select "Full Nord" → Verify all 4 selectors update to Nord variants

### Implementation for User Story 5

- [X] T051 [US5] Define 4 preset bundles in src/config/themePresets.ts
- [X] T052 [US5] Add applyThemePreset action to settingsStore in src/stores/settingsStore.ts
- [X] T053 [US5] Create ThemePresetSelector component in src/components/settings/ThemePresetSelector.tsx
- [X] T054 [US5] Integrate ThemePresetSelector at top of theme settings in src/components/settings/ThemeSettings.tsx

**Checkpoint**: User Story 5 complete - Preset application working

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements affecting multiple user stories

- [X] T055 [P] Add fallback handling for missing/invalid theme preferences in src/stores/settingsStore.ts
- [X] T056 [P] Add edge case handling for system theme changes in src/hooks/useTheme.ts
- [X] T057 Verify theme persistence across app restart
- [X] T058 [P] Update ThemeSettings section headers and organization in src/components/settings/ThemeSettings.tsx
- [X] T059 Run quickstart.md validation checklist

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)          → No dependencies
Phase 2 (Foundational)   → Depends on Phase 1
Phase 3 (US1: App)       → Depends on Phase 2 (BLOCKS subsequent stories for best UX)
Phase 4 (US2: Terminal)  → Depends on Phase 2 (can parallel with Phase 3)
Phase 5 (US3: Editor)    → Depends on Phase 2 (can parallel with Phase 3-4)
Phase 6 (US4: Markdown)  → Depends on Phase 2 (can parallel with Phase 3-5)
Phase 7 (US5: Presets)   → Depends on Phases 3-6 (needs all selectors to exist)
Phase 8 (Polish)         → Depends on all user stories
```

### User Story Dependencies

- **US1 (App Theme)**: No dependencies on other stories - can be delivered as MVP
- **US2 (Terminal)**: Independent of US1 - can run in parallel
- **US3 (Editor)**: Independent of US1-2 - can run in parallel
- **US4 (Markdown)**: Independent of US1-3 - can run in parallel
- **US5 (Presets)**: Depends on US1-4 selectors existing (integrates them)

### Parallel Opportunities per Phase

**Phase 1**: T002, T003 can run in parallel  
**Phase 2**: T008, T009 can run in parallel  
**Phase 3**: T011-T017 (palette definitions) can run in parallel  
**Phase 4**: T024-T031 (terminal themes) can run in parallel  
**Phase 8**: T055, T056, T058 can run in parallel

---

## Parallel Example: Phase 3 (User Story 1)

```bash
# Worker A: Define palettes
T010 Caffeine palette     → T011 Catppuccin → T012 Nord → T013 Gruvbox

# Worker B: Define palettes (parallel)
T014 Amber palette        → T015 Blue → T016 Emerald → T017 Fuchsia

# After palettes complete, sequentially:
T018 AppPaletteSelector   → T019 Color swatches → T020 Settings integration
T021 Wire setAppPalette   → T022 Mode toggle handling
```

---

## Implementation Strategy

### MVP Approach (Recommended)

1. **MVP 1**: Complete Phase 1-3 (Setup + Foundation + US1) - App theme selection works
2. **MVP 2**: Add Phase 4 (US2) - Terminal theme works
3. **MVP 3**: Add Phases 5-6 (US3-4) - Shiki themes work
4. **MVP 4**: Add Phase 7 (US5) - Presets complete the feature
5. **Polish**: Phase 8 - Edge cases and cleanup

### Incremental Delivery

Each user story delivers independent value:
- After US1: Users can customize the app appearance
- After US2: Users can customize terminal separately
- After US3-4: Full code/markdown theming
- After US5: One-click unified presets

---

## Summary

| Metric | Count |
|--------|-------|
| Total Tasks | 59 |
| Setup Phase | 3 |
| Foundational Phase | 6 |
| User Story 1 (App Theme) | 13 |
| User Story 2 (Terminal) | 17 |
| User Story 3 (Editor) | 5 |
| User Story 4 (Markdown) | 6 |
| User Story 5 (Presets) | 4 |
| Polish Phase | 5 |
| Parallel Opportunities | 25 tasks marked [P] |

**Format Validation**: ✅ All tasks follow `- [ ] [ID] [P?] [Story?] Description with file path` format
