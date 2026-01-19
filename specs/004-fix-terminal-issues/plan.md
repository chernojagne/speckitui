# Implementation Plan: Fix Terminal Issues

**Branch**: `004-fix-terminal-issues` | **Date**: January 18, 2026 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/004-fix-terminal-issues/spec.md`

## Summary

Fix critical terminal functionality issues including broken resize dragging, session state loss on tab switch/panel resize, jittery redraws, incorrect Windows default shell (should be CMD not PowerShell), missing tab rename feature, and add git branch status bar. Remove collapse functionality in favor of resize-only panel with minimum height.

## Technical Context

**Language/Version**: TypeScript 5.9 (frontend), Rust 1.77.2 (backend)  
**Primary Dependencies**: React 19, Tauri 2.9.5, xterm.js 5.5, @xterm/addon-fit, portable-pty 0.8, zustand  
**Storage**: Local file system (file watching for git HEAD)  
**Testing**: vitest (unit), playwright (e2e), cargo test (Rust)  
**Target Platform**: Windows, macOS, Linux desktop (Tauri)
**Project Type**: Tauri desktop app (Rust backend + React frontend)  
**Performance Goals**: <100ms resize propagation, <2s branch status update, <1s session cleanup  
**Constraints**: Must maintain React StrictMode compatibility, no orphaned PTY processes  
**Scale/Scope**: Single-user desktop app, typically 1-5 terminal sessions

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| I. Simplicity First | ✅ PASS | Fixes existing broken functionality; new features (tab rename, status bar) are minimal additions |
| II. Local-First Architecture | ✅ PASS | Git branch detection uses local .git/HEAD file watching, no remote calls |
| III. Tauri Standard Patterns | ✅ PASS | Uses existing IPC patterns; backend handles PTY, frontend handles UI |
| IV. Test-First Development | ✅ PASS | Tests required for PTY cleanup, resize events, shell detection |
| V. Spec-Kit Compatibility | ✅ PASS | No impact on spec-kit file structure |
| VI. shadcn/ui Component Library | ✅ PASS | Status bar and tab rename will use shadcn/ui components |
| VII. Performance Budgets | ✅ PASS | Terminal spawn <2s, resize <100ms (within budget) |

## Project Structure

### Documentation (this feature)

```text
specs/004-fix-terminal-issues/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
# Frontend (React/TypeScript)
src/
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx          # Add StatusBar, remove terminal collapse
│   │   ├── TerminalPanel.tsx     # Fix resize, remove collapse
│   │   └── StatusBar.tsx         # NEW: Git branch display
│   └── terminal/
│       ├── TerminalInstance.tsx  # Fix state preservation, StrictMode
│       └── TerminalTabs.tsx      # Add tab renaming
├── hooks/
│   ├── useTerminal.ts            # Fix shell detection, default shell
│   └── useGitBranch.ts           # NEW: Git branch watching
└── stores/
    └── terminalStore.ts          # Add tab label persistence

# Backend (Rust)
src-tauri/src/
├── commands/
│   ├── terminal.rs               # Add shell detection, fix cleanup
│   └── git.rs                    # NEW: Git branch commands
└── services/
    └── terminal_manager.rs       # Fix PTY lifecycle, cleanup
```

**Structure Decision**: Uses existing Tauri project structure. New components (StatusBar, useGitBranch) follow established patterns. No new directories needed.

## Complexity Tracking

> No constitution violations requiring justification.
