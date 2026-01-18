# Implementation Plan: Navigation Pane Redesign

**Branch**: `002-nav-pane-redesign` | **Date**: 2026-01-17 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-nav-pane-redesign/spec.md`

## Summary

Redesign the navigation pane to be a full-height, resizable/collapsible sidebar with:
- **Project header**: Uppercase project name with folder picker icon
- **Spec selector**: Dropdown (without "Spec:" label) with adjacent new spec button
- **Describe step**: New workflow step above Specify with text editor and "Send to Terminal" button
- **Avatar menu**: Bottom-anchored popup with GitHub login and Settings access
- **Resizable/collapsible**: Drag to resize (180-400px), chevron button to collapse to icon rail

Technical approach uses existing patterns: drag resize from TerminalPanel, shadcn/ui DropdownMenu for avatar, native HTML select for spec dropdown, and new Zustand store state for pane width/collapsed state.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19, Rust 1.75+ (Tauri backend)  
**Primary Dependencies**: Tauri 2.x, shadcn/ui, Zustand, Tailwind CSS v4, Lucide icons  
**Storage**: Local file system (description.md per spec), Zustand persist middleware  
**Testing**: Vitest (unit), Playwright (E2E), cargo test (Rust commands)  
**Target Platform**: Desktop (Windows/macOS/Linux via Tauri)  
**Project Type**: Single desktop application with Rust backend + React frontend  
**Performance Goals**: <1s navigation between steps, <100ms resize/collapse interaction  
**Constraints**: Must use shadcn/ui components, local-first (no cloud dependencies)  
**Scale/Scope**: Single user, single project at a time, ~15 layout/nav components

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Simplicity First | ✅ PASS | Reuses existing patterns (TerminalPanel resize, shadcn/ui components). No new abstractions beyond necessary state. |
| II. Local-First | ✅ PASS | All data stored locally (description.md files). GitHub login optional with graceful degradation. |
| III. Tauri Standard Patterns | ✅ PASS | New Tauri commands for save/load description.md follow existing IPC patterns. |
| IV. Test-First | ⚠️ GATE | Tests must be written before implementation. E2E for user stories, unit for new commands. |
| V. Spec-Kit Compatibility | ✅ PASS | description.md stored in spec directory respects spec-kit structure. |
| VI. shadcn/ui Components | ✅ PASS | Uses Button, DropdownMenu, ScrollArea, Tooltip. Custom DescribeEditor follows shadcn patterns. |
| VII. Performance Budgets | ✅ PASS | <1s navigation (spec switch), <100ms resize/collapse meets interactive budget. |

**Quality Gates Check:**
- Pre-Implementation Gate: ✅ spec.md exists, plan.md (this file) complete, tasks.md complete
- Test Gate: ✅ Unit tests for Rust commands (T007a, T007b) + E2E tests (T044-T050) added to tasks.md
- Contract Gate: ✅ IPC contracts for description save/load defined in contracts/description.md

## Project Structure

### Documentation (this feature)

```text
specs/002-nav-pane-redesign/
├── spec.md              # Feature specification (complete)
├── plan.md              # This file
├── research.md          # Phase 0 output - patterns research
├── data-model.md        # Phase 1 output - store state changes
├── quickstart.md        # Phase 1 output - implementation guide
├── contracts/           # Phase 1 output - Tauri IPC contracts
│   └── description.md   # save/load description commands
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── layout/
│   │   ├── NavPane.tsx           # MODIFY: Full redesign - resizable, collapsible
│   │   ├── AppShell.tsx          # MODIFY: Wrap in ResizablePanelGroup, remove settings button
│   │   ├── SpecSelector.tsx      # MODIFY: Remove label, add new spec button
│   │   ├── ProjectHeader.tsx     # NEW: Project name + folder picker
│   │   └── AvatarMenu.tsx        # NEW: Bottom avatar with dropdown
│   ├── workflow/
│   │   ├── DescribeStep.tsx      # NEW: Text editor for feature description
│   │   └── DescribeEditor.tsx    # NEW: Editor with Send to Terminal button
│   └── ui/
│       ├── resizable.tsx         # NEW: shadcn/ui Resizable component
│       └── (existing shadcn components)
├── config/
│   └── workflowSteps.ts          # MODIFY: Add 'describe' step
├── stores/
│   ├── settingsStore.ts          # MODIFY: Add navPaneWidth, navPaneCollapsed
│   └── descriptionStore.ts       # NEW: Current description text state
├── types/
│   └── index.ts                  # MODIFY: Add WorkflowStepId 'describe'
├── services/
│   └── tauriCommands.ts          # MODIFY: Add saveDescription, loadDescription
└── hooks/
    └── useDescription.ts         # NEW: Hook for description load/save

src-tauri/src/
├── commands/
│   └── description.rs            # NEW: save/load description.md commands
└── lib.rs                        # MODIFY: Register new commands

tests/
├── e2e/
│   ├── nav-pane-resize.spec.ts   # NEW: Resize/collapse E2E tests
│   ├── describe-step.spec.ts     # NEW: Describe workflow E2E tests
│   └── avatar-menu.spec.ts       # NEW: Settings access E2E tests
└── unit/
    └── stores/
        └── descriptionStore.test.ts # NEW: Store unit tests
```

**Structure Decision**: Single project structure (Option 1). All changes within existing src/ layout. New components organized under existing layout/ and new workflow/ directories.

## Complexity Tracking

> No constitution violations requiring justification. All changes use existing patterns and shadcn/ui components.
