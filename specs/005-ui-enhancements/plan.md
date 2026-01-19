# Implementation Plan: SpeckitUI Enhanced Editing and Project Management

**Branch**: `005-ui-enhancements` | **Date**: 2026-01-19 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/005-ui-enhancements/spec.md`

## Summary

Enhance SpeckitUI with editable markdown views across all workflow steps, add a Constitution navbar item with direct editing, implement a rich composer for the Describe view with AI agent context integration, enable new spec/project creation from the UI, and add real-time file watching with uncommitted changes tracking.

## Technical Context

**Language/Version**: TypeScript 5.9 (frontend), Rust 1.77 (backend)
**Primary Dependencies**: React 19, Tauri 2.9, shadcn/ui (Radix), Zustand, xterm.js, react-markdown, shiki
**Storage**: Local file system (no database)
**Testing**: Vitest (unit), Playwright (E2E), cargo test (Rust)
**Target Platform**: Windows, macOS, Linux (Tauri desktop)
**Project Type**: Desktop application with Tauri (Rust backend + React frontend)
**Performance Goals**: Navigation <1s, file updates <1s, markdown render <500ms (per Constitution)
**Constraints**: Single user, single project, offline-capable, read-heavy optimization
**Scale/Scope**: Single user, ~50 specs max, ~20 files watched per spec

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Simplicity First | ✅ PASS | Extending existing patterns, no new abstractions |
| II. Local-First | ✅ PASS | All operations on local files, no cloud dependencies |
| III. Tauri Standard Patterns | ✅ PASS | Using existing command patterns, IPC for file ops |
| IV. Test-First Development | ⚠️ REQUIRES | Must write tests before implementing Rust commands |
| V. Spec-Kit Compatibility | ✅ PASS | Respects .specify/ and specs/ structure |
| VI. shadcn/ui Components | ✅ PASS | Will use shadcn/ui Dialog, Textarea, Select, etc. |
| VII. Performance Budgets | ✅ PASS | File watching is async, no blocking operations |

**Quality Gates**:
- Pre-Implementation: ✅ spec.md exists, plan.md (this file), tasks.md to be created
- Test Gate: Must add tests for new Rust commands (file write, shell exec)
- Contract Gate: IPC API contracts documented in contracts/

## Project Structure

### Documentation (this feature)

```text
specs/005-ui-enhancements/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (IPC API docs)
│   └── ipc-api.md
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── layout/
│   │   ├── NavPane.tsx          # MODIFY: Add Constitution nav item
│   │   └── ProjectHeader.tsx    # MODIFY: Add New Project option
│   ├── settings/
│   │   └── ConstitutionView.tsx # MODIFY: Make editable
│   ├── workflow/
│   │   ├── DescribeView.tsx     # MODIFY: Add rich composer
│   │   ├── SpecView.tsx         # MODIFY: Add edit mode
│   │   ├── PlanView.tsx         # MODIFY: Add edit mode
│   │   ├── TasksView.tsx        # MODIFY: Add edit mode
│   │   └── ResearchView.tsx     # MODIFY: Add edit mode
│   ├── shared/
│   │   ├── MarkdownEditor.tsx   # NEW: Reusable markdown editor
│   │   ├── RichComposer.tsx     # NEW: Rich content composer
│   │   └── AgentSelector.tsx    # NEW: Agent selection dialog
│   └── ui/                      # shadcn/ui components (existing)
├── hooks/
│   ├── useFileWatcher.ts        # MODIFY: Extend for artifact watching
│   ├── useGitStatus.ts          # NEW: Track uncommitted changes
│   └── useMarkdownEditor.ts     # NEW: Editor state management
├── services/
│   └── tauriCommands.ts         # MODIFY: Add write/exec commands
├── stores/
│   ├── editorStore.ts           # NEW: Unsaved changes tracking
│   └── artifactStore.ts         # NEW: Artifact file states
└── types/
    └── index.ts                 # MODIFY: Add new types

src-tauri/src/
├── commands/
│   ├── mod.rs                   # MODIFY: Register new commands
│   ├── file_write.rs            # NEW: File write commands
│   └── shell_exec.rs            # NEW: Shell script execution
├── services/
│   ├── file_watcher.rs          # MODIFY: Watch artifact files
│   └── git_status.rs            # NEW: Git status checking
└── lib.rs                       # MODIFY: Register commands
```

**Structure Decision**: Extending existing Tauri desktop app structure. Frontend components in src/components/, Rust commands in src-tauri/src/commands/, following established patterns.

## Complexity Tracking

No constitution violations identified. All features use existing patterns and technologies.

## Phase Summary

| Phase | Deliverables | Status |
|-------|--------------|--------|
| Phase 0: Research | [research.md](research.md) | ✅ Complete |
| Phase 1: Design | [data-model.md](data-model.md), [contracts/](contracts/), [quickstart.md](quickstart.md) | ✅ Complete |
| Phase 2: Tasks | [tasks.md](tasks.md) | 🔜 Next: Run `/speckit.tasks` |

## Next Steps

1. Run `/speckit.tasks` to generate implementation tasks
2. Implement Rust backend commands first (Test-First per Constitution)
3. Add frontend stores and hooks
4. Build UI components using shadcn/ui
5. Wire up file watching and git status
6. E2E test all user stories
