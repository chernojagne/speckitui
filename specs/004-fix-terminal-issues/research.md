# Research: Fix Terminal Issues

**Feature**: 004-fix-terminal-issues  
**Date**: January 18, 2026  
**Purpose**: Resolve all NEEDS CLARIFICATION and research best practices

## Research Tasks

### 1. Panel Resize Not Working - Root Cause Analysis

**Question**: Why does the resize divider show cursor but not actually resize?

**Investigation**:
- Current implementation in `TerminalPanel.tsx` has `handleDragStart` that adds mousemove/mouseup listeners
- The `setPanelHeight` is called correctly in the handler
- **Root Cause**: The panel height is stored in zustand but the actual panel doesn't have its height bound to CSS correctly
- The panel uses `h-full` class which overrides the dynamic height from store

**Decision**: Bind panel height to inline style, remove `h-full` class, use CSS custom property or direct style binding

**Rationale**: The state management is correct, only the CSS binding is broken

### 2. Terminal State Loss on Tab Switch

**Question**: Why is terminal content lost when switching tabs or resizing?

**Investigation**:
- xterm.js Terminal instances are stored in a global Map (`terminalInstances`)
- When tab becomes inactive, the terminal DOM is hidden with CSS `display: none` (via `isActive` prop)
- **Root Cause**: The current implementation may be unmounting/remounting terminals instead of hiding them
- PowerShell specifically loses buffer because it's more sensitive to terminal size changes

**Decision**: 
1. Keep all terminal instances mounted, use CSS visibility/display to hide inactive ones
2. Preserve xterm.js buffer by not disposing the terminal on tab switch
3. Use `display: none` approach rather than conditional rendering

**Rationale**: xterm.js maintains its own buffer; we should not unmount the component

### 3. Jittery Redraw on Tab Switch / Arrow Keys

**Question**: Why does the terminal jitter when switching tabs or using arrow keys?

**Investigation**:
- Likely caused by `fitAddon.fit()` being called on every activation
- Arrow keys triggering React re-renders that cascade to terminal
- The terminal receives new data events that cause scroll-to-bottom behavior

**Decision**:
1. Only call `fitAddon.fit()` when actual dimensions change
2. Debounce fit calls
3. Use `useRef` for callbacks to avoid terminal re-initialization
4. Check if terminal dimensions actually changed before calling resize

**Rationale**: xterm.js fit addon should only be called when container size actually changes

### 4. Windows Default Shell

**Question**: What should be the default shell order on Windows?

**Decision**:
1. Default on Windows: `cmd.exe` (universally available, fast startup)
2. Options: CMD, PowerShell, Git Bash (if detected)
3. Default on macOS/Linux: `$SHELL` environment variable

**Rationale**: CMD is more universally compatible; PowerShell has slower startup and different escaping rules

### 5. Git Bash Detection Paths

**Question**: What paths should we search for Git Bash on Windows?

**Decision**: Search in order:
1. `C:\Program Files\Git\bin\bash.exe`
2. `C:\Program Files (x86)\Git\bin\bash.exe`
3. `%LOCALAPPDATA%\Programs\Git\bin\bash.exe`
4. `%USERPROFILE%\scoop\apps\git\current\bin\bash.exe`
5. Check `PATH` for `bash.exe`

**Rationale**: Covers official installer, 32-bit fallback, user install, and Scoop package manager

### 6. Git Branch Status Bar Implementation

**Question**: How to detect and watch git branch changes?

**Decision**:
1. Read `.git/HEAD` file to get current branch
2. Parse format: `ref: refs/heads/branch-name` or direct commit hash (detached)
3. Use existing file watcher service to monitor `.git/HEAD` for changes
4. Add Rust command `get_git_branch` that runs `git rev-parse --abbrev-ref HEAD`
5. Fallback to file parsing if git command fails

**Rationale**: File watching is more responsive than polling; git command is authoritative

### 7. React StrictMode Compatibility

**Question**: How to prevent duplicate terminals in StrictMode?

**Current Implementation**: Already uses a global `terminalInstances` Map and delayed cleanup

**Decision**: 
1. Keep global Map pattern
2. Use `mountedRef` to track if component is truly unmounted
3. 100ms delay before cleanup allows StrictMode remount to claim terminal
4. On remount, reattach existing terminal to new container

**Rationale**: Current pattern is correct; may need refinement for edge cases

### 8. Tab Rename Implementation

**Question**: Best UX pattern for inline tab renaming?

**Decision**:
1. Double-click tab label to enter edit mode
2. Show inline input field (shadcn/ui Input component)
3. Enter or blur saves, Escape cancels
4. Store custom label in `TerminalSession.label` field
5. Persist to localStorage or settings store

**Rationale**: Follows common UI patterns (VS Code, browser tabs)

## Summary of Decisions

| Issue | Solution |
|-------|----------|
| Panel resize broken | Bind height to inline style, remove conflicting CSS |
| State loss on tab switch | Keep terminals mounted, use CSS visibility |
| Jittery redraws | Debounce fit(), only resize when dimensions change |
| Windows default shell | CMD instead of PowerShell |
| Git Bash detection | Search multiple paths, check PATH |
| Git branch status | File watch .git/HEAD + git command |
| StrictMode compatibility | Keep existing pattern, refine edge cases |
| Tab rename | Double-click inline edit with shadcn/ui Input |
