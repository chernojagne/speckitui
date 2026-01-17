# Tasks: SpeckitUI Core Application

**Input**: Design documents from `/specs/001-speckitui-core/`  
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ipc-api.md ✓

**Tests**: Not explicitly requested - implementation tasks only.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

---

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize Tauri + React project structure

- [X] T001 Initialize Tauri 2.x project with `npm create tauri-app@latest` in repository root
- [X] T002 Configure Cargo.toml with dependencies: portable-pty, tokio, serde, serde_json in src-tauri/Cargo.toml
- [X] T003 [P] Configure package.json with React 18, TypeScript, Vite dependencies in package.json
- [X] T004 [P] Configure tauri.conf.json with app name, window settings, and permissions in src-tauri/tauri.conf.json
- [X] T005 [P] Setup TypeScript configuration in tsconfig.json
- [X] T006 [P] Configure Vite build settings in vite.config.ts
- [X] T007 [P] Setup ESLint and Prettier configuration in .eslintrc.js and .prettierrc

**Checkpoint**: Tauri app skeleton runs with `npm run tauri dev`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### TypeScript Types & Interfaces

- [X] T008 Create core TypeScript types in src/types/index.ts (Project, SpecInstance, Artifact, WorkflowStep, etc.)
- [X] T009 [P] Create Tauri command response types in src/types/commands.ts

### Rust Backend Foundation

- [X] T010 Create Rust models module structure in src-tauri/src/models/mod.rs
- [X] T011 [P] Create Project model in src-tauri/src/models/project.rs
- [X] T012 [P] Create SpecInstance model in src-tauri/src/models/spec_instance.rs
- [X] T013 [P] Create Artifact model in src-tauri/src/models/artifact.rs
- [X] T014 Create commands module structure in src-tauri/src/commands/mod.rs
- [X] T015 [P] Create services module structure in src-tauri/src/services/mod.rs
- [X] T016 Register all command modules in src-tauri/src/main.rs

### Frontend Foundation

- [X] T017 Create Zustand project store skeleton in src/stores/projectStore.ts
- [X] T018 [P] Create Zustand workflow store skeleton in src/stores/workflowStore.ts
- [X] T019 [P] Create Zustand settings store skeleton in src/stores/settingsStore.ts
- [X] T020 Create Tauri IPC wrapper service in src/services/tauriCommands.ts
- [X] T021 Create main App.tsx with router/layout structure in src/App.tsx
- [X] T022 Create application entry point in src/main.tsx

**Checkpoint**: Foundation ready - `npm run tauri dev` shows blank app shell, stores initialized

---

## Phase 3: User Story 1 - Navigate Workflow Steps (Priority: P1) 🎯 MVP

**Goal**: Display navigation pane with 8 workflow steps; clicking a step highlights it and updates detail pane.

**Independent Test**: Launch app → see 8 workflow steps → click each step → step highlights and detail pane updates.

### Layout Components

- [X] T023 [US1] Create AppShell layout component in src/components/layout/AppShell.tsx
- [X] T024 [US1] Create NavPane component with 8 workflow steps in src/components/layout/NavPane.tsx
- [X] T025 [US1] Create DetailPane container component in src/components/layout/DetailPane.tsx
- [X] T026 [US1] Define WorkflowStep configuration (id, label, icon, artifactPatterns) in src/config/workflowSteps.ts

### State Management

- [X] T027 [US1] Implement selectedStep state in workflowStore in src/stores/workflowStore.ts
- [X] T028 [US1] Implement step selection action and hasContent indicators in src/stores/workflowStore.ts

### Styling

- [X] T029 [US1] Add navigation pane styles (selected state, hover, icons) in src/components/layout/NavPane.css
- [X] T030 [US1] Add app shell layout styles (sidebar + main area) in src/components/layout/AppShell.css

**Checkpoint**: App shows sidebar with 8 steps; clicking step highlights it; detail pane shows placeholder for selected step

---

## Phase 4: User Story 2 - View Spec Instance Artifacts (Priority: P1)

**Goal**: Display markdown artifacts in detail pane with proper formatting and tabbed interface for multiple files.

**Independent Test**: Open project with spec.md → select Specify step → see rendered markdown content.

### Rust Backend - File Reading

- [X] T031 [US2] Implement read_artifact command in src-tauri/src/commands/artifacts.rs
- [X] T032 [US2] Implement write_artifact command in src-tauri/src/commands/artifacts.rs
- [X] T033 [US2] Implement list_directory command in src-tauri/src/commands/artifacts.rs
- [X] T034 [US2] Implement read_source_file command in src-tauri/src/commands/artifacts.rs
- [X] T035 [US2] Register artifact commands in src-tauri/src/main.rs

### Frontend - Markdown Rendering

- [X] T036 [US2] Create MarkdownRenderer component with react-markdown + remark-gfm in src/components/shared/MarkdownRenderer.tsx
- [X] T037 [US2] Create TabContainer component for multi-artifact display in src/components/shared/TabContainer.tsx
- [X] T038 [US2] Add syntax highlighting support with Shiki in src/components/shared/MarkdownRenderer.tsx

### Workflow Step Views

- [X] T039 [US2] Create SpecifyView component (displays spec.md) in src/components/workflow/SpecifyView.tsx
- [X] T040 [P] [US2] Create PlanView component (tabbed: plan.md, research.md, data-model.md, contracts) in src/components/workflow/PlanView.tsx
- [X] T041 [P] [US2] Create TasksView component (displays tasks.md) in src/components/workflow/TasksView.tsx

### Hooks

- [X] T042 [US2] Create useArtifacts hook for loading artifact content in src/hooks/useArtifacts.ts
- [X] T043 [US2] Integrate workflow views into DetailPane based on selected step in src/components/layout/DetailPane.tsx

**Checkpoint**: Selecting Specify/Plan/Tasks step shows corresponding markdown rendered with tabs for multi-artifact steps

---

## Phase 5: User Story 3 - Manage Project and Spec Instances (Priority: P1)

**Goal**: Open project folder, scan for spec instances, display selector, switch between specs.

**Independent Test**: Open folder with multiple specs → see spec selector → switch specs → content updates.

### Rust Backend - Project Commands

- [X] T044 [US3] Implement open_project command (scan .specify/, specs/) in src-tauri/src/commands/project.rs
- [X] T045 [US3] Implement get_spec_instances command in src-tauri/src/commands/project.rs
- [X] T046 [US3] Implement get_recent_projects command in src-tauri/src/commands/project.rs
- [X] T047 [US3] Implement settings persistence (save/load) in src-tauri/src/commands/settings.rs
- [X] T048 [US3] Register project and settings commands in src-tauri/src/main.rs

### Frontend - Project Management

- [X] T049 [US3] Create project open dialog trigger in AppShell header in src/components/layout/AppShell.tsx
- [X] T050 [US3] Create SpecSelector dropdown component in src/components/layout/SpecSelector.tsx
- [X] T051 [US3] Implement project and spec instance state in projectStore in src/stores/projectStore.ts
- [X] T052 [US3] Create useProject hook for project operations in src/hooks/useProject.ts
- [X] T053 [US3] Create useSpecInstance hook for spec switching in src/hooks/useSpecInstance.ts
- [X] T054 [US3] Implement session restore (last project/spec on startup) in src/App.tsx
- [X] T055 [US3] Create empty state component for no specs in src/components/shared/EmptyState.tsx

**Checkpoint**: Can open project folder, see spec dropdown, switch specs, changes persist on restart

---

## Phase 6: User Story 4 - Track Progress with Checklists (Priority: P2)

**Goal**: Parse checkboxes from markdown, render as interactive, toggle and persist, show completion percentage.

**Independent Test**: Open tasks.md with checkboxes → click checkbox → state toggles → file updates → progress shows.

### Rust Backend - Checkbox Update

- [X] T056 [US4] Implement update_checkbox command (atomic line update) in src-tauri/src/commands/artifacts.rs
- [X] T057 [US4] Add file change detection for concurrent edit warning in src-tauri/src/services/file_watcher.rs

### Frontend - Checklist Interaction

- [X] T058 [US4] Create checklistParser service to extract checkboxes from markdown in src/services/checklistParser.ts
- [X] T059 [US4] Create ChecklistItem component (interactive checkbox) in src/components/shared/ChecklistItem.tsx
- [X] T060 [US4] Create ProgressIndicator component (X/Y complete, percentage) in src/components/shared/ProgressIndicator.tsx
- [X] T061 [US4] Integrate ChecklistItem into MarkdownRenderer (custom checkbox rendering) in src/components/shared/MarkdownRenderer.tsx
- [X] T062 [US4] Implement checkbox toggle with optimistic update and file sync in src/hooks/useArtifacts.ts
- [X] T063 [US4] Add progress indicator to TasksView header in src/components/workflow/TasksView.tsx
- [X] T064 [US4] Add progress indicator to PlanView for Phase -1 Gates in src/components/workflow/PlanView.tsx

**Checkpoint**: Checkboxes are clickable, toggle state persists to file, progress percentage displays correctly

---

## Phase 7: User Story 5 - Use Integrated Terminal (Priority: P2)

**Goal**: Bottom panel with resizable terminal area, spawn multiple PTY sessions, switch between terminals.

**Independent Test**: Expand terminal panel → click New Terminal → type command → see output → open second terminal → switch between them.

### Rust Backend - Terminal/PTY

- [X] T065 [US5] Implement create_terminal command using portable-pty in src-tauri/src/commands/terminal.rs
- [X] T066 [US5] Implement write_terminal command (send input to PTY) in src-tauri/src/commands/terminal.rs
- [X] T067 [US5] Implement resize_terminal command in src-tauri/src/commands/terminal.rs
- [X] T068 [US5] Implement close_terminal command in src-tauri/src/commands/terminal.rs
- [X] T069 [US5] Implement terminal output event emission to frontend in src-tauri/src/commands/terminal.rs
- [X] T070 [US5] Create terminal session manager service in src-tauri/src/services/terminal_manager.rs
- [X] T071 [US5] Register terminal commands in src-tauri/src/main.rs

### Frontend - Terminal UI

- [X] T072 [US5] Create TerminalPanel component (bottom panel container) in src/components/layout/TerminalPanel.tsx
- [X] T073 [US5] Create TerminalInstance component using xterm.js in src/components/terminal/TerminalInstance.tsx
- [X] T074 [US5] Create TerminalTabs component for session switching in src/components/terminal/TerminalTabs.tsx
- [X] T075 [US5] Implement resizable panel with drag handle in src/components/layout/TerminalPanel.tsx
- [X] T076 [US5] Implement collapse/expand toggle for terminal panel in src/components/layout/TerminalPanel.tsx
- [X] T077 [US5] Create Zustand terminal store for session state in src/stores/terminalStore.ts
- [X] T078 [US5] Create useTerminal hook for terminal operations in src/hooks/useTerminal.ts
- [X] T079 [US5] Integrate TerminalPanel into AppShell layout in src/components/layout/AppShell.tsx
- [X] T080 [US5] Persist terminal panel height and collapsed state in settings in src/stores/settingsStore.ts

**Checkpoint**: Terminal panel at bottom, can open/close terminals, run commands, switch tabs, resize panel

---

## Phase 8: User Story 6 - Review GitHub PR Feedback (Priority: P2)

**Goal**: Display PR info for current branch with review comments and status checks.

**Independent Test**: With open PR on branch → select PR step → see PR title, comments, status checks.

### Rust Backend - GitHub API

- [X] T081 [US6] Create GitHub client service with Octokit-like functionality in src-tauri/src/services/github_client.rs
- [X] T082 [US6] Implement check_github_auth command in src-tauri/src/commands/github.rs
- [X] T083 [US6] Implement github_oauth_start command in src-tauri/src/commands/github.rs
- [X] T084 [US6] Implement github_oauth_complete command in src-tauri/src/commands/github.rs
- [X] T085 [US6] Implement get_pull_requests command in src-tauri/src/commands/github.rs
- [X] T086 [US6] Implement get_pr_comments command in src-tauri/src/commands/github.rs
- [X] T087 [US6] Implement network status detection with event emission in src-tauri/src/services/network_monitor.rs
- [X] T088 [US6] Register GitHub commands in src-tauri/src/main.rs

### Frontend - PR View

- [X] T089 [US6] Create PRView component in src/components/workflow/PRView.tsx
- [X] T090 [US6] Create PRCommentList component in src/components/pr/PRCommentList.tsx
- [X] T091 [US6] Create PRComment component (author, body, file context) in src/components/pr/PRComment.tsx
- [X] T092 [US6] Create StatusCheckList component in src/components/pr/StatusCheckList.tsx
- [X] T093 [US6] Create useGitHub hook for GitHub operations in src/hooks/useGitHub.ts
- [X] T094 [US6] Create OfflineMessage component for disabled GitHub steps in src/components/shared/OfflineMessage.tsx
- [X] T095 [US6] Add GitHub auth flow UI (settings or first-use dialog) in src/components/settings/GitHubAuth.tsx

**Checkpoint**: PR step shows PR info when online with valid auth; shows offline message when disconnected

---

## Phase 9: User Story 7 - Manage GitHub Issues for Bug Fixes (Priority: P3)

**Goal**: Display repository issues in Bug Fix step, select issue to view details.

**Independent Test**: With open issues on repo → select Bug Fix step → see issue list → click issue → see details.

### Rust Backend - Issues

- [X] T096 [US7] Implement get_issues command in src-tauri/src/commands/github.rs
- [X] T097 [US7] Implement get_issue_detail command in src-tauri/src/commands/github.rs

### Frontend - Bug Fix View

- [X] T098 [US7] Create BugFixView component in src/components/workflow/BugFixView.tsx
- [X] T099 [US7] Create IssueList component in src/components/issues/IssueList.tsx
- [X] T100 [US7] Create IssueDetail component in src/components/issues/IssueDetail.tsx
- [X] T101 [US7] Create IssueFilters component (state, labels) in src/components/issues/IssueFilters.tsx
- [X] T102 [US7] Integrate offline detection in BugFixView in src/components/workflow/BugFixView.tsx

**Checkpoint**: Bug Fix step shows issues list, can filter and select to view details

---

## Phase 10: User Story 8 - Access Constitution/Settings (Priority: P3)

**Goal**: Settings panel accessible from UI, displays constitution.md content.

**Independent Test**: Click settings icon → see settings panel → constitution tab shows constitution.md content.

### Frontend - Settings

- [X] T103 [US8] Create SettingsPanel component (modal or slide-out) in src/components/settings/SettingsPanel.tsx
- [X] T104 [US8] Create ConstitutionView component in src/components/settings/ConstitutionView.tsx
- [X] T105 [US8] Add settings trigger button to AppShell header in src/components/layout/AppShell.tsx
- [X] T106 [US8] Add theme preference (light/dark/system) to settings in src/components/settings/ThemeSettings.tsx
- [X] T107 [US8] Add recent projects list to settings in src/components/settings/RecentProjects.tsx

**Checkpoint**: Settings accessible via icon, constitution displays, preferences persist

---

## Phase 11: Extended Workflow Steps (P3)

**Goal**: Implement remaining workflow step views (Implement, Test, Push).

### Implement Step (File Tree + Source Viewer)

- [X] T108 [P] Create ImplementView component in src/components/workflow/ImplementView.tsx
- [X] T109 [P] Create FileTree component in src/components/shared/FileTree.tsx
- [X] T110 [P] Create SourceViewer component (read-only, syntax highlighting) in src/components/shared/SourceViewer.tsx
- [X] T111 Implement get_changed_files command in src-tauri/src/commands/project.rs

### Test & Push Steps (Placeholder/Git Status)

- [X] T112 [P] Create TestView component (placeholder or test results display) in src/components/workflow/TestView.tsx
- [X] T113 [P] Create PushView component in src/components/workflow/PushView.tsx
- [X] T114 Implement get_git_status command in src-tauri/src/commands/project.rs

**Checkpoint**: All 8 workflow steps have functional views

---

## Phase 12: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T115 [P] Add loading states and skeletons to all views in src/components/shared/LoadingSkeleton.tsx
- [X] T116 [P] Add error boundaries and error display components in src/components/shared/ErrorBoundary.tsx
- [X] T117 [P] Implement file watcher for external changes in src-tauri/src/services/file_watcher.rs
- [X] T118 [P] Add file change event listener in frontend in src/hooks/useFileWatcher.ts
- [X] T119 Code cleanup and consistent styling across all components
- [X] T120 Performance optimization (React.memo, virtualization for large lists)
- [X] T121 Run quickstart.md validation scenarios

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup) ─────────────────────────────────┐
                                                 │
Phase 2 (Foundational) ──────────────────────────┼─── BLOCKS ALL USER STORIES
                                                 │
┌────────────────────────────────────────────────┘
│
├── Phase 3 (US1: Navigation) ───────────┬─── MVP Core
├── Phase 4 (US2: Artifacts) ────────────┤
├── Phase 5 (US3: Project/Specs) ────────┘
│
├── Phase 6 (US4: Checklists) ───────────┬─── P2 Features
├── Phase 7 (US5: Terminal) ─────────────┤
├── Phase 8 (US6: PR Feedback) ──────────┘
│
├── Phase 9 (US7: Bug Fix) ──────────────┬─── P3 Features
├── Phase 10 (US8: Settings) ────────────┤
├── Phase 11 (Extended Steps) ───────────┘
│
└── Phase 12 (Polish) ─────────────────────── Final
```

### User Story Dependencies

- **US1 (Navigation)**: Foundational only - can start immediately after Phase 2
- **US2 (Artifacts)**: Depends on US1 (needs DetailPane from navigation)
- **US3 (Project/Specs)**: Depends on US1 (needs app shell), independent of US2
- **US4 (Checklists)**: Depends on US2 (extends MarkdownRenderer)
- **US5 (Terminal)**: Depends on US1 (integrates into AppShell), independent of US2-US4
- **US6 (PR Feedback)**: Depends on US1, can parallel with US2-US5
- **US7 (Bug Fix)**: Depends on US6 (shares GitHub infrastructure)
- **US8 (Settings)**: Depends on US1, mostly independent

### Parallel Opportunities Within Phases

**Phase 1 (Setup)**: T003, T004, T005, T006, T007 can run in parallel  
**Phase 2 (Foundational)**: T011/T012/T013 in parallel, T017/T018/T019 in parallel  
**Phase 4 (US2)**: T039/T040/T041 (views) can run in parallel after T036-T038 complete  
**Phase 8 (US6)**: T089-T095 (frontend) can start while T081-T088 (backend) are in progress  

---

## Implementation Strategy

### MVP First (User Stories 1-3 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: US1 - Navigation
4. Complete Phase 4: US2 - Artifacts
5. Complete Phase 5: US3 - Project/Specs
6. **STOP and VALIDATE**: Test navigation + artifact viewing + spec switching
7. Deploy/demo as MVP

### Incremental Delivery

| Increment | User Stories | Value Delivered |
|-----------|--------------|-----------------|
| MVP | US1 + US2 + US3 | Navigate, view artifacts, switch specs |
| +Checklists | +US4 | Interactive task tracking |
| +Terminal | +US5 | Run CLI commands in-app |
| +GitHub | +US6 + US7 | PR feedback and issues |
| +Polish | +US8 + Extended | Full workflow coverage |

---

## Notes

- All `[P]` tasks can run in parallel with others in same phase (different files, no deps)
- `[US#]` label maps task to user story for traceability
- Commit after each task or logical group
- Each user story checkpoint validates independent functionality
- Rust backend tasks can often parallel with React frontend tasks
- xterm.js and PTY integration (US5) is most complex - allocate extra time

---

## Summary

| Metric | Count |
|--------|-------|
| Total Tasks | 121 |
| Setup Tasks | 7 |
| Foundational Tasks | 15 |
| User Story Tasks | 85 |
| Polish Tasks | 7 |
| Parallel Opportunities | 40+ tasks marked [P] |
| User Stories Covered | 8 |
| MVP Scope | Phases 1-5 (US1-US3) |
