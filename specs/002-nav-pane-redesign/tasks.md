# Tasks: Navigation Pane Redesign

**Input**: Design documents from `/specs/002-nav-pane-redesign/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Not explicitly requested in spec - test tasks omitted (add if needed).

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Type system updates, store additions, and shadcn/ui component installation

### shadcn/ui Component Installation

- [x] T001a [P] Install shadcn/ui Select component: `npx shadcn@latest add select`
- [x] T001b [P] Install shadcn/ui Textarea component: `npx shadcn@latest add textarea`
- [x] T001c [P] Install shadcn/ui Avatar component: `npx shadcn@latest add avatar`

### Type and Config Updates

- [x] T001 Add 'describe' to WorkflowStepId union type in src/types/index.ts
- [x] T002 Add hasDescription to ArtifactManifest interface in src/types/index.ts
- [x] T003 Add Describe step config with PenLine icon in src/config/workflowSteps.ts
- [x] T004 [P] Add navPaneWidth and navPaneCollapsed to settingsStore in src/stores/settingsStore.ts
- [x] T005 [P] Create descriptionStore with content, isDirty, loading states in src/stores/descriptionStore.ts
- [x] T006 [P] Update workflowStore.updateContentStatus to include describe in src/stores/workflowStore.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Tauri backend commands that MUST be complete before frontend implementation

**⚠️ CRITICAL**: No user story work can begin until Tauri commands are working

### Tests (Constitution IV: Test-First)

- [x] T007a [P] Write unit tests for save_description command in src-tauri/src/commands/description.rs
- [x] T007b [P] Write unit tests for load_description command in src-tauri/src/commands/description.rs

### Implementation

- [x] T007 Create description.rs with save_description command in src-tauri/src/commands/description.rs
- [x] T008 Add load_description command to src-tauri/src/commands/description.rs
- [x] T009 Register description commands in Tauri invoke_handler in src-tauri/src/lib.rs
- [x] T010 Add saveDescription TypeScript wrapper in src/services/tauriCommands.ts
- [x] T011 Add loadDescription TypeScript wrapper in src/services/tauriCommands.ts
- [x] T012 Create useDescription hook with load/save/debounce logic in src/hooks/useDescription.ts

**Checkpoint**: Foundation ready - `cargo build` and TypeScript compilation pass, unit tests pass

---

## Phase 3: User Story 1 - View Project and Navigate Specs (Priority: P1) 🎯 MVP

**Goal**: Project name visible at top (uppercase), spec dropdown works without "Spec:" label

**Independent Test**: Open app, verify project name shows uppercase, switch between specs

### Implementation for User Story 1

- [x] T013 [US1] Create ProjectHeader component with uppercase name in src/components/layout/ProjectHeader.tsx
- [x] T014 [US1] Refactor SpecSelector to use shadcn/ui Select component (remove native select)
- [x] T015 [US1] Update NavPane to include ProjectHeader at top in src/components/layout/NavPane.tsx
- [x] T016 [US1] Move SpecSelector from AppShell header into NavPane in src/components/layout/NavPane.tsx
- [x] T017 [US1] Remove SpecSelector from AppShell header in src/components/layout/AppShell.tsx

**Checkpoint**: User Story 1 complete - project name and spec selector visible in nav pane

---

## Phase 4: User Story 2 - Describe Feature Before Specifying (Priority: P1) 🎯 MVP

**Goal**: "Describe" step appears first, text editor saves per-spec description.md

**Independent Test**: Navigate to Describe, type text, switch specs, verify text persists

### Implementation for User Story 2

- [x] T018 [P] [US2] Create DescribeEditor component using shadcn/ui Textarea in src/components/workflow/DescribeEditor.tsx
- [x] T019 [US2] Create DescribeStep component using DescribeEditor in src/components/workflow/DescribeStep.tsx
- [x] T020 [US2] Add 'describe' case to DetailPane to render DescribeStep in src/components/layout/DetailPane.tsx
- [x] T021 [US2] Wire DescribeStep to useDescription hook for load/save in src/components/workflow/DescribeStep.tsx
- [x] T022 [US2] Update artifact scanning to detect description.md in src-tauri/src/commands/project.rs
- [x] T022a [US2] Integrate description content as context input to Specify step execution (FR-008)

**Checkpoint**: User Story 2 complete - Describe step works with persistent text and flows to Specify

---

## Phase 5: User Story 3 - Access Settings via Avatar Menu (Priority: P2)

**Goal**: Avatar icon at bottom of nav pane with dropdown menu for Settings

**Independent Test**: Click avatar, see menu with Settings, click Settings to open dialog

### Implementation for User Story 3

- [x] T023 [US3] Create AvatarMenu component using shadcn/ui Avatar + DropdownMenu in src/components/layout/AvatarMenu.tsx
- [x] T024 [US3] Add AvatarMenu to bottom of NavPane in src/components/layout/NavPane.tsx
- [x] T025 [US3] Remove Settings button from AppShell header in src/components/layout/AppShell.tsx
- [x] T026 [US3] Pass onSettings callback from NavPane to AvatarMenu for settings dialog

**Checkpoint**: User Story 3 complete - Settings accessible from avatar menu

---

## Phase 6: User Story 4 - Open New Project via Folder Picker (Priority: P2)

**Goal**: Folder icon in project header opens file picker to switch projects

**Independent Test**: Click folder icon, select different project, verify app loads it

### Implementation for User Story 4

- [x] T027 [US4] Add folder picker button to ProjectHeader in src/components/layout/ProjectHeader.tsx
- [x] T028 [US4] Wire folder picker to existing handleOpenProject in AppShell
- [x] T029 [US4] Pass onOpenProject callback from NavPane to ProjectHeader

**Checkpoint**: User Story 4 complete - project switching works from nav pane

---

## Phase 7: User Story 5 - Create New Spec (Priority: P2)

**Goal**: "New spec" button next to spec dropdown creates new spec directory

**Independent Test**: Click new spec button, enter name, verify spec appears in dropdown

### Implementation for User Story 5

- [x] T030 [US5] Add new spec button with Plus icon to SpecSelector in src/components/layout/SpecSelector.tsx
- [x] T031 [US5] Create create_spec Tauri command in src-tauri/src/commands/project.rs
- [x] T032 [US5] Add createSpec TypeScript wrapper in src/services/tauriCommands.ts
- [x] T033 [US5] Implement new spec dialog/prompt in SpecSelector component
- [x] T034 [US5] Register create_spec command in Tauri invoke_handler in src-tauri/src/lib.rs

**Checkpoint**: User Story 5 complete - new specs can be created from nav pane

---

## Phase 8: User Story 6 - Resize and Collapse Navigation Pane (Priority: P3)

**Goal**: Drag to resize (180-400px), chevron to collapse to icon rail

**Independent Test**: Drag edge to resize, click chevron to collapse/expand, verify persistence

### Implementation for User Story 6

- [x] T035 [US6] Install shadcn/ui Resizable component: `npx shadcn@latest add resizable`
- [x] T036 [US6] Wrap AppShell layout in ResizablePanelGroup with horizontal direction
- [x] T037 [US6] Convert NavPane to ResizablePanel with minSize/maxSize constraints
- [x] T038 [US6] Implement collapsed icon rail state in NavPane with step icons and avatar
- [x] T039 [US6] Add chevron toggle button to NavPane for collapse/expand
- [x] T040 [US6] Wire onLayout callback to settingsStore for persistence
- [x] T041 [US6] Add smooth CSS transition for collapse/expand animation

**Checkpoint**: User Story 6 complete - resizable and collapsible nav pane

---

## Phase 9: User Story 7 - Inject Description into Terminal (Priority: P3)

**Goal**: "Send to Terminal" button injects description text to active terminal

**Independent Test**: Enter text in Describe, click Send to Terminal, verify text appears in terminal

### Implementation for User Story 7

- [x] T042 [US7] Add "Send to Terminal" button to DescribeEditor toolbar in src/components/workflow/DescribeEditor.tsx
- [x] T043 [US7] Implement sendToTerminal function using writeTerminal in src/components/workflow/DescribeEditor.tsx
- [x] T044 [US7] Add visual feedback (toast/badge) confirming text was sent

**Checkpoint**: User Story 7 complete - description can be injected to terminal

---

## Phase 10: E2E Tests (Constitution Quality Gate 2)

**Purpose**: E2E coverage for all user stories per Constitution requirement

**Note**: E2E testing for Tauri apps requires additional infrastructure (Tauri-driver, WebDriver setup). These tests are deferred to a separate testing setup PR.

- [ ] T045 [P] E2E test: project name displays uppercase, spec switching works (US1) in tests/e2e/nav-pane.spec.ts
- [ ] T046 [P] E2E test: Describe step text persists and flows to Specify (US2) in tests/e2e/describe-step.spec.ts
- [ ] T047 [P] E2E test: avatar menu opens, Settings accessible (US3) in tests/e2e/avatar-menu.spec.ts
- [ ] T048 [P] E2E test: folder picker opens and loads new project (US4) in tests/e2e/nav-pane.spec.ts
- [ ] T049 [P] E2E test: new spec creation works (US5) in tests/e2e/spec-creation.spec.ts
- [ ] T050 [P] E2E test: nav pane resize and collapse works (US6) in tests/e2e/nav-pane-resize.spec.ts
- [ ] T051 [P] E2E test: Send to Terminal injects text (US7) in tests/e2e/describe-step.spec.ts

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements affecting multiple user stories

- [x] T052 [P] Add tooltips for step icons in collapsed nav pane state
- [x] T053 [P] Add "Log in to GitHub" option to AvatarMenu (placeholder for future)
- [x] T054 [P] Handle edge case: no project loaded (show placeholder in ProjectHeader)
- [x] T055 [P] Handle edge case: no specs in project (show "No specs" in dropdown)
- [x] T056 Run quickstart.md verification checklist

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories
- **User Stories (Phases 3-9)**: All depend on Foundational phase
  - US1 and US2 are P1 priority - complete these first for MVP
  - US3, US4, US5 are P2 - complete after P1 stories
  - US6, US7 are P3 - complete after P2 stories
- **Polish (Phase 10)**: Depends on all user stories complete

### User Story Dependencies

- **US1 (P1)**: Independent - project name and spec selector
- **US2 (P1)**: Independent - describe step and editor
- **US3 (P2)**: Independent - avatar menu
- **US4 (P2)**: Depends on US1 (ProjectHeader exists)
- **US5 (P2)**: Independent - spec creation
- **US6 (P3)**: Independent - resize/collapse
- **US7 (P3)**: Depends on US2 (DescribeEditor exists)

### Parallel Opportunities

Within Phase 1 (Setup):
- T004, T005, T006 can run in parallel (different files)

Within Phase 2 (Foundational):
- T010, T011 can run in parallel (same file but different functions)

User Stories can be parallelized:
- US1 + US2 can run in parallel (P1 stories, different components)
- US3 + US5 can run in parallel (P2 stories, different components)

---

## Parallel Example: Phase 1 Setup

```bash
# Launch all parallel-safe tasks together:
T004: "Add navPaneWidth/navPaneCollapsed to settingsStore"
T005: "Create descriptionStore"  
T006: "Update workflowStore.updateContentStatus"
```

---

## Implementation Strategy

### MVP First (US1 + US2)

1. Complete Phase 1: Setup (types, stores)
2. Complete Phase 2: Foundational (Tauri commands)
3. Complete Phase 3: US1 - Project/Spec navigation
4. Complete Phase 4: US2 - Describe step
5. **STOP and VALIDATE**: Core workflow functional
6. Demo/deploy MVP

### Incremental Delivery

| Milestone | Stories | Value Delivered |
|-----------|---------|-----------------|
| MVP | US1 + US2 | Core navigation + Describe workflow |
| v0.2 | + US3 + US4 + US5 | Settings access + project switching + new specs |
| v0.3 | + US6 + US7 | Resize/collapse + terminal injection |

---

## Summary

| Metric | Count |
|--------|-------|
| **Total Tasks** | 59 |
| **Setup Tasks** | 9 (includes 3 shadcn/ui installs) |
| **Foundational Tasks** | 8 (includes 2 test tasks) |
| **User Story Tasks** | 34 |
| **E2E Test Tasks** | 7 |
| **Polish Tasks** | 5 |
| **Parallel Opportunities** | 20 tasks marked [P] |
| **MVP Scope** | 21 tasks (Phase 1-4) |
