# Data Model: Fix Terminal Issues

**Feature**: 004-fix-terminal-issues  
**Date**: January 18, 2026

## Entity Updates

### TerminalSession (Updated)

Represents a PTY session with associated metadata.

| Field | Type | Description |
|-------|------|-------------|
| id | string | UUID for the session |
| label | string | User-customizable tab label (persisted) |
| cwd | string | Current working directory |
| shell | string | Shell executable path |
| status | "running" \| "exited" | Session status |
| isActive | boolean | Whether this is the active tab |

**Changes**: Added `label` field for custom tab names (FR-016 to FR-019)

### TerminalState (Zustand Store - Updated)

| Field | Type | Description |
|-------|------|-------------|
| sessions | TerminalSession[] | All terminal sessions |
| activeSessionId | string \| null | Currently active session |
| panelHeight | number | Panel height in pixels (100-∞) |
| ~~isCollapsed~~ | ~~boolean~~ | **REMOVED** - no longer collapsible |

**Changes**: 
- Removed `isCollapsed` field (FR-004)
- Removed `toggleCollapsed` action
- `setPanelHeight` now has no maximum (FR-003)

### GitBranchInfo (New)

Represents current git branch state for status bar.

| Field | Type | Description |
|-------|------|-------------|
| branch | string \| null | Current branch name, null if not a git repo |
| isDetached | boolean | True if HEAD is detached |
| commitHash | string \| null | Short commit hash when detached |

## State Flow

### Panel Resize Flow

```
User drags divider
  → handleDragMove updates panelHeight in store
  → TerminalPanel binds height via inline style
  → TerminalInstance detects container resize
  → fitAddon.fit() called (debounced)
  → resizeTerminal IPC command sent to backend
  → PTY receives new dimensions
```

### Tab Switch Flow (Fixed)

```
User clicks tab
  → setActiveSession(sessionId) called
  → All TerminalInstance components remain mounted
  → Active terminal: display: block
  → Inactive terminals: display: none
  → NO fitAddon.fit() unless dimensions changed
  → Buffer preserved in xterm.js instance
```

### Git Branch Detection Flow

```
Project opens
  → useGitBranch hook initializes
  → Reads .git/HEAD file
  → Parses branch name or detached state
  → Sets up file watcher on .git/HEAD
  → File change detected
  → Re-reads and parses .git/HEAD
  → Updates GitBranchInfo state
  → StatusBar re-renders with new branch
```

## Persistence

### Terminal Session Labels

Store custom labels in localStorage:

```typescript
// Key: speckitui-terminal-labels
// Value: { [sessionId: string]: string }
{
  "abc-123": "Build Server",
  "def-456": "Git Operations"
}
```

**Note**: Labels are ephemeral (cleared on app restart) unless we implement session restoration. For this feature, labels persist for the current session only.

## Validation Rules

| Entity | Field | Rule |
|--------|-------|------|
| TerminalSession | label | Max 50 characters, empty reverts to default |
| TerminalState | panelHeight | Minimum 100px, no maximum |
| GitBranchInfo | branch | May contain slashes (feature/name) |
