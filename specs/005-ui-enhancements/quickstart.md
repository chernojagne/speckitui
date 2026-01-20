# Quickstart: SpeckitUI Enhanced Editing and Project Management

**Feature**: 005-ui-enhancements  
**Date**: 2026-01-19

## Prerequisites

- Node.js 18+ and npm
- Rust 1.77+ with cargo
- Git
- Tauri CLI: `npm install -g @tauri-apps/cli`

## Development Setup

```bash
# Clone and enter repository
cd /c/repos/speckitui

# Ensure on feature branch
git checkout 005-ui-enhancements

# Install frontend dependencies
npm install

# Start development server
npm run tauri dev
```

## Implementation Order

### Phase 1: Core Infrastructure

1. **Rust Commands** (src-tauri/src/commands/)
   - `write_file.rs` - File writing with safety checks
   - `shell_exec.rs` - Shell script execution
   - Add `get_git_status` to `git.rs`
   - Extend `file_watcher.rs` for artifact watching

2. **Frontend Services** (src/services/)
   - Add new commands to `tauriCommands.ts`

### Phase 2: State Management

1. **Stores** (src/stores/)
   - Create `editorStore.ts` for unsaved changes
   - Create `artifactStore.ts` for artifact states

2. **Hooks** (src/hooks/)
   - Create `useGitStatus.ts`
   - Create `useMarkdownEditor.ts`
   - Extend `useFileWatcher.ts`

### Phase 3: UI Components

1. **Shared Components** (src/components/shared/)
   - `MarkdownEditor.tsx` - Textarea + preview toggle
   - `RichComposer.tsx` - Rich content input
   - `AgentSelector.tsx` - Agent selection dialog

2. **Workflow Views** (src/components/workflow/)
   - Add edit mode to all view components
   - Implement DescribeView with RichComposer

3. **Layout Updates** (src/components/layout/)
   - Add Constitution to NavPane
   - Add New Project to ProjectHeader

### Phase 4: Integration

1. Wire up file watching to artifact tabs
2. Add git status indicators to tabs
3. Implement unsaved changes warnings
4. Test end-to-end workflows

## Key Files to Modify

### Backend (Rust)

| File | Changes |
|------|---------|
| `src-tauri/src/commands/mod.rs` | Register new commands |
| `src-tauri/src/lib.rs` | Add commands to invoke handler |
| `src-tauri/src/commands/git.rs` | Add `get_git_status` command |
| `src-tauri/src/services/file_watcher.rs` | Extend for artifact watching |

### Frontend (React/TypeScript)

| File | Changes |
|------|---------|
| `src/services/tauriCommands.ts` | Add new command wrappers |
| `src/components/layout/NavPane.tsx` | Add Constitution nav item |
| `src/components/settings/ConstitutionView.tsx` | Make editable |
| `src/components/workflow/DescribeView.tsx` | Add RichComposer |
| `src/components/workflow/*View.tsx` | Add edit mode to all views |

## Testing Commands

```bash
# Run frontend tests
npm test

# Run Rust tests
cd src-tauri && cargo test

# Run E2E tests
npm run test:e2e
```

## Common Issues

### Shell script execution fails on Windows

Ensure Git Bash is installed and accessible. The script executor looks for bash at:
- `C:\Program Files\Git\bin\bash.exe`
- Or via PATH

### File watcher not detecting changes

Check that notify crate events are being emitted. Enable debug logging:
```bash
RUST_LOG=debug npm run tauri dev
```

### Agent file not created

Ensure the target directory exists (e.g., `.github/agents/` for Copilot).
The command should create it if missing.

## Architecture Notes

### Markdown Editor Pattern

All markdown views use the same pattern:
1. Load content from file via Tauri command
2. Display in read mode with react-markdown
3. Toggle to edit mode shows textarea
4. Save writes back via write_file command
5. File watcher updates if external changes

### Agent Context Update Pattern

1. Read existing agent file (or use template if missing)
2. Find SPECKITUI markers
3. Replace content between markers (or append if no markers)
4. Write updated file
5. Preserve all content outside markers
