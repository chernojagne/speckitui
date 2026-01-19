# Tasks: SpeckitUI Enhanced Editing and Project Management

**Input**: Design documents from `/specs/005-ui-enhancements/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Tests included where Constitution IV (Test-First) applies - Rust backend commands.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Exact file paths included in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, types, and shared stores

- [X] T001 Add new type definitions (ComposerContent, AgentType, Artifact, EditorState, etc.) in src/types/index.ts
- [X] T002 [P] Create editorStore with unsaved changes tracking in src/stores/editorStore.ts
- [X] T003 [P] Create artifactStore with artifact file states in src/stores/artifactStore.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Backend Rust commands that MUST be complete before frontend work

**⚠️ CRITICAL**: Tests written first per Constitution IV

### Rust Backend Commands

- [X] T004 Write unit tests for write_file command in src-tauri/src/commands/file_write.rs
- [X] T005 Implement write_file command in src-tauri/src/commands/file_write.rs
- [X] T006 [P] Write unit tests for execute_shell_script command in src-tauri/src/commands/shell_exec.rs
- [X] T007 [P] Implement execute_shell_script command in src-tauri/src/commands/shell_exec.rs
- [X] T008 [P] Write unit tests for get_git_status command in src-tauri/src/services/git_status.rs
- [X] T009 [P] Implement get_git_status command in src-tauri/src/services/git_status.rs
- [X] T010 [P] Write unit tests for create_directory command in src-tauri/src/commands/file_write.rs
- [X] T011 [P] Implement create_directory command in src-tauri/src/commands/file_write.rs
- [ ] T012 Extend file_watcher.rs to support watch_artifact_files and unwatch_artifact_files in src-tauri/src/services/file_watcher.rs
- [X] T013 Implement update_agent_context command in src-tauri/src/commands/file_write.rs
- [X] T014 Register all new commands in src-tauri/src/commands/mod.rs
- [X] T015 Register commands in Tauri app builder in src-tauri/src/lib.rs

### Frontend Command Bindings

- [X] T016 Add TypeScript bindings for write_file, execute_shell_script, get_git_status in src/services/tauriCommands.ts
- [X] T017 Add TypeScript bindings for create_directory, watch_artifact_files, update_agent_context in src/services/tauriCommands.ts

**Checkpoint**: Foundation ready - all Rust commands tested and available via IPC

---

## Phase 3: User Story 1 - Edit Constitution Directly (Priority: P1) 🎯 MVP

**Goal**: Users can view and edit constitution.md directly in the UI

**Independent Test**: Click Constitution → edit → save → verify constitution.md updated on disk

### Implementation for User Story 1

- [X] T018 [P] [US1] Create useMarkdownEditor hook with edit/save logic in src/hooks/useMarkdownEditor.ts
- [X] T019 [US1] Create MarkdownEditor shared component with edit/preview toggle in src/components/shared/MarkdownEditor.tsx
- [X] T020 [US1] Modify ConstitutionView to use MarkdownEditor for editing in src/components/settings/ConstitutionView.tsx
- [X] T020a [US1] Handle missing constitution.md - show create prompt or create empty file in src/components/settings/ConstitutionView.tsx
- [X] T021 [US1] Add file watching for constitution.md to update view on external changes in src/components/settings/ConstitutionView.tsx
- [X] T022 [US1] Add unsaved changes warning dialog using editorStore in src/components/settings/ConstitutionView.tsx

**Checkpoint**: User Story 1 complete - Constitution is editable and saveable

---

## Phase 4: User Story 8 - Constitution in Navbar (Priority: P3, but needed for US1)

**Goal**: Constitution appears as nav item below header, above spec selector

**Independent Test**: Open app → verify Constitution nav item position → click → opens Constitution view

**Note**: Moving this before other P1 stories because it provides the navigation path for US1

### Implementation for User Story 8

- [X] T023 [US8] Add Constitution nav item in NavPane below header section in src/components/layout/NavPane.tsx
- [X] T024 [US8] Style Constitution nav item and update NavPane.css in src/components/layout/NavPane.css
- [X] T025 [US8] Wire Constitution nav click to display ConstitutionView in detail pane in src/App.tsx or routing

**Checkpoint**: User Story 8 complete - Constitution accessible via navbar

---

## Phase 5: User Story 2 - Describe Feature with Rich Composer (Priority: P1)

**Goal**: Rich composer in Describe view supporting text, code, images, links, file uploads

**Independent Test**: Add text → paste code → paste image → verify all content renders correctly

### Implementation for User Story 2

- [X] T026 [P] [US2] Create RichComposer component with markdown textarea in src/components/shared/RichComposer.tsx
- [X] T027 [P] [US2] Add code snippet paste handling with syntax highlighting in src/components/shared/RichComposer.tsx
- [X] T028 [US2] Add image paste/upload handling with base64 inline display in src/components/shared/RichComposer.tsx
- [X] T029 [US2] Add link insertion support in src/components/shared/RichComposer.tsx
- [X] T030 [US2] Add file upload handling with file reference display in src/components/shared/RichComposer.tsx
- [X] T031 [US2] Create useComposer hook for auto-save to description.md in src/hooks/useComposer.ts
- [X] T032 [US2] Integrate RichComposer into DescribeView replacing existing composer in src/components/workflow/DescribeView.tsx
- [X] T033 [US2] Add preview mode toggle to show rendered markdown in src/components/shared/RichComposer.tsx

**Checkpoint**: User Story 2 complete - Rich composer with mixed content support

---

## Phase 6: User Story 3 - Add Context to AI Agent (Priority: P1)

**Goal**: "Add to Agent Context" button updates selected agent file with composer content

**Independent Test**: Compose content → Add to Agent Context → select Claude → verify CLAUDE.md updated

### Implementation for User Story 3

- [X] T034 [P] [US3] Create AgentSelector dialog component with agent options in src/components/shared/AgentSelector.tsx
- [X] T035 [US3] Add agent configuration constants (file paths, markers) in src/config/agentConfig.ts
- [X] T036 [US3] Add "Add to Agent Context" button to DescribeView in src/components/workflow/DescribeView.tsx
- [X] T037 [US3] Implement agent file update logic using update_agent_context IPC in src/components/shared/AgentSelector.tsx
- [X] T037a [US3] Handle missing agent context file - create with spec-kit template markers in src-tauri/src/commands/file_write.rs
- [X] T038 [US3] Show success/error toast after agent context update in src/components/shared/AgentSelector.tsx

**Checkpoint**: User Story 3 complete - Composer content flows to agent context files

---

## Phase 7: User Story 6 - Edit All Markdown Artifacts (Priority: P2)

**Goal**: All workflow views support editing and saving markdown files

**Independent Test**: Open Plan view → edit → save → verify plan.md updated

### Implementation for User Story 6

- [ ] T039 [P] [US6] Add edit mode to SpecView using MarkdownEditor in src/components/workflow/SpecView.tsx
- [ ] T040 [P] [US6] Add edit mode to PlanView using MarkdownEditor in src/components/workflow/PlanView.tsx
- [ ] T041 [P] [US6] Add edit mode to TasksView using MarkdownEditor in src/components/workflow/TasksView.tsx
- [ ] T042 [P] [US6] Add edit mode to ResearchView using MarkdownEditor in src/components/workflow/ResearchView.tsx
- [ ] T043 [US6] Add unsaved changes prompt to all workflow views using editorStore in src/components/workflow/*.tsx
- [ ] T044 [US6] Add Edit/Save toggle button to workflow view header pattern in src/components/workflow/*.tsx

**Checkpoint**: User Story 6 complete - All markdown artifacts editable inline

---

## Phase 8: User Story 7 - Watch Artifacts for Changes (Priority: P2)

**Goal**: Artifact views auto-update on file changes, show uncommitted changes indicator

**Independent Test**: Edit spec.md externally → UI updates; make change → uncommitted dot appears

### Implementation for User Story 7

- [ ] T045 [P] [US7] Create useGitStatus hook to poll/watch git status in src/hooks/useGitStatus.ts
- [ ] T046 [P] [US7] Create useArtifactWatcher hook using watch_artifact_files IPC in src/hooks/useArtifactWatcher.ts
- [ ] T047 [US7] Integrate useArtifactWatcher into workflow views for live updates in src/components/workflow/*.tsx
- [ ] T048 [US7] Add uncommitted changes indicator (dot) to workflow view tabs in src/components/layout/DetailPane.tsx
- [ ] T049 [US7] Style uncommitted indicator with appropriate color/icon in src/components/layout/DetailPane.css
- [ ] T050 [US7] Update artifactStore with git status from events in src/stores/artifactStore.ts

**Checkpoint**: User Story 7 complete - Live file watching and git status indicators

---

## Phase 9: User Story 4 - Create New Feature Spec (Priority: P2)

**Goal**: "New Spec" button creates branch and spec files via shell script

**Independent Test**: Click New Spec → enter name/desc → verify branch created, spec files exist

### Implementation for User Story 4

- [ ] T051 [P] [US4] Create NewSpecDialog component with name/description inputs in src/components/shared/NewSpecDialog.tsx
- [ ] T052 [US4] Implement execute_shell_script call for create-new-feature.sh in src/components/shared/NewSpecDialog.tsx
- [ ] T053 [US4] Add New Spec button to spec selector or appropriate UI location in src/components/layout/SpecSelector.tsx
- [ ] T054 [US4] Handle script success - refresh spec list and auto-select new spec in src/components/shared/NewSpecDialog.tsx
- [ ] T055 [US4] Handle script failure - show error toast with details in src/components/shared/NewSpecDialog.tsx

**Checkpoint**: User Story 4 complete - New specs created via UI

---

## Phase 10: User Story 5 - Create New Project (Priority: P2)

**Goal**: "New Project" option creates folder and prompts for speckit init

**Independent Test**: New Project → enter name/location → verify folder created, init advice shown

### Implementation for User Story 5

- [ ] T056 [P] [US5] Create NewProjectDialog component with name and folder picker in src/components/shared/NewProjectDialog.tsx
- [ ] T057 [US5] Implement create_directory call for new project folder in src/components/shared/NewProjectDialog.tsx
- [ ] T058 [US5] Add "New Project" option to ProjectHeader or menu in src/components/layout/ProjectHeader.tsx
- [ ] T059 [US5] Switch active project context to new folder using projectStore in src/components/shared/NewProjectDialog.tsx
- [ ] T060 [US5] Show advice message to run `speckit init` in terminal in src/components/shared/NewProjectDialog.tsx

**Checkpoint**: User Story 5 complete - New projects created via UI

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup and cross-cutting improvements

- [ ] T061 [P] Add keyboard shortcuts for save (Ctrl+S) across all editable views
- [ ] T062 [P] Add loading states for all async operations (file save, script exec)
- [ ] T063 Improve error handling with consistent toast messages throughout
- [ ] T064 [P] Update existing E2E tests to account for new UI elements
- [ ] T065 Run quickstart.md validation to verify all features work end-to-end
- [ ] T066 Code review and cleanup - remove console.logs, add comments

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories
- **User Stories (Phase 3-10)**: All depend on Foundational phase completion
  - US1 + US8 first (Constitution editing + navbar - MVP)
  - US2 + US3 next (Composer + Agent context - core P1)
  - US6 + US7 parallel (Markdown editing + File watching)
  - US4 + US5 parallel (New spec + New project)
- **Polish (Phase 11)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Requires Phase 2 foundational commands
- **User Story 8 (P3)**: No dependencies beyond Phase 2 - enables navigation to US1
- **User Story 2 (P1)**: Requires Phase 2, independent of US1/US8
- **User Story 3 (P1)**: Requires US2 (needs composer content)
- **User Story 6 (P2)**: Requires US1 (shares MarkdownEditor component)
- **User Story 7 (P2)**: Requires Phase 2, can parallel with US6
- **User Story 4 (P2)**: Requires Phase 2 (shell_exec command)
- **User Story 5 (P2)**: Requires Phase 2 (create_directory command)

### Within Each User Story

- Rust tests MUST be written before implementation (Constitution IV)
- Models/Types before hooks
- Hooks before components
- Shared components before specific views
- Story complete before moving to next priority

### Parallel Opportunities

- T002, T003: Both stores can be created in parallel
- T006-T011: All test/implementation pairs for different commands
- T018, T026, T034, T045, T046, T051, T056: Initial tasks of independent stories
- T039-T042: All workflow view edit modes (different files)
- T064-T066: Polish tasks are independent

---

## Parallel Example: User Story 2 (Composer)

```bash
# Once Foundational phase complete, launch US2 tasks in parallel:
T026 "Create RichComposer component with markdown textarea in src/components/shared/RichComposer.tsx"
T027 "Add code snippet paste handling with syntax highlighting in src/components/shared/RichComposer.tsx"

# Then sequential (same file):
T028 "Add image paste/upload handling..."
T029 "Add link insertion support..."
T030 "Add file upload handling..."
```

---

## Implementation Strategy

### MVP First (US1 + US8)

1. Complete Phase 1: Setup (types + stores)
2. Complete Phase 2: Foundational (Rust commands with tests)
3. Complete Phase 4: US8 (Constitution in navbar)
4. Complete Phase 3: US1 (Constitution editing)
5. **STOP and VALIDATE**: Verify constitution editing works end-to-end
6. Demo/Deploy MVP

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US8 + US1 → Constitution editing MVP → Deploy
3. Add US2 + US3 → Rich composer with agent context → Deploy
4. Add US6 + US7 → All artifacts editable with file watching → Deploy
5. Add US4 + US5 → New spec and project creation → Deploy
6. Polish → Final cleanup and E2E validation

### Task Summary

| Phase | Description | Task Count |
|-------|-------------|------------|
| Phase 1 | Setup | 3 |
| Phase 2 | Foundational | 14 |
| Phase 3 | US1 - Constitution Editing | 6 |
| Phase 4 | US8 - Constitution Navbar | 3 |
| Phase 5 | US2 - Rich Composer | 8 |
| Phase 6 | US3 - Agent Context | 6 |
| Phase 7 | US6 - Edit All Markdown | 6 |
| Phase 8 | US7 - File Watching | 6 |
| Phase 9 | US4 - New Spec | 5 |
| Phase 10 | US5 - New Project | 5 |
| Phase 11 | Polish | 6 |
| **Total** | | **68** |

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Constitution IV requires Rust command tests before implementation
- Each user story checkpoint enables independent demo/validation
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
