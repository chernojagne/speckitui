# Research: SpeckitUI Core Application

**Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)  
**Date**: January 16, 2026

---

## Technology Decisions

### 1. Application Framework: Tauri 2.x

**Decision**: Use Tauri 2.x as the desktop application framework

**Rationale**:
- Specified in clarifications as the deployment model
- Smaller bundle size than Electron (~10MB vs ~150MB+)
- Rust backend provides better performance and memory safety
- Native file system access through Tauri APIs
- Cross-platform (Windows, macOS, Linux) from single codebase

**Alternatives Considered**:
| Alternative | Why Rejected |
|-------------|--------------|
| Electron | Larger bundle size, higher memory usage, explicitly rejected in clarifications |
| Native (Swift/C#/GTK) | Would require separate codebases per platform |
| Web-only | Cannot access local file system directly, requires server |

**Version**: Tauri 2.0+ (stable, released 2024)

---

### 2. Frontend Framework: React 18 + TypeScript

**Decision**: Use React 18 with TypeScript for the frontend UI

**Rationale**:
- Strong ecosystem for component-based UI development
- TypeScript provides type safety for complex state (specs, artifacts, workflow)
- Excellent tooling (Vite, Vitest, ESLint)
- Large community, easy to find solutions and hire developers
- React 18 concurrent features help with responsive UI during file loading

**Alternatives Considered**:
| Alternative | Why Rejected |
|-------------|--------------|
| Vue 3 | Smaller ecosystem, less TypeScript integration maturity |
| Svelte | Smaller ecosystem, fewer component libraries available |
| Solid | Newer, less battle-tested for complex desktop apps |

**Key Libraries**:
- `@tauri-apps/api` v2.x - Tauri IPC and window management
- `zustand` - Lightweight state management (simpler than Redux)
- `react-markdown` + `remark-gfm` - GitHub-flavored markdown rendering
- `@tanstack/react-query` - Server state management for GitHub API

---

### 3. Terminal Emulator: xterm.js + node-pty (via Tauri)

**Decision**: Use xterm.js for terminal rendering with PTY backend in Rust

**Rationale**:
- xterm.js is the industry standard for web-based terminals (used by VS Code, Hyper)
- Full terminal emulation with ANSI support, themes, ligatures
- Rust PTY crate (`portable-pty`) provides cross-platform pseudo-terminal support
- WebSocket or IPC bridge between frontend and PTY process

**Alternatives Considered**:
| Alternative | Why Rejected |
|-------------|--------------|
| Custom terminal | Massive effort to implement terminal emulation correctly |
| React Terminal UI | Less feature-complete, missing proper ANSI support |
| External terminal | Breaks the "single environment" requirement |

**Implementation Approach**:
1. Rust backend spawns PTY process using `portable-pty` crate
2. Bidirectional communication via Tauri event system or WebSocket
3. xterm.js renders output and sends input
4. Multiple terminals tracked by session ID

---

### 4. Markdown Rendering: react-markdown + Plugins

**Decision**: Use react-markdown with remark/rehype plugins for markdown display

**Rationale**:
- Pure React implementation (no dangerouslySetInnerHTML)
- Extensible plugin system for custom checkbox handling
- GFM (GitHub Flavored Markdown) support via `remark-gfm`
- Syntax highlighting via `rehype-highlight` or `shiki`

**Alternatives Considered**:
| Alternative | Why Rejected |
|-------------|--------------|
| marked + dangerouslySetInnerHTML | Security concerns, harder to make interactive |
| MDX | Overkill for display-only use case |
| Custom parser | Unnecessary complexity |

**Custom Extensions Needed**:
- Checkbox interactivity (click to toggle, sync to file)
- Section-based progress calculation
- `[NEEDS CLARIFICATION]` marker highlighting

---

### 5. GitHub API: Octokit REST

**Decision**: Use @octokit/rest for GitHub API integration

**Rationale**:
- Official GitHub SDK, well-maintained
- Full TypeScript types included
- Built-in pagination, rate limiting, retry logic
- Supports both OAuth and PAT authentication

**Alternatives Considered**:
| Alternative | Why Rejected |
|-------------|--------------|
| GraphQL API | More complex, REST sufficient for our needs |
| Raw fetch | Would need to implement auth, pagination, error handling |

**API Endpoints Needed**:
- `GET /repos/{owner}/{repo}/pulls` - List PRs for branch
- `GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews` - PR reviews
- `GET /repos/{owner}/{repo}/pulls/{pull_number}/comments` - PR comments
- `GET /repos/{owner}/{repo}/issues` - List issues
- `GET /repos/{owner}/{repo}/issues/{issue_number}` - Issue details
- `GET /repos/{owner}/{repo}/commits/{ref}/status` - CI status

---

### 6. State Management: Zustand

**Decision**: Use Zustand for client-side state management

**Rationale**:
- Minimal boilerplate compared to Redux
- TypeScript-first design
- Works well with React 18 concurrent features
- Easy to persist to localStorage for session recovery
- Simple mental model (just functions updating state)

**Alternatives Considered**:
| Alternative | Why Rejected |
|-------------|--------------|
| Redux Toolkit | More boilerplate, heavier for this app size |
| Jotai/Recoil | Atom-based, less suitable for connected app state |
| Context API | Prop drilling issues, re-render performance concerns |

**Stores Planned**:
- `projectStore` - Current project path, spec instances list
- `workflowStore` - Selected step, artifact states, checklist data
- `settingsStore` - User preferences, GitHub auth, UI state
- `terminalStore` - Terminal sessions, active terminal ID

---

### 7. Syntax Highlighting: Shiki

**Decision**: Use Shiki for code syntax highlighting in source viewer

**Rationale**:
- Same highlighting engine as VS Code (TextMate grammars)
- Accurate highlighting for all languages
- Supports VS Code themes directly
- Works at build time or runtime

**Alternatives Considered**:
| Alternative | Why Rejected |
|-------------|--------------|
| Prism.js | Less accurate highlighting, limited language support |
| highlight.js | Older, less VS Code parity |
| CodeMirror | Full editor, overkill for read-only viewing |

---

### 8. File Watching: Tauri fs-watch + notify crate

**Decision**: Use Tauri's file system watcher for detecting artifact changes

**Rationale**:
- Built into Tauri 2.x via `tauri-plugin-fs`
- Uses `notify` crate under the hood (cross-platform)
- Debouncing and event coalescing built-in
- Avoids polling, efficient for battery life

**Use Cases**:
- Detect spec.md changes when edited externally
- Refresh file tree in Implement view
- Update checklist state if tasks.md edited outside app

---

### 9. Testing Strategy

**Decision**: Three-tier testing approach

| Layer | Tool | Purpose |
|-------|------|---------|
| Unit | Vitest | Component logic, hooks, parsers |
| Integration | Vitest + Testing Library | Component rendering, store interactions |
| E2E | Playwright | Full app flows, Tauri included |
| Rust | cargo test | Backend commands, file operations |

**Rationale**:
- Vitest is fast, Vite-native, Jest-compatible
- Playwright supports Tauri apps via webdriver
- Cargo test for Rust backend isolation

---

## Open Questions Resolved

| Question | Resolution |
|----------|------------|
| Multi-artifact display | Tabbed interface (clarified in spec) |
| Offline behavior | Disable GitHub steps with message (clarified in spec) |
| Deployment model | Tauri desktop app (clarified in spec) |
| Terminal layout | Bottom panel, resizable, collapsible (clarified in spec) |
| Implement step content | File tree with read-only source viewer (clarified in spec) |

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Tauri 2.x stability | Medium | Pin to stable release, minimal plugin use |
| PTY cross-platform | Medium | Use `portable-pty` crate, test on all platforms early |
| Large markdown files | Low | Virtual scrolling in react-markdown |
| GitHub rate limits | Low | Cache responses, respect rate limit headers |

---

## Dependencies Summary

### Rust (Cargo.toml)
```toml
[dependencies]
tauri = { version = "2.0", features = ["shell-open"] }
tauri-plugin-fs = "2.0"
tauri-plugin-shell = "2.0"
portable-pty = "0.8"
tokio = { version = "1", features = ["full"] }
serde = { version = "1", features = ["derive"] }
serde_json = "1"
```

### Frontend (package.json)
```json
{
  "dependencies": {
    "@tauri-apps/api": "^2.0.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-markdown": "^9.0.0",
    "remark-gfm": "^4.0.0",
    "rehype-raw": "^7.0.0",
    "shiki": "^1.0.0",
    "xterm": "^5.3.0",
    "xterm-addon-fit": "^0.8.0",
    "zustand": "^4.5.0",
    "@octokit/rest": "^20.0.0",
    "@tanstack/react-query": "^5.0.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "vite": "^5.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "vitest": "^1.4.0",
    "@testing-library/react": "^14.2.0",
    "@playwright/test": "^1.42.0"
  }
}
```
