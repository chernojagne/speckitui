# Feature Specification: Fix Terminal Issues

**Feature Branch**: `004-fix-terminal-issues`  
**Created**: January 18, 2026  
**Status**: Draft  
**Input**: User description: "Fix terminal issues including PTY lifecycle management, session cleanup, resize handling, and cross-platform shell detection"

## Overview

The integrated terminal in SpeckitUI has several reliability and usability issues that need to be addressed:

1. **Resize functionality broken**: The resize handle shows a pointer cursor but dragging does nothing
2. **Session state loss**: Terminal content is lost after collapse/expand, particularly for PowerShell
3. **Rendering issues**: Jittery redraws when switching tabs; arrow key navigation causes full content reload
4. **Default shell incorrect**: Windows should default to CMD, not PowerShell
5. **Missing features**: Terminal tabs cannot be renamed; no git branch status bar
6. **Panel behavior**: Terminal pane should not collapse, only resize with a minimum height
7. **PTY lifecycle**: Sessions not cleaning up properly, React StrictMode compatibility issues
8. **Cross-platform shell detection**: Git Bash path hardcoded, shell fallback not robust

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Terminal Session Reliability (Priority: P1)

A developer opens SpeckitUI, creates a new terminal session, runs CLI commands (git, npm, cargo), and then closes the terminal tab. The terminal session terminates cleanly without leaving orphaned processes or resource leaks. When they reopen a terminal, it works correctly without interference from previous sessions.

**Why this priority**: Core terminal functionality - users cannot work effectively if terminal sessions hang, leak resources, or fail to clean up properly.

**Independent Test**: Open terminal → run `echo "test"` → close tab → verify no orphaned shell process remains in Task Manager/Activity Monitor.

**Acceptance Scenarios**:

1. **Given** a terminal session is running, **When** user clicks the close button on the terminal tab, **Then** the PTY process is terminated and all resources are released within 1 second
2. **Given** multiple terminal sessions exist, **When** user closes the application, **Then** all PTY processes are terminated gracefully
3. **Given** a terminal session was closed, **When** user creates a new terminal, **Then** it operates independently without inheriting state from closed sessions

---

### User Story 2 - Cross-Platform Shell Detection (Priority: P2)

A developer on Windows wants to use Git Bash as their terminal. The application correctly detects if Git Bash is installed and offers it as an option. If Git Bash is not installed, the application gracefully falls back to PowerShell or CMD. On macOS/Linux, the application uses the user's default shell.

**Why this priority**: Users on different platforms need reliable shell detection - hardcoded paths cause failures when shells are installed in non-standard locations.

**Independent Test**: On Windows without Git Bash installed → create terminal with "bash" option → verify graceful fallback to PowerShell with user notification.

**Acceptance Scenarios**:

1. **Given** user is on Windows with Git Bash installed in a standard location, **When** they select "Bash" shell type, **Then** Git Bash opens successfully
2. **Given** user is on Windows without Git Bash, **When** they select "Bash" shell type, **Then** system falls back to PowerShell and notifies the user
3. **Given** user is on macOS/Linux, **When** they create a default terminal, **Then** system uses the shell from $SHELL environment variable
4. **Given** Git Bash is installed in a non-standard location, **When** user selects Bash, **Then** system searches common installation paths to find it

---

### User Story 3 - Terminal Resize Handling (Priority: P1)

A developer wants to resize the terminal panel by dragging the divider. Currently, the resize cursor appears but dragging has no effect. The terminal panel should resize smoothly from a minimum height (no collapse) to the available window space. Content should reflow correctly without artifacts.

**Why this priority**: The resize functionality is completely broken - this is a core usability issue that makes the terminal difficult to use.

**Independent Test**: Open terminal → drag the top divider → verify panel resizes smoothly and terminal content reflows.

**Acceptance Scenarios**:

1. **Given** terminal panel is visible, **When** user drags the resize divider upward, **Then** the panel height increases and terminal content reflows
2. **Given** terminal panel is visible, **When** user drags the resize divider downward, **Then** the panel height decreases to minimum height (not collapse)
3. **Given** a terminal with text content, **When** user completes resize drag, **Then** terminal dimensions update within 100ms and content reflows correctly
4. **Given** the application window is resized, **When** terminal panel is visible, **Then** terminal dimensions adjust proportionally

---

### User Story 4 - Terminal State Preservation (Priority: P1)

A developer has multiple terminal tabs with command history and output. When they switch between tabs or resize the panel, the terminal content should remain intact. The output buffer should not be lost, and the display should not jitter or reload.

**Why this priority**: Losing terminal state makes the terminal unusable for real work - developers rely on scrollback history.

**Independent Test**: Run several commands in terminal → switch to another tab → switch back → verify all output is preserved without jitter.

**Acceptance Scenarios**:

1. **Given** terminal has output content, **When** user switches to another terminal tab and back, **Then** all content is preserved and displayed without reload animation
2. **Given** PowerShell terminal has output, **When** panel is resized, **Then** output buffer is fully preserved
3. **Given** terminal is displaying content, **When** user navigates with arrow keys in a selection menu, **Then** only the changed lines update (no full redraw)
4. **Given** terminal tab is not active, **When** commands produce output in background, **Then** output is buffered and displayed when tab becomes active

---

### User Story 5 - Terminal Panel Behavior (Priority: P2)

The terminal panel should not be collapsible. Instead, it should resize between a minimum height and the available window space. The collapse/expand toggle should be removed.

**Why this priority**: The collapse behavior causes state loss issues; a resizable-only panel is more reliable.

**Independent Test**: Verify the collapse button is removed → resize panel to minimum → verify it stops at minimum height, not collapsed.

**Acceptance Scenarios**:

1. **Given** terminal panel is visible, **When** user looks at the panel header, **Then** there is no collapse/expand toggle button
2. **Given** terminal panel is at minimum height, **When** user tries to drag smaller, **Then** panel stops at minimum height (does not collapse)
3. **Given** terminal panel is visible, **When** application starts, **Then** panel opens at a default height (not collapsed)

---

### User Story 6 - Terminal Tab Renaming (Priority: P2)

A developer wants to rename terminal tabs to organize their workspace (e.g., "Build", "Git", "Server"). They can double-click a tab or use a context menu to rename it.

**Why this priority**: Improves usability when working with multiple terminals - helps developers identify terminals by purpose.

**Independent Test**: Double-click terminal tab → type new name → press Enter → verify tab displays new name.

**Acceptance Scenarios**:

1. **Given** a terminal tab exists, **When** user double-clicks the tab label, **Then** an inline text input appears for renaming
2. **Given** user is editing tab name, **When** they press Enter or click away, **Then** the new name is saved and displayed
3. **Given** user is editing tab name, **When** they press Escape, **Then** the edit is cancelled and original name is restored
4. **Given** user has renamed a tab, **When** application restarts, **Then** custom tab names are preserved (session persistence)

---

### User Story 7 - Git Branch Status Bar (Priority: P2)

The application should display the current git branch in a status bar at the bottom of the window. This should update automatically when the branch changes (via git checkout, git switch, or external tools).

**Why this priority**: Developers need visibility into their current branch - this is standard in development tools.

**Independent Test**: Open project → verify status bar shows current branch → run `git checkout other-branch` in terminal → verify status bar updates.

**Acceptance Scenarios**:

1. **Given** a project is open, **When** user looks at the status bar, **Then** the current git branch name is displayed
2. **Given** status bar is showing a branch, **When** user switches branches via terminal command, **Then** status bar updates within 2 seconds
3. **Given** status bar is showing a branch, **When** branch is changed by external tool, **Then** status bar updates via file watcher
4. **Given** project is not a git repository, **When** user looks at status bar, **Then** no branch indicator is shown (or shows "Not a git repo")

---

### User Story 8 - Windows Default Shell (Priority: P3)

On Windows, the default terminal shell should be CMD (cmd.exe), not PowerShell. PowerShell should still be available as an option.

**Why this priority**: CMD is more universally compatible and has better performance for simple tasks; users can choose PowerShell if needed.

**Independent Test**: On Windows → create new terminal with "default" option → verify CMD opens, not PowerShell.

**Acceptance Scenarios**:

1. **Given** user is on Windows, **When** they create a default terminal, **Then** cmd.exe is used as the shell
2. **Given** user is on Windows, **When** they open the shell selection menu, **Then** options include CMD, PowerShell, and Bash (if available)
3. **Given** user is on macOS/Linux, **When** they create a default terminal, **Then** $SHELL environment variable is used

---

### User Story 9 - Cross-Platform Shell Detection (Priority: P3)

A developer on Windows wants to use Git Bash as their terminal. The application correctly detects if Git Bash is installed and offers it as an option. If Git Bash is not installed, the application gracefully falls back to CMD. On macOS/Linux, the application uses the user's default shell.

**Why this priority**: Users on different platforms need reliable shell detection - hardcoded paths cause failures when shells are installed in non-standard locations.

**Independent Test**: On Windows without Git Bash installed → create terminal with "bash" option → verify graceful fallback to CMD with user notification.

**Acceptance Scenarios**:

1. **Given** user is on Windows with Git Bash installed in a standard location, **When** they select "Bash" shell type, **Then** Git Bash opens successfully
2. **Given** user is on Windows without Git Bash, **When** they select "Bash" shell type, **Then** system falls back to CMD and notifies the user
3. **Given** user is on macOS/Linux, **When** they create a default terminal, **Then** system uses the shell from $SHELL environment variable
4. **Given** Git Bash is installed in a non-standard location, **When** user selects Bash, **Then** system searches common installation paths to find it

---

### User Story 10 - React StrictMode Compatibility (Priority: P3)

When developing or debugging SpeckitUI in development mode (React StrictMode enabled), terminal instances do not duplicate or create phantom sessions. Each terminal tab corresponds to exactly one terminal session.

**Why this priority**: Development experience issue - developers working on SpeckitUI itself need reliable terminal behavior during debugging.

**Independent Test**: Run SpeckitUI in dev mode → create terminal → close terminal → verify no duplicate xterm instances or orphaned event listeners.

**Acceptance Scenarios**:

1. **Given** React StrictMode is enabled (dev mode), **When** user creates a terminal, **Then** exactly one terminal instance and PTY session exist
2. **Given** React StrictMode causes component remount, **When** terminal is remounted, **Then** it reconnects to existing session instead of creating a duplicate
3. **Given** terminal component unmounts, **When** it was a true unmount (not StrictMode), **Then** resources are cleaned up properly

---

### Edge Cases

- What happens when the shell executable crashes mid-session? (System should detect exit, update session status, notify user)
- What happens when network drive is disconnected while terminal CWD is on that drive? (System should handle gracefully, potentially reset CWD to home)
- What happens when user pastes extremely large text into terminal? (System should handle without UI freeze, potentially chunk input)
- What happens when terminal output is generated faster than UI can render? (System should buffer and throttle display updates)
- What happens when user tries to rename tab to empty string? (System should revert to default name or previous name)
- What happens when git HEAD is detached? (Status bar should show commit hash or "detached HEAD")
- What happens when .git directory is deleted while project is open? (Status bar should update to show no branch)

## Requirements *(mandatory)*

### Functional Requirements

#### Panel Resize (Currently Broken)

- **FR-001**: Terminal panel MUST resize when user drags the top divider
- **FR-002**: Terminal panel MUST have a minimum height (approximately 100px) that cannot be dragged below
- **FR-003**: Terminal panel MUST NOT have a maximum height - can expand to fill available space
- **FR-004**: Terminal panel MUST NOT be collapsible - the collapse toggle should be removed
- **FR-005**: Resize drag MUST update panel height in real-time during drag (not just on release)

#### Terminal State Preservation

- **FR-006**: Terminal output buffer MUST be preserved when switching between tabs
- **FR-007**: Terminal output buffer MUST be preserved when panel is resized
- **FR-008**: Terminal MUST NOT reload/redraw all content when switching to a tab (only activate)
- **FR-009**: Arrow key navigation in selection menus MUST NOT cause full terminal redraw
- **FR-010**: Terminal MUST maintain scrollback position when tab becomes active again

#### Session Lifecycle Management

- **FR-011**: System MUST terminate PTY child processes when terminal session is closed
- **FR-012**: System MUST release all file handles and readers/writers when session ends
- **FR-013**: System MUST emit terminal-exit event when PTY process terminates unexpectedly
- **FR-014**: System MUST clean up all terminal sessions when application closes
- **FR-015**: System MUST prevent orphaned PTY processes from accumulating over time

#### Terminal Tab Management

- **FR-016**: Users MUST be able to rename terminal tabs by double-clicking the tab label
- **FR-017**: Tab rename MUST save on Enter key or blur, cancel on Escape key
- **FR-018**: Empty tab names MUST revert to default name (e.g., "Terminal 1")
- **FR-019**: Custom tab names MUST persist across application restarts

#### Cross-Platform Shell Detection

- **FR-020**: On Windows, default shell MUST be cmd.exe (not PowerShell)
- **FR-021**: System MUST detect available shells on the host system dynamically
- **FR-022**: System MUST search multiple common paths for Git Bash on Windows
- **FR-023**: System MUST fall back gracefully when requested shell is unavailable
- **FR-024**: System MUST notify user when shell fallback occurs
- **FR-025**: System MUST respect $SHELL environment variable on Unix-like systems

#### Resize Event Handling

- **FR-026**: System MUST propagate resize events to PTY within 100ms of user action
- **FR-027**: System MUST debounce rapid resize events to prevent performance issues
- **FR-028**: System MUST send correct SIGWINCH signal to child processes after resize
- **FR-029**: Terminal UI MUST fit to container dimensions automatically on mount
- **FR-030**: Terminal UI MUST refit when container dimensions change

#### Git Branch Status Bar

- **FR-031**: Application MUST display current git branch in a status bar at bottom of window
- **FR-032**: Status bar branch display MUST update within 2 seconds of branch change
- **FR-033**: Status bar MUST watch .git/HEAD file for external branch changes
- **FR-034**: Status bar MUST show "detached HEAD" or commit hash when HEAD is detached
- **FR-035**: Status bar MUST hide branch indicator when project is not a git repository

#### React StrictMode Compatibility

- **FR-036**: System MUST prevent duplicate terminal instances during StrictMode remounts
- **FR-037**: System MUST maintain terminal instance registry to track active sessions
- **FR-038**: System MUST distinguish between StrictMode remount and true component unmount
- **FR-039**: System MUST reconnect to existing PTY session on component remount

### Key Entities

- **TerminalSession**: Represents a PTY session with id, shell type, current working directory, status (running/exited), custom label, and associated process handles
- **TerminalInstance**: Frontend representation of a terminal tab with xterm.js instance, fit addon, output buffer, and event listener cleanup functions
- **ShellConfig**: Configuration for available shells including path, display name, icon, and platform availability
- **GitBranchInfo**: Current branch name, detached state, and commit hash for status bar display

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Terminal panel resize works - dragging divider changes panel height smoothly
- **SC-002**: Zero content loss when switching terminal tabs 10 times consecutively
- **SC-003**: Arrow key navigation in terminal menus does not cause visible full-screen redraw
- **SC-004**: Zero orphaned PTY processes after closing 10 terminal sessions consecutively
- **SC-005**: Terminal resize completes within 100ms of drag end (measured visually - no visible lag)
- **SC-006**: Shell detection successfully finds Git Bash on Windows in 95% of standard installations
- **SC-007**: Zero duplicate terminal instances created during React StrictMode development
- **SC-008**: Application memory usage increases by less than 5MB after opening and closing 20 terminal sessions
- **SC-009**: Git branch status bar updates within 2 seconds of `git checkout` command completion
- **SC-010**: On Windows, new default terminal opens CMD (verified by running `echo %COMSPEC%`)

## Assumptions

1. **Git Bash Installation Paths**: Assumed common paths are `C:\Program Files\Git\bin\bash.exe` and `C:\Program Files (x86)\Git\bin\bash.exe`. Users with custom installations may need to configure the path manually.
2. **Terminal Buffer Size**: xterm.js default scrollback buffer (1000 lines) is sufficient for most use cases.
3. **Shell Environment**: User's shell properly handles TERM=xterm-256color environment variable.
4. **React Version**: Application uses React 18+ with StrictMode behavior (double-mount in development).
5. **Git Installation**: Git is installed and accessible from PATH for branch status detection.
6. **File Watcher**: System supports file watching on .git/HEAD for branch change detection.
