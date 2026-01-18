# Feature Specification: Navigation Pane Redesign

**Feature Branch**: `002-nav-pane-redesign`  
**Created**: 2026-01-17  
**Status**: Draft  
**Input**: User description: "Redesign navigation pane with full-height layout, project header, spec selector, feature input step, resizable/collapsible panel, and avatar menu"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Project and Navigate Specs (Priority: P1)

As a user, I want to see the current project name prominently at the top of the navigation pane and easily switch between specs so I always know my context and can navigate efficiently.

**Why this priority**: Core navigation is fundamental - without knowing which project/spec you're in, all other features are confusing.

**Independent Test**: Can be tested by opening the app with a project, verifying project name is visible (uppercase styled, left-aligned), seeing the spec dropdown populated, and successfully switching between specs.

**Acceptance Scenarios**:

1. **Given** a project is loaded, **When** I look at the navigation pane, **Then** I see the project name in uppercase at the top left
2. **Given** a project with multiple specs, **When** I click the spec dropdown, **Then** I see all available specs listed without the "Spec:" label prefix
3. **Given** the spec dropdown is open, **When** I select a different spec, **Then** the detail pane updates to show that spec's content

---

### User Story 2 - Describe Feature Before Specifying (Priority: P1)

As a user, I want a dedicated step before "Specify" where I can write a description of the feature I'm creating, so this description becomes context input for the specification process.

**Why this priority**: This is the new core workflow addition - capturing feature intent before AI generates the spec is essential for the spec-driven development process.

**Independent Test**: Can be tested by navigating to the new "Describe" step, typing feature description text, then proceeding to Specify and confirming the description is available as context.

**Acceptance Scenarios**:

1. **Given** I am viewing the workflow steps, **When** I look at the step list, **Then** I see a "Describe" step above "Specify"
2. **Given** I am on the Describe step, **When** I view the detail pane, **Then** I see a text editor where I can enter feature information
3. **Given** I have entered text in the Describe step, **When** I navigate to the Specify step and run it, **Then** the description text is included as context input

---

### User Story 3 - Access Settings and GitHub Login via Avatar Menu (Priority: P2)

As a user, I want to access settings and GitHub login from an avatar icon at the bottom of the navigation pane so these options are always accessible without cluttering the main UI.

**Why this priority**: Settings access is important but not blocking for core workflow. Moving it to a consistent location improves UI organization.

**Independent Test**: Can be tested by clicking the avatar icon at the bottom of nav pane, verifying the popup menu appears with "Log in to GitHub" and "Settings" options, and confirming Settings opens the current settings dialog.

**Acceptance Scenarios**:

1. **Given** I am viewing the navigation pane, **When** I look at the bottom, **Then** I see an avatar icon
2. **Given** I click the avatar icon, **When** the menu appears, **Then** I see options for "Log in to GitHub" and "Settings"
3. **Given** the avatar menu is open, **When** I click "Settings", **Then** the settings dialog opens

---

### User Story 4 - Open New Project via Folder Picker (Priority: P2)

As a user, I want a folder icon next to the project name that opens a file picker so I can easily switch to a different project.

**Why this priority**: Project switching is common but less frequent than spec navigation within a project.

**Independent Test**: Can be tested by clicking the folder icon, selecting a different project folder, and verifying the app loads the new project.

**Acceptance Scenarios**:

1. **Given** I am viewing the navigation pane, **When** I look at the project header row, **Then** I see a folder icon right-aligned
2. **Given** I click the folder icon, **When** the file picker opens, **Then** I can navigate to and select a project folder
3. **Given** I select a valid project folder, **When** the picker closes, **Then** the new project loads and the project name updates

---

### User Story 5 - Create New Spec (Priority: P2)

As a user, I want a button next to the spec dropdown to create a new spec so I can quickly start new specifications within the current project.

**Why this priority**: Spec creation supports workflow but is less frequent than navigation.

**Independent Test**: Can be tested by clicking the new spec button, entering a spec name in the prompt/dialog, and verifying a new spec appears in the dropdown.

**Acceptance Scenarios**:

1. **Given** I am viewing the spec dropdown row, **When** I look to the right, **Then** I see a button to create a new spec
2. **Given** I click the new spec button, **When** a dialog/prompt appears, **Then** I can enter a name for the new spec
3. **Given** I enter a spec name and confirm, **When** the dialog closes, **Then** the new spec is created and selected

---

### User Story 6 - Resize and Collapse Navigation Pane (Priority: P3)

As a user, I want to resize the navigation pane horizontally by dragging and collapse it entirely so I can optimize my screen space based on current needs.

**Why this priority**: UI customization is a quality-of-life improvement, not core functionality.

**Independent Test**: Can be tested by dragging the right edge of the nav pane to resize, clicking a collapse button to hide it, and clicking again to restore it.

**Acceptance Scenarios**:

1. **Given** I am viewing the navigation pane, **When** I hover over the right edge, **Then** I see a resize cursor
2. **Given** I drag the right edge, **When** I move the mouse horizontally, **Then** the pane width changes within 180px-400px bounds
3. **Given** the navigation pane is visible, **When** I click the chevron button on the pane's edge, **Then** the pane collapses to an icon rail showing chevron, step icons, and avatar
4. **Given** the navigation pane is collapsed to icon rail, **When** I click the chevron button, **Then** the pane restores to its previous width

---

### User Story 7 - Inject Feature Description into Terminal Context (Priority: P3)

As a user, I want a way to add the feature description text from the Describe step as context to the agent CLI running in the terminal so I can provide the same context to command-line tools.

**Why this priority**: This is an advanced workflow integration that enhances power-user capabilities.

**Independent Test**: Can be tested by entering text in the Describe step, triggering the "add to terminal context" action, and verifying the terminal receives the context.

**Acceptance Scenarios**:

1. **Given** I have text in the Describe step, **When** I look at the text editor toolbar, **Then** I see a "Send to Terminal" button
2. **Given** I click the "Send to Terminal" button, **When** the action completes, **Then** the terminal agent CLI receives the description as context input

---

### Edge Cases

- What happens when no project is loaded? The project name area shows placeholder text prompting user to open a project.
- What happens when a project has no specs? The dropdown shows "No specs" and the new spec button remains available.
- What happens when the Describe step text is empty and user proceeds to Specify? The Specify step runs without feature description context (graceful degradation).
- What happens when the navigation pane is resized to minimum width? The pane either stops at a minimum usable width or collapses automatically.
- What happens when GitHub login fails? The avatar menu shows an error state and retry option.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Navigation pane MUST span the full height of the left edge of the application
- **FR-002**: Project name MUST be displayed in uppercase styling, left-aligned at the top of the navigation pane
- **FR-003**: A folder icon MUST be right-aligned in the project header row to open a file picker for selecting a new project
- **FR-004**: Spec dropdown MUST display spec names without the "Spec:" label prefix
- **FR-005**: A "new spec" button MUST be right-aligned next to the spec dropdown
- **FR-006**: A "Describe" step MUST appear above the "Specify" step in the workflow
- **FR-007**: The "Describe" step detail pane MUST contain a text editor for entering feature descriptions
- **FR-008**: The feature description from the Describe step MUST be available as context input to the Specify step
- **FR-009**: An avatar icon MUST be displayed at the bottom of the navigation pane
- **FR-010**: Clicking the avatar icon MUST display a popup menu with "Log in to GitHub" and "Settings" options
- **FR-011**: The "Settings" menu option MUST open the existing settings dialog
- **FR-012**: The navigation pane MUST be horizontally resizable by dragging its right edge, with minimum width of 180px and maximum width of 400px
- **FR-013**: The navigation pane MUST be collapsible via a dedicated chevron button on the pane's edge; when collapsed, an icon rail MUST remain visible showing the chevron, workflow step icons, and avatar icon
- **FR-014**: System MUST provide a mechanism to inject the Describe step text as context to the terminal agent CLI via a "Send to Terminal" button in the Describe step's text editor toolbar
- **FR-015**: The feature description text MUST be persisted per-spec in the spec directory (e.g., `description.md`)

### Key Entities

- **Navigation Pane**: The full-height left sidebar containing project header, spec selector, workflow steps, and avatar menu
- **Project Header**: Top section displaying uppercase project name and folder picker icon
- **Spec Selector**: Dropdown for switching between specs with adjacent new spec button
- **Describe Step**: New workflow step containing a text editor for feature description input
- **Feature Description**: User-entered text describing the feature to be specified, persisted as `description.md` in the spec directory, used as context for subsequent steps
- **Avatar Menu**: Bottom popup menu providing access to GitHub login and settings
- **Icon Rail**: Minimal collapsed state of the navigation pane showing only essential icons (chevron, step icons, avatar)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can identify current project and spec within 2 seconds of viewing the navigation pane
- **SC-002**: Users can switch between specs in 2 clicks or fewer
- **SC-003**: Users can enter feature descriptions and have them flow to the Specify step without manual copy/paste
- **SC-004**: Users can access Settings in 2 clicks from any view in the application
- **SC-005**: Navigation pane resize and collapse operations respond within 100ms (smooth interaction)
- **SC-006**: The Describe → Specify workflow completes without errors when description text is present (validated by E2E test)

## Assumptions

- The existing project loading mechanism will continue to work; this redesign only changes the UI presentation
- The terminal integration for context injection will use the existing terminal infrastructure
- The avatar will show a placeholder icon when not logged in to GitHub
- The settings dialog remains unchanged; only its access point moves to the avatar menu
- The workflow steps order is: Describe → Specify → Plan → Tasks → Implement → Test → Push → PR → Bugfix (existing steps preserved, Describe added first)

## Clarifications

### Session 2026-01-17

- Q: What collapse/expand control should the navigation pane use? → A: Dedicated chevron button on pane's edge
- Q: How should users trigger the feature description injection into the terminal? → A: "Send to Terminal" button in the Describe step's text editor toolbar
- Q: Should the Describe step text be persisted, and if so, where? → A: Per-spec file in spec directory (e.g., `specs/002-*/description.md`)
- Q: What width constraints should the navigation pane have? → A: Min 180px, Max 400px
- Q: What should be visible when the navigation pane is collapsed? → A: Icon rail showing collapse/expand chevron, workflow step icons, and avatar icon
