# Research: SpeckitUI Enhanced Editing and Project Management

**Feature**: 005-ui-enhancements  
**Date**: 2026-01-19  
**Status**: Complete

## Research Tasks

### 1. Rich Text Editor for Markdown

**Decision**: Use CodeMirror 6 or a simple textarea with markdown preview toggle

**Rationale**: 
- CodeMirror 6 provides syntax highlighting, but adds complexity
- For MVP, a simple textarea with live preview (using existing react-markdown) is simpler
- shadcn/ui Textarea component with markdown preview toggle follows Simplicity First principle

**Alternatives Considered**:
- TipTap/ProseMirror: Too heavy for markdown editing
- Monaco Editor: Overkill for simple markdown, large bundle size
- ContentEditable with markdown parsing: Complex to implement correctly

**Recommendation**: Start with shadcn/ui Textarea + react-markdown preview toggle. Can upgrade to CodeMirror 6 later if needed.

### 2. Image Handling in Composer

**Decision**: Store images as base64 data URIs or reference paths in description.md

**Rationale**:
- Tauri's fs plugin can read/write files
- For pasted images: convert to base64 and embed in markdown
- For uploaded files: save to `specs/###-feature/assets/` and reference by path
- Markdown image syntax: `![alt](data:image/png;base64,...)` or `![alt](./assets/image.png)`

**Alternatives Considered**:
- External image hosting: Violates Local-First principle
- Binary blob storage: Complicates file management

### 3. Agent Context File Updates

**Decision**: Append content within clearly marked sections, similar to update-agent-context.sh

**Rationale**:
- Looking at `.specify/scripts/bash/update-agent-context.sh`, it uses marker comments
- We should use similar markers: `<!-- SPECKITUI-DESCRIBE-START -->` and `<!-- SPECKITUI-DESCRIBE-END -->`
- Content between markers can be replaced on subsequent updates
- Content outside markers (including spec-kit's own sections) is preserved

**Agent File Paths** (from update-agent-context.sh):
- Claude: `CLAUDE.md` (repo root)
- Gemini: `GEMINI.md` (repo root)
- Copilot: `.github/agents/copilot-instructions.md`

### 4. Shell Script Execution from Tauri

**Decision**: Use tauri-plugin-shell with Command::new for shell script execution

**Rationale**:
- Tauri 2.x uses tauri-plugin-shell for running external commands
- Already have the plugin installed (see Cargo.toml)
- Can capture stdout/stderr for error reporting
- Need to handle Windows (bash via Git Bash) vs Unix (native bash)

**Implementation Pattern**:
```rust
use tauri_plugin_shell::ShellExt;
app.shell().command("bash").args(["-c", script_path, ...]).spawn()
```

### 5. Git Status Tracking

**Decision**: Use `git status --porcelain` output parsing

**Rationale**:
- Already have git.rs commands in the backend
- `git status --porcelain` provides machine-parseable output
- Can check specific files: `git status --porcelain -- path/to/file`
- Status codes: `M` = modified, `A` = added, `??` = untracked

**Performance**: Run status check when file changes detected, debounce to avoid excessive calls

### 6. File Watching for Artifacts

**Decision**: Extend existing file_watcher.rs to watch spec artifact files

**Rationale**:
- Already using `notify` crate for file watching
- Need to watch: spec.md, plan.md, tasks.md, research.md, description.md, quickstart.md
- Emit events per-file so UI can update specific tabs
- Debounce rapid changes (editor autosave creates multiple writes)

### 7. New Project Creation

**Decision**: Create folder via Tauri fs plugin, show init command guidance

**Rationale**:
- tauri-plugin-dialog for folder picker
- tauri-plugin-fs for folder creation
- After creation, display init instructions: `cd <path> && npx speckit init`
- Don't run init automatically (requires npm/npx, may fail)

### 8. Unsaved Changes Warning

**Decision**: Use beforeunload event + custom navigation guard

**Rationale**:
- Browser's beforeunload handles app close
- For in-app navigation, use Zustand store to track dirty state
- Show shadcn/ui AlertDialog before navigation when dirty

## Technology Decisions Summary

| Component | Choice | Reason |
|-----------|--------|--------|
| Markdown Editor | Textarea + Preview | Simplicity, uses existing react-markdown |
| Image Storage | Base64 or local assets/ | Local-first, no external dependencies |
| Agent File Updates | Marker-based sections | Non-destructive, matches spec-kit pattern |
| Shell Execution | tauri-plugin-shell | Already installed, Tauri standard |
| Git Status | git status --porcelain | Simple, reliable, machine-parseable |
| File Watching | Extend notify watcher | Already in use, proven approach |
| Folder Creation | tauri-plugin-fs + dialog | Standard Tauri plugins |
| Navigation Guard | Zustand + AlertDialog | React/shadcn patterns |
