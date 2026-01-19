# Quickstart: Fix Terminal Issues

**Feature**: 004-fix-terminal-issues  
**Date**: January 18, 2026  
**Purpose**: Verify core fixes work before full implementation

## Prerequisites

```bash
# Ensure on feature branch
git checkout 004-fix-terminal-issues

# Install dependencies
npm install
cd src-tauri && cargo build && cd ..
```

## Quick Validation Tests

### Test 1: Panel Resize Works

**Goal**: Verify the broken resize is fixed.

```bash
npm run tauri dev
```

1. Open a terminal (click + button)
2. Hover over the top edge of the terminal panel → should see resize cursor
3. Drag upward → panel should increase in height
4. Drag downward → panel should decrease but stop at minimum (~100px)
5. ✅ **PASS** if panel resizes smoothly without collapse

### Test 2: Tab Switch Preserves Content

**Goal**: Verify terminal content is not lost on tab switch.

1. In terminal 1, run: `echo "Terminal 1 Content"`
2. Create a new terminal (click +)
3. In terminal 2, run: `echo "Terminal 2 Content"`
4. Click on terminal 1 tab
5. ✅ **PASS** if "Terminal 1 Content" is still visible without jitter

### Test 3: No Jitter on Arrow Keys

**Goal**: Verify selection menus don't cause full redraw.

1. In terminal, run a command that shows a selection menu:
   - Windows: `choice /c YN /m "Test"`
   - Or use any CLI tool with arrow-key navigation
2. Press Up/Down arrow keys
3. ✅ **PASS** if terminal doesn't visibly reload/scroll on each keypress

### Test 4: Windows Default Shell is CMD

**Goal**: Verify CMD is default instead of PowerShell.

1. Create new terminal with default shell option
2. Run: `echo %COMSPEC%`
3. ✅ **PASS** if output shows `C:\Windows\system32\cmd.exe`

### Test 5: Tab Rename

**Goal**: Verify tab rename works.

1. Double-click on terminal tab label
2. Type "Build Server"
3. Press Enter
4. ✅ **PASS** if tab now shows "Build Server"

### Test 6: Git Branch Status Bar

**Goal**: Verify status bar shows current branch.

1. Look at bottom of application window
2. Should see current git branch (e.g., "004-fix-terminal-issues")
3. In terminal, run: `git checkout main`
4. ✅ **PASS** if status bar updates to show "main" within 2 seconds

## Smoke Test Commands

```bash
# Run unit tests
npm run test

# Run Rust tests
cd src-tauri && cargo test && cd ..

# Build for production (should succeed)
npm run tauri build
```

## Common Issues

| Issue | Solution |
|-------|----------|
| Resize still not working | Check if `h-full` class was removed from panel |
| Content still lost | Verify terminals are not being conditionally rendered |
| Branch not updating | Check file watcher is monitoring .git/HEAD |
| Git Bash not found | Verify paths in shell detection match user's install |

## Next Steps

After quickstart validation passes:
1. Run `/speckit.tasks` to generate implementation tasks
2. Implement tasks in priority order (P1 first)
3. Run full test suite before PR
