# Feature Specification: SpeckitUI Enhanced Editing and Project Management

**Feature Branch**: `005-ui-enhancements`  
**Created**: 2026-01-19  
**Status**: Draft  
**Input**: User description: "Enhance SpeckitUI with editable markdown views, constitution navbar item, composer describe window with agent context integration, new project creation, and artifact file watching with uncommitted changes tracking"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Edit Constitution Directly (Priority: P1)

As a user, I want to view and edit the project constitution directly in the UI so that I can quickly update project guidelines without switching to an external editor.

**Why this priority**: The constitution defines project-wide standards and guidelines. Being able to edit it directly enables immediate updates to agent context without context-switching.

**Independent Test**: User can open constitution view, make changes, save, and verify the constitution.md file is updated on disk.

**Acceptance Scenarios**:

1. **Given** a project is loaded, **When** user clicks the Constitution nav item, **Then** the constitution.md content is displayed in an editable view
2. **Given** the constitution view is open, **When** user modifies text and clicks save, **Then** changes are persisted to disk
3. **Given** the constitution file is modified externally, **When** file changes, **Then** the view updates to reflect new content

---

### User Story 2 - Describe Feature with Rich Composer (Priority: P1)

As a user, I want a rich composer window in the Describe step that allows me to add text, code snippets, images, links, and file uploads, so that I can provide comprehensive context for my feature description.

**Why this priority**: The describe step is the starting point for every feature. Rich content support enables users to provide comprehensive context to AI agents.

**Independent Test**: User can add mixed content (text, code, images) in the composer and view it rendered properly.

**Acceptance Scenarios**:

1. **Given** the Describe view is active, **When** user types text, **Then** it appears in the composer area
2. **Given** the composer is open, **When** user pastes a code snippet, **Then** it is formatted as code with syntax highlighting
3. **Given** the composer is open, **When** user pastes or uploads an image, **Then** it is displayed inline
4. **Given** the composer is open, **When** user adds a link, **Then** it is rendered as a clickable hyperlink
5. **Given** the composer is open, **When** user uploads a document, **Then** it is attached and displayed as a file reference

---

### User Story 3 - Add Context to AI Agent (Priority: P1)

As a user, I want to click "Add to Agent Context" after composing my description, select my preferred AI agent, and have the composer content added to the appropriate agent context file.

**Why this priority**: This is the core value proposition - bridging the UI composition with CLI-based agent workflows.

**Independent Test**: User can compose content, click "Add to Agent Context", select Claude, and verify CLAUDE.md is updated.

**Acceptance Scenarios**:

1. **Given** composer has content, **When** user clicks "Add to Agent Context", **Then** a dialog appears to select the AI agent
2. **Given** agent selection dialog is open, **When** user selects "GitHub Copilot CLI", **Then** content is appended to `.github/agents/copilot-instructions.md`
3. **Given** agent selection dialog is open, **When** user selects "Claude Code CLI", **Then** content is appended to `CLAUDE.md`
4. **Given** agent selection dialog is open, **When** user selects "Gemini CLI", **Then** content is appended to `GEMINI.md`
5. **Given** content is added to agent file, **Then** it is clearly marked as spec-kit specify context and does not overwrite existing spec-kit sections

---

### User Story 4 - Create New Feature Spec (Priority: P2)

As a user, I want to click a "New Spec" button, enter a short name and description, and have the system create the feature branch and placeholder files.

**Why this priority**: Streamlines the feature creation workflow by integrating the shell script into the UI.

**Independent Test**: User can create a new spec via UI and verify the branch is created and spec files exist.

**Acceptance Scenarios**:

1. **Given** user clicks "New Spec" button, **When** dialog opens, **Then** user can enter a short name and description
2. **Given** valid input is provided, **When** user confirms, **Then** `create-new-feature.sh` is invoked with the appropriate arguments
3. **Given** script completes successfully, **Then** the new spec appears in the spec selector and is auto-selected
4. **Given** script fails, **Then** user sees an error message with details

---

### User Story 5 - Create New Project (Priority: P2)

As a user, I want to create a new project from the UI by specifying a name and location, so that I can quickly start a new spec-kit project.

**Why this priority**: Enables users to bootstrap new projects without leaving the application.

**Independent Test**: User can create a new project folder and see advice to run init command.

**Acceptance Scenarios**:

1. **Given** user selects "New Project" option, **When** dialog opens, **Then** user can enter project name and browse for location
2. **Given** valid input is provided, **When** user confirms, **Then** a new folder is created at the specified location
3. **Given** folder is created, **Then** application switches active project context to the new folder
4. **Given** new project is active, **Then** user sees a message advising them to run `speckit init` in the terminal

---

### User Story 6 - Edit All Markdown Artifacts (Priority: P2)

As a user, I want all markdown files in the workflow views (spec.md, plan.md, tasks.md, etc.) to be editable directly in the UI.

**Why this priority**: Reduces friction by allowing direct editing without switching to external editors.

**Independent Test**: User can edit plan.md in the Plan view and verify changes are saved.

**Acceptance Scenarios**:

1. **Given** any workflow view is active (Spec, Plan, Tasks, etc.), **When** user clicks edit mode, **Then** the markdown content becomes editable
2. **Given** user is editing, **When** user saves, **Then** changes are written to the corresponding file
3. **Given** user has unsaved changes, **When** user tries to navigate away, **Then** user is prompted to save or discard

---

### User Story 7 - Watch Artifacts for Changes (Priority: P2)

As a user, I want artifact tabs to update automatically when files change on disk and show an indicator for uncommitted changes.

**Why this priority**: Keeps the UI synchronized with file system changes and provides git status awareness.

**Independent Test**: Modify a spec file externally and verify the UI updates; make changes and verify uncommitted indicator appears.

**Acceptance Scenarios**:

1. **Given** an artifact file is modified externally, **When** watcher detects change, **Then** the view updates to show new content
2. **Given** an artifact file has uncommitted git changes, **When** view is displayed, **Then** a visual indicator (dot, icon) appears on the tab
3. **Given** user commits changes, **When** git status updates, **Then** the uncommitted indicator disappears

---

### User Story 8 - Constitution in Navbar (Priority: P3)

As a user, I want the Constitution to appear as a nav item below the header but above the spec selector, so I can access it quickly.

**Why this priority**: Organizational improvement for better navigation hierarchy.

**Independent Test**: Open app and verify Constitution appears in the expected position in the navbar.

**Acceptance Scenarios**:

1. **Given** the app is loaded with a project, **When** user views navbar, **Then** Constitution appears below the nav header and above the spec selector
2. **Given** user clicks Constitution nav item, **When** clicked, **Then** the Constitution view is displayed in the detail pane

---

### Edge Cases

- What happens when the constitution.md file doesn't exist?
  - System should create an empty file or show a prompt to create one
- What happens when the user pastes very large content in the composer?
  - System should handle gracefully with appropriate scrolling/pagination
- What happens when the agent context file doesn't exist?
  - System should create it using the spec-kit template pattern
- What happens when there's a git conflict in an artifact file?
  - System should show the conflict markers and allow manual resolution
- What happens when file watching fails (permissions, network drive)?
  - System should show a warning but continue operating

## Requirements *(mandatory)*

### Functional Requirements

#### Constitution View
- **FR-001**: System MUST display the Constitution as a clickable nav item in the navbar
- **FR-002**: Constitution nav item MUST appear below the nav header and above the spec selector
- **FR-003**: Constitution view MUST load and display the contents of `constitution.md`
- **FR-004**: Constitution view MUST allow direct editing of the markdown content
- **FR-005**: System MUST save changes to `constitution.md` when user saves

#### Markdown Editing
- **FR-006**: All workflow views (Spec, Plan, Tasks, Research, etc.) MUST support editing mode
- **FR-007**: System MUST persist changes to the corresponding markdown file on save
- **FR-008**: System MUST warn users about unsaved changes before navigation

#### Composer Window
- **FR-009**: Describe view MUST provide a rich composer supporting text input
- **FR-010**: Composer MUST support pasting and formatting code snippets
- **FR-011**: Composer MUST support pasting or uploading images inline
- **FR-012**: Composer MUST support adding links
- **FR-013**: Composer MUST support document and image file uploads
- **FR-033**: Composer content MUST be auto-saved to `description.md` file for persistence across sessions

#### Agent Context Integration
- **FR-014**: System MUST provide an "Add to Agent Context" action button
- **FR-015**: System MUST show a dialog to select the AI agent type
- **FR-016**: System MUST support GitHub Copilot CLI, Claude Code CLI, and Gemini CLI agents
- **FR-017**: System MUST append composer content to the appropriate agent file
- **FR-018**: System MUST NOT overwrite existing spec-kit sections in agent files
- **FR-019**: Added content MUST be clearly marked as spec-kit specify context

#### New Spec Creation
- **FR-020**: System MUST provide a "New Spec" button in the UI
- **FR-021**: System MUST prompt for short name and description
- **FR-022**: System MUST invoke `create-new-feature.sh` with provided arguments
- **FR-023**: System MUST update the spec selector with the new spec after creation

#### New Project Creation
- **FR-024**: System MUST provide a "New Project" option
- **FR-025**: System MUST prompt for project name and location (folder path)
- **FR-026**: System MUST create the specified folder
- **FR-027**: System MUST switch active project context to the new folder
- **FR-028**: System MUST display advice to run `speckit init` command

#### File Watching
- **FR-029**: System MUST watch all artifact files for changes
- **FR-030**: System MUST update views when watched files change on disk
- **FR-031**: System MUST track git status for each artifact file
- **FR-032**: System MUST display a visual indicator for files with uncommitted changes

### Key Entities

- **Composer Content**: Rich content consisting of text blocks, code blocks, images, links, and file attachments
- **Agent Type**: Enum of supported AI agents (copilot, claude, gemini)
- **Artifact**: A markdown file associated with a workflow step (spec.md, plan.md, etc.)
- **Uncommitted Change Indicator**: Visual state indicating a file differs from the git HEAD

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can edit and save constitution.md directly in the UI within 3 clicks
- **SC-002**: Users can compose rich content (text + code + image) in the Describe view
- **SC-003**: "Add to Agent Context" updates the correct agent file within 2 seconds
- **SC-004**: New spec creation via UI completes in under 5 seconds
- **SC-005**: File changes are reflected in the UI within 1 second of modification
- **SC-006**: Uncommitted changes indicator appears within 2 seconds of file modification
- **SC-007**: All markdown artifacts across workflow steps are editable and saveable
- **SC-008**: New project creation creates folder and switches context within 3 seconds

## Assumptions

- The project has a valid `.specify` directory with the `create-new-feature.sh` script
- Git is available and the project is a git repository
- Agent context files follow the spec-kit template patterns
- Users have write permissions to the project directory
- The spec-kit CLI documentation provides clear `init` command usage information

## Clarifications

### Session 2026-01-19

- Q: Should composer content persist to a file or only exist in memory? → A: Auto-save composer content to `description.md` file for persistence
