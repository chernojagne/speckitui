# Implementation Plan: SpeckitUI Core Application

**Branch**: `001-speckitui-core` | **Date**: January 16, 2026 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-speckitui-core/spec.md`

## Summary

SpeckitUI is a Tauri-based desktop application that provides a unified UI for the spec-kit spec-driven development workflow. The application features a navigation pane with 8 workflow steps (Specify, Plan, Tasks, Implement, Test, Push, PR, Bug Fix), a tabbed detail pane for viewing markdown artifacts and source code, an integrated terminal panel, and GitHub integration for PR feedback and issue tracking.

## Technical Context

**Language/Version**: Rust 1.75+ (Tauri backend), TypeScript 5.x (frontend)  
**Primary Dependencies**: Tauri 2.x, React 18.x, xterm.js (terminal), @octokit/rest (GitHub API)  
**Storage**: Local file system (spec artifacts), localStorage (app preferences/session state)  
**Testing**: Vitest (frontend unit), Playwright (E2E), cargo test (Rust backend)  
**Target Platform**: Windows, macOS, Linux desktop (Tauri cross-platform)
**Project Type**: Desktop application with web frontend (Tauri architecture)  
**Performance Goals**: <1s navigation between steps, <3s project load, <2s terminal spawn  
**Constraints**: Offline-capable for local features, <200MB installed size, single-user local  
**Scale/Scope**: Single project at a time, ~10 spec instances typical, 8 workflow steps

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

> Note: Project constitution is using template placeholders. Gates below are based on common spec-kit principles.

### Simplicity Gate
- [x] Minimal project count? → YES: 1 Tauri project with frontend/backend in standard structure
- [x] No premature abstraction? → YES: Direct file system access, no ORM, no complex patterns
- [x] YAGNI applied? → YES: Only 8 workflow steps, single project at a time, local-first

### Test-First Gate  
- [ ] Test strategy defined? → Vitest for frontend, Playwright for E2E, cargo test for Rust
- [ ] Contract tests planned? → GitHub API mocking, file system assertions

### Integration Gate
- [x] External integrations identified? → GitHub API (Octokit), local file system, system shell
- [x] Contracts for integrations? → GitHub REST API (well-documented), PTY for terminal

**Gate Status**: ✅ PASS - Proceeding to Phase 0 research

## Project Structure

### Documentation (this feature)

```text
specs/001-speckitui-core/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── ipc-api.md       # Tauri command contracts
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src-tauri/                    # Rust backend (Tauri)
├── src/
│   ├── main.rs               # Tauri entry point
│   ├── commands/             # IPC command handlers
│   │   ├── mod.rs
│   │   ├── project.rs        # Project/spec instance operations
│   │   ├── artifacts.rs      # File reading/writing
│   │   ├── terminal.rs       # PTY management
│   │   └── github.rs         # GitHub API proxy
│   ├── models/               # Rust data structures
│   │   ├── mod.rs
│   │   ├── project.rs
│   │   ├── spec_instance.rs
│   │   └── artifact.rs
│   └── services/             # Business logic
│       ├── mod.rs
│       ├── file_watcher.rs
│       ├── markdown_parser.rs
│       └── github_client.rs
├── Cargo.toml
└── tauri.conf.json

src/                          # React frontend
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx      # Main layout container
│   │   ├── NavPane.tsx       # Workflow step navigation
│   │   ├── DetailPane.tsx    # Content display area
│   │   └── TerminalPanel.tsx # Bottom terminal area
│   ├── workflow/
│   │   ├── SpecifyView.tsx
│   │   ├── PlanView.tsx
│   │   ├── TasksView.tsx
│   │   ├── ImplementView.tsx
│   │   ├── TestView.tsx
│   │   ├── PushView.tsx
│   │   ├── PRView.tsx
│   │   └── BugFixView.tsx
│   ├── shared/
│   │   ├── MarkdownRenderer.tsx
│   │   ├── ChecklistItem.tsx
│   │   ├── TabContainer.tsx
│   │   ├── FileTree.tsx
│   │   └── SourceViewer.tsx
│   └── settings/
│       └── ConstitutionView.tsx
├── hooks/
│   ├── useProject.ts
│   ├── useSpecInstance.ts
│   ├── useArtifacts.ts
│   ├── useTerminal.ts
│   └── useGitHub.ts
├── stores/
│   ├── projectStore.ts
│   ├── workflowStore.ts
│   └── settingsStore.ts
├── services/
│   ├── tauriCommands.ts      # Tauri IPC wrapper
│   ├── markdownParser.ts
│   └── checklistParser.ts
├── types/
│   └── index.ts
├── App.tsx
└── main.tsx

tests/
├── unit/                     # Vitest unit tests
│   ├── components/
│   └── services/
├── integration/              # Component integration
└── e2e/                      # Playwright E2E
    ├── navigation.spec.ts
    ├── artifacts.spec.ts
    └── terminal.spec.ts
```

**Structure Decision**: Tauri 2.x standard structure with `src-tauri/` for Rust backend and `src/` for React frontend. Tests organized by type (unit/integration/e2e) in `tests/` directory.

## Complexity Tracking

> No Constitution violations identified. Design follows simplicity principles:
> - Single Tauri project (frontend + backend unified)
> - Direct file system access via Tauri APIs (no abstraction layer)
> - Standard React patterns (hooks + stores, no complex state machines)
> - GitHub API via official Octokit client (no custom wrapper)
