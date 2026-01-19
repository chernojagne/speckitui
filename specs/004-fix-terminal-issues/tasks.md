# Tasks: Fix Terminal Issues

**Input**: Design documents from `/specs/004-fix-terminal-issues/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/ipc-api.md

**Tests**: Not explicitly requested - omitting test tasks per template guidelines.

**Organization**: Tasks grouped by user story priority (P1 → P2 → P3) for independent implementation.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: No new setup required - using existing project structure

- [x] T001 Verify feature branch 004-fix-terminal-issues is checked out
- [x] T002 [P] Run `npm install` and `cargo build` to ensure dependencies are current

---

## Phase 2: Foundational (Store Updates)

**Purpose**: Core state management changes that affect multiple user stories

**⚠️ CRITICAL**: These changes must be complete before user story implementation

- [x] T003 Remove `isCollapsed` field and `toggleCollapsed`/`setCollapsed` actions from src/stores/terminalStore.ts
- [x] T004 Update `setPanelHeight` in src/stores/terminalStore.ts to remove maximum height constraint (currently capped at 600)
- [x] T005 Add `renameSession` action to src/stores/terminalStore.ts for updating session labels
- [x] T006 Update TerminalSession type in src/types/index.ts to ensure `label` field is properly typed

**Checkpoint**: Store is ready for user story implementation

---

## Phase 3: User Story 3 - Terminal Resize Handling (Priority: P1) 🎯 MVP

**Goal**: Fix broken panel resize - dragging divider should change panel height smoothly

**Independent Test**: Open terminal → drag top divider → panel resizes smoothly

### Implementation for User Story 3

- [x] T007 [US3] Remove `h-full` class from terminal panel container in src/components/layout/TerminalPanel.tsx
- [x] T008 [US3] Bind panel height to inline style using panelHeight from store in src/components/layout/TerminalPanel.tsx
- [x] T009 [US3] Add resize handle div at top of TerminalPanel with proper cursor styling in src/components/layout/TerminalPanel.tsx
- [x] T010 [US3] Fix handleDragStart/handleDragMove to properly update panelHeight during drag in src/components/layout/TerminalPanel.tsx
- [x] T011 [US3] Remove collapse toggle button from TerminalPanel header in src/components/layout/TerminalPanel.tsx
- [x] T012 [US3] Update minimized view to show resize handle instead of collapse button in src/components/layout/TerminalPanel.tsx
- [x] T013 [US3] Update AppShell.tsx to use dynamic height for terminal panel container in src/components/layout/AppShell.tsx
- [x] T014 [US3] Add debounced resize propagation to PTY - call resizeTerminal IPC after resize settles in src/components/terminal/TerminalInstance.tsx

**Checkpoint**: Panel resize works - dragging divider changes height (SC-001, SC-005)

---

## Phase 4: User Story 4 - Terminal State Preservation (Priority: P1)

**Goal**: Terminal content preserved on tab switch, no jitter, arrow keys work correctly

**Independent Test**: Run commands → switch tabs → switch back → content preserved without jitter

### Implementation for User Story 4

- [x] T015 [US4] Change TerminalInstance rendering from conditional to CSS display:none for inactive tabs in src/components/layout/TerminalPanel.tsx
- [x] T016 [US4] Ensure all TerminalInstance components stay mounted regardless of active state in src/components/layout/TerminalPanel.tsx
- [x] T017 [US4] Add dimension tracking ref to only call fitAddon.fit() when container size actually changes in src/components/terminal/TerminalInstance.tsx
- [x] T018 [US4] Debounce fitAddon.fit() calls with 50ms delay in src/components/terminal/TerminalInstance.tsx
- [x] T019 [US4] Remove unnecessary re-renders on tab activation by memoizing callbacks in src/components/terminal/TerminalInstance.tsx
- [x] T020 [US4] Preserve scrollback position when tab becomes active in src/components/terminal/TerminalInstance.tsx

**Checkpoint**: Zero content loss on tab switch, no jitter (SC-002, SC-003)

---

## Phase 5: User Story 1 - Terminal Session Reliability (Priority: P1)

**Goal**: Clean PTY lifecycle - no orphaned processes, proper cleanup on close

**Independent Test**: Open terminal → run command → close tab → verify no orphaned process

### Implementation for User Story 1

- [x] T021 [P] [US1] Add explicit child process kill with wait in close_session in src-tauri/src/services/terminal_manager.rs
- [x] T022 [P] [US1] Add Drop trait implementation for TerminalSession to ensure cleanup in src-tauri/src/services/terminal_manager.rs
- [x] T023 [US1] Implement app exit hook to close all terminal sessions in src-tauri/src/main.rs
- [x] T024 [US1] Emit terminal-exit event when PTY process terminates unexpectedly in src-tauri/src/services/terminal_manager.rs
- [x] T025 [US1] Handle terminal-exit event in frontend to update session status in src/components/terminal/TerminalInstance.tsx
- [x] T026 [US1] Add session cleanup verification logging in src-tauri/src/commands/terminal.rs

**Checkpoint**: Zero orphaned PTY processes after closing sessions (SC-004, SC-008)

---

## Phase 6: User Story 5 - Terminal Panel Behavior (Priority: P2)

**Goal**: Panel should not collapse, only resize with minimum height

**Independent Test**: Resize to minimum → verify panel stops at ~100px, does not collapse

### Implementation for User Story 5

- [x] T027 [US5] Enforce minimum panel height of 100px in resize handler in src/components/layout/TerminalPanel.tsx
- [x] T028 [US5] Remove all collapse-related UI elements (chevron icons, toggle buttons) in src/components/layout/TerminalPanel.tsx
- [x] T029 [US5] Set default panelHeight to 200px on application start in src/stores/terminalStore.ts
- [x] T030 [US5] Update AppShell layout to always show terminal panel (remove collapsed state handling) in src/components/layout/AppShell.tsx

**Checkpoint**: Panel resize-only, no collapse functionality

---

## Phase 7: User Story 6 - Terminal Tab Renaming (Priority: P2)

**Goal**: Double-click tab to rename, Enter saves, Escape cancels

**Independent Test**: Double-click tab → type new name → Enter → tab shows new name

### Implementation for User Story 6

- [x] T031 [US6] Add isEditing state to TerminalTabs component in src/components/terminal/TerminalTabs.tsx
- [x] T032 [US6] Add double-click handler on tab label to enter edit mode in src/components/terminal/TerminalTabs.tsx
- [x] T033 [US6] Add inline Input component (shadcn/ui) for tab name editing in src/components/terminal/TerminalTabs.tsx
- [x] T034 [US6] Handle Enter key to save, Escape to cancel, blur to save in src/components/terminal/TerminalTabs.tsx
- [x] T035 [US6] Call renameSession store action on save in src/components/terminal/TerminalTabs.tsx
- [x] T036 [US6] Validate empty names revert to default "Terminal N" in src/components/terminal/TerminalTabs.tsx

**Checkpoint**: Tab renaming works with double-click UX

---

## Phase 8: User Story 7 - Git Branch Status Bar (Priority: P2)

**Goal**: Status bar at bottom showing current git branch, updates on change

**Independent Test**: Open project → see branch in status bar → git checkout → status bar updates

### Implementation for User Story 7

- [x] T037 [P] [US7] Create get_git_branch Rust command in src-tauri/src/commands/git.rs
- [x] T038 [P] [US7] Add git.rs module to commands/mod.rs and register command in main.rs
- [x] T039 [US7] Implement git branch parsing (ref: refs/heads/name or detached HEAD) in src-tauri/src/commands/git.rs
- [x] T040 [P] [US7] Create useGitBranch hook in src/hooks/useGitBranch.ts
- [x] T041 [US7] Add file watcher for .git/HEAD in useGitBranch hook in src/hooks/useGitBranch.ts
- [x] T042 [P] [US7] Create StatusBar component in src/components/layout/StatusBar.tsx
- [x] T043 [US7] Add git branch icon and branch name display to StatusBar in src/components/layout/StatusBar.tsx
- [x] T044 [US7] Handle detached HEAD state display in StatusBar in src/components/layout/StatusBar.tsx
- [x] T045 [US7] Hide branch indicator when not a git repo in StatusBar in src/components/layout/StatusBar.tsx
- [x] T046 [US7] Add StatusBar to AppShell layout at bottom of window in src/components/layout/AppShell.tsx
- [x] T047 [US7] Export StatusBar and useGitBranch from their index files in src/components/layout/index.ts and src/hooks/index.ts

**Checkpoint**: Status bar shows branch, updates within 2 seconds of checkout (SC-009)

---

## Phase 9: User Story 8 - Windows Default Shell (Priority: P3)

**Goal**: Windows defaults to CMD, not PowerShell

**Independent Test**: On Windows → create terminal → verify CMD (echo %COMSPEC%)

### Implementation for User Story 8

- [x] T048 [US8] Change default shell on Windows from powershell.exe to cmd.exe in src-tauri/src/commands/terminal.rs
- [x] T049 [US8] Update getShellPath in useTerminal hook to use cmd as Windows default in src/hooks/useTerminal.ts
- [x] T050 [US8] Update shell type options: add 'cmd' type, keep 'powershell' as option in src/hooks/useTerminal.ts
- [x] T051 [US8] Update dropdown menu to show "Command Prompt" as first option on Windows in src/components/terminal/TerminalTabs.tsx

**Checkpoint**: Windows default terminal opens CMD (SC-010)

---

## Phase 10: User Story 9 - Cross-Platform Shell Detection (Priority: P3)

**Goal**: Detect available shells, search multiple paths for Git Bash

**Independent Test**: Select Bash without Git Bash installed → fallback to CMD with notification

### Implementation for User Story 9

> **DEFERRED**: Shell detection is a future enhancement. Basic functionality implemented with static paths.

- [ ] T052 [P] [US9] Create detect_available_shells Rust command in src-tauri/src/commands/terminal.rs
- [ ] T053 [US9] Implement Git Bash path search (Program Files, x86, LOCALAPPDATA, Scoop) in src-tauri/src/commands/terminal.rs
- [ ] T054 [US9] Add shell fallback logic with shellFallback field in response in src-tauri/src/commands/terminal.rs
- [ ] T055 [US9] Handle shell fallback notification in frontend (toast/alert) in src/hooks/useTerminal.ts
- [ ] T056 [US9] Update shell dropdown to show only available shells in src/components/terminal/TerminalTabs.tsx

**Checkpoint**: Shell detection finds Git Bash 95% of standard installs (SC-006)

---

## Phase 11: User Story 10 - React StrictMode Compatibility (Priority: P3)

**Goal**: No duplicate terminals in dev mode, proper StrictMode handling

**Independent Test**: Dev mode → create terminal → close → no duplicate instances

### Implementation for User Story 10

- [x] T057 [US10] Verify global terminalInstances Map prevents duplicates in src/components/terminal/TerminalInstance.tsx
- [x] T058 [US10] Refine mountedRef pattern with 100ms cleanup delay for StrictMode in src/components/terminal/TerminalInstance.tsx
- [x] T059 [US10] Add terminal instance count logging for development debugging in src/components/terminal/TerminalInstance.tsx
- [x] T060 [US10] Test and fix any edge cases with rapid mount/unmount cycles in src/components/terminal/TerminalInstance.tsx

**Checkpoint**: Zero duplicate terminals in StrictMode (SC-007)

---

## Phase 12: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup and validation

- [x] T061 [P] Update src/components/layout/TerminalPanel.css for new resize handle styling
- [x] T062 [P] Update src/components/terminal/TerminalTabs.css for inline edit styling
- [x] T063 [P] Create src/components/layout/StatusBar.css for status bar styling
- [x] T064 Run quickstart.md validation tests
- [x] T065 Run `npm run build` and `cargo build --release` to verify no build errors
- [ ] T066 Manual testing of all 10 success criteria (SC-001 through SC-010)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies
- **Phase 2 (Foundational)**: Depends on Phase 1 - BLOCKS all user stories
- **Phases 3-5 (P1 stories)**: Depend on Phase 2, can run in priority order
- **Phases 6-8 (P2 stories)**: Depend on Phase 2, can run after P1 or in parallel
- **Phases 9-11 (P3 stories)**: Depend on Phase 2, can run after P2 or in parallel
- **Phase 12 (Polish)**: Depends on all desired stories complete

### User Story Dependencies

| Story | Priority | Dependencies | Can Run In Parallel With |
|-------|----------|--------------|--------------------------|
| US3 - Resize | P1 | Phase 2 | US4, US1 (after Phase 2) |
| US4 - State Preservation | P1 | Phase 2 | US3, US1 (after Phase 2) |
| US1 - Session Reliability | P1 | Phase 2 | US3, US4 (after Phase 2) |
| US5 - Panel Behavior | P2 | Phase 2, US3 recommended | US6, US7 |
| US6 - Tab Rename | P2 | Phase 2 | US5, US7 |
| US7 - Status Bar | P2 | Phase 2 | US5, US6 |
| US8 - Windows Shell | P3 | Phase 2 | US9, US10 |
| US9 - Shell Detection | P3 | US8 | US10 |
| US10 - StrictMode | P3 | Phase 2 | US8, US9 |

### Parallel Opportunities

```bash
# After Phase 2 completes, P1 stories can run in parallel:
Phase 3 (US3 - Resize)      # Different files: TerminalPanel.tsx, AppShell.tsx
Phase 4 (US4 - State)       # Different files: TerminalInstance.tsx
Phase 5 (US1 - Lifecycle)   # Different files: terminal_manager.rs, main.rs

# P2 stories can run in parallel:
Phase 6 (US5 - Panel)       # TerminalPanel.tsx (may conflict with US3)
Phase 7 (US6 - Rename)      # TerminalTabs.tsx
Phase 8 (US7 - Status Bar)  # New files: StatusBar.tsx, git.rs, useGitBranch.ts
```

---

## Implementation Strategy

### MVP First (P1 Stories Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational store changes
3. Complete Phase 3: Resize Handling (US3) - **Most visible fix**
4. Complete Phase 4: State Preservation (US4)
5. Complete Phase 5: Session Reliability (US1)
6. **STOP and VALIDATE**: Test all P1 criteria (SC-001 to SC-005)

### Incremental Delivery

1. **MVP**: Phases 1-5 → Fixes critical broken functionality
2. **Enhancement 1**: Phases 6-8 → Adds UX improvements (rename, status bar)
3. **Enhancement 2**: Phases 9-11 → Adds cross-platform robustness
4. **Final**: Phase 12 → Polish and validation

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story
- Each user story is independently completable and testable
- Priority order: P1 fixes broken functionality, P2 adds features, P3 improves robustness
- Commit after each task or logical group
- Run quickstart.md validation after completing each user story phase
