# IPC API Contract: SpeckitUI Tauri Commands

**Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)  
**Date**: January 16, 2026

---

## Overview

SpeckitUI uses Tauri's IPC (Inter-Process Communication) system for frontend-to-backend communication. The frontend invokes Tauri commands, which are Rust functions exposed via the `#[tauri::command]` macro.

All commands follow these conventions:
- **Naming**: `snake_case` for Rust, `camelCase` exposed to JS via `invoke()`
- **Errors**: Return `Result<T, String>` where error string is user-displayable
- **Async**: All file/network operations are async

---

## Project Commands

### `open_project`

Opens a project folder and scans for spec instances.

**Request**:
```typescript
invoke('open_project', { path: string })
```

**Response**:
```typescript
interface OpenProjectResponse {
  project: Project;
  specInstances: SpecInstance[];
}
```

**Errors**:
| Code | Message |
|------|---------|
| `path_not_found` | "The specified path does not exist" |
| `not_directory` | "The path is not a directory" |
| `no_specify_dir` | "No .specify directory found. Is this a spec-kit project?" |

---

### `get_recent_projects`

Returns list of recently opened projects.

**Request**:
```typescript
invoke('get_recent_projects')
```

**Response**:
```typescript
interface RecentProject {
  path: string;
  name: string;
  lastOpened: string; // ISO date
}[]
```

---

### `get_spec_instances`

Lists all spec instances in the current project.

**Request**:
```typescript
invoke('get_spec_instances', { projectPath: string })
```

**Response**:
```typescript
SpecInstance[]
```

---

## Artifact Commands

### `read_artifact`

Reads a markdown artifact file.

**Request**:
```typescript
invoke('read_artifact', { 
  specPath: string,     // Absolute path to spec directory
  fileName: string      // e.g., "spec.md", "plan.md"
})
```

**Response**:
```typescript
interface ArtifactContent {
  content: string;
  lastModified: string; // ISO date
  size: number;         // bytes
}
```

**Errors**:
| Code | Message |
|------|---------|
| `file_not_found` | "Artifact file not found: {fileName}" |
| `read_error` | "Failed to read file: {details}" |

---

### `write_artifact`

Writes content to an artifact file.

**Request**:
```typescript
invoke('write_artifact', {
  specPath: string,
  fileName: string,
  content: string
})
```

**Response**:
```typescript
{ success: true, lastModified: string }
```

**Errors**:
| Code | Message |
|------|---------|
| `write_error` | "Failed to write file: {details}" |
| `permission_denied` | "Permission denied writing to file" |

---

### `update_checkbox`

Updates a single checkbox in a markdown file (atomic operation).

**Request**:
```typescript
invoke('update_checkbox', {
  filePath: string,      // Absolute path to markdown file
  lineNumber: number,    // 1-indexed line number
  checked: boolean       // New checked state
})
```

**Response**:
```typescript
{ success: true, newContent: string }
```

**Errors**:
| Code | Message |
|------|---------|
| `line_not_found` | "Line {lineNumber} not found in file" |
| `not_checkbox` | "Line {lineNumber} is not a checkbox item" |
| `concurrent_edit` | "File was modified externally. Please refresh." |

---

### `list_directory`

Lists files in a directory (for file tree in Implement step).

**Request**:
```typescript
invoke('list_directory', {
  path: string,
  recursive: boolean,
  includeHidden: boolean
})
```

**Response**:
```typescript
interface FileEntry {
  name: string;
  path: string;
  isDirectory: boolean;
  size?: number;
  lastModified?: string;
  children?: FileEntry[]; // if recursive and isDirectory
}[]
```

---

### `read_source_file`

Reads a source code file for the viewer.

**Request**:
```typescript
invoke('read_source_file', { path: string })
```

**Response**:
```typescript
interface SourceFileContent {
  content: string;
  language: string;      // Detected from extension
  lineCount: number;
  size: number;
}
```

---

### `get_changed_files`

Returns files created/modified for the current spec (based on git diff or file tracking).

**Request**:
```typescript
invoke('get_changed_files', {
  specPath: string,      // Absolute path to spec directory
  projectPath: string    // Absolute path to project root
})
```

**Response**:
```typescript
interface ChangedFile {
  path: string;          // Relative to project root
  status: 'added' | 'modified' | 'deleted';
  staged: boolean;
}

interface ChangedFilesResponse {
  files: ChangedFile[];
  branch: string;
}
```

**Errors**:
| Code | Message |
|------|--------|
| `not_git_repo` | "Project is not a git repository" |
| `git_error` | "Failed to get git status: {details}" |

---

### `get_git_status`

Returns current git status for the project (branch, staged, unstaged changes).

**Request**:
```typescript
invoke('get_git_status', { projectPath: string })
```

**Response**:
```typescript
interface GitStatus {
  branch: string;
  isClean: boolean;
  ahead: number;         // Commits ahead of remote
  behind: number;        // Commits behind remote
  staged: string[];      // Staged file paths
  unstaged: string[];    // Modified but unstaged file paths
  untracked: string[];   // Untracked file paths
}
```

**Errors**:
| Code | Message |
|------|--------|
| `not_git_repo` | "Project is not a git repository" |
| `git_error` | "Failed to get git status: {details}" |

---

## Terminal Commands

### `create_terminal`

Spawns a new PTY terminal session.

**Request**:
```typescript
invoke('create_terminal', {
  cwd?: string,          // Working directory (defaults to project root)
  shell?: string         // Shell to use (defaults to system default)
})
```

**Response**:
```typescript
interface TerminalCreated {
  sessionId: string;
  shell: string;
  cwd: string;
}
```

---

### `write_terminal`

Sends input to a terminal session.

**Request**:
```typescript
invoke('write_terminal', {
  sessionId: string,
  data: string           // Bytes as string (may include escape sequences)
})
```

**Response**:
```typescript
{ success: true }
```

---

### `resize_terminal`

Resizes a terminal session.

**Request**:
```typescript
invoke('resize_terminal', {
  sessionId: string,
  cols: number,
  rows: number
})
```

**Response**:
```typescript
{ success: true }
```

---

### `close_terminal`

Closes a terminal session.

**Request**:
```typescript
invoke('close_terminal', { sessionId: string })
```

**Response**:
```typescript
{ success: true }
```

---

## GitHub Commands

### `check_github_auth`

Checks if GitHub authentication is configured.

**Request**:
```typescript
invoke('check_github_auth')
```

**Response**:
```typescript
interface GitHubAuthStatus {
  isAuthenticated: boolean;
  user?: {
    login: string;
    name?: string;
    avatarUrl: string;
  };
  scopes?: string[];
}
```

---

### `github_oauth_start`

Initiates GitHub OAuth flow.

**Request**:
```typescript
invoke('github_oauth_start')
```

**Response**:
```typescript
{ authUrl: string }  // URL to open in browser
```

---

### `github_oauth_complete`

Completes OAuth flow with callback code.

**Request**:
```typescript
invoke('github_oauth_complete', { code: string })
```

**Response**:
```typescript
GitHubAuthStatus
```

---

### `get_pull_requests`

Gets pull requests for current branch.

**Request**:
```typescript
invoke('get_pull_requests', {
  owner: string,
  repo: string,
  branch?: string        // Defaults to current branch
})
```

**Response**:
```typescript
PRFeedback[]
```

**Errors**:
| Code | Message |
|------|---------|
| `not_authenticated` | "GitHub authentication required" |
| `rate_limited` | "GitHub API rate limit exceeded. Try again in {minutes} minutes." |
| `network_error` | "Unable to connect to GitHub. Check your internet connection." |

---

### `get_pr_comments`

Gets comments for a specific PR.

**Request**:
```typescript
invoke('get_pr_comments', {
  owner: string,
  repo: string,
  prNumber: number
})
```

**Response**:
```typescript
PRComment[]
```

---

### `get_issues`

Gets issues for the repository.

**Request**:
```typescript
invoke('get_issues', {
  owner: string,
  repo: string,
  state?: 'open' | 'closed' | 'all',
  labels?: string[]
})
```

**Response**:
```typescript
GitHubIssue[]
```

---

### `get_issue_detail`

Gets detailed information for a single issue.

**Request**:
```typescript
invoke('get_issue_detail', {
  owner: string,
  repo: string,
  issueNumber: number
})
```

**Response**:
```typescript
interface IssueDetail extends GitHubIssue {
  comments: IssueComment[];
}
```

---

## Settings Commands

### `get_settings`

Gets application settings.

**Request**:
```typescript
invoke('get_settings')
```

**Response**:
```typescript
AppSettings
```

---

### `save_settings`

Saves application settings.

**Request**:
```typescript
invoke('save_settings', { settings: Partial<AppSettings> })
```

**Response**:
```typescript
{ success: true }
```

---

## Git Commands

### `get_git_status`

Gets git status for the project.

**Request**:
```typescript
invoke('get_git_status', { projectPath: string })
```

**Response**:
```typescript
interface GitStatus {
  branch: string;
  isClean: boolean;
  staged: string[];
  unstaged: string[];
  untracked: string[];
  ahead: number;
  behind: number;
  remote?: string;
}
```

---

### `get_changed_files`

Gets files changed for a spec (compared to base branch).

**Request**:
```typescript
invoke('get_changed_files', {
  projectPath: string,
  baseBranch?: string    // Defaults to main/master
})
```

**Response**:
```typescript
interface ChangedFile {
  path: string;
  status: 'added' | 'modified' | 'deleted' | 'renamed';
  additions: number;
  deletions: number;
}[]
```

---

## Events (Backend → Frontend)

Tauri events emitted from backend to frontend via `listen()`.

### `terminal-output`

Terminal output data.

```typescript
interface TerminalOutputEvent {
  sessionId: string;
  data: string;          // Output bytes as string
}
```

### `terminal-exit`

Terminal process exited.

```typescript
interface TerminalExitEvent {
  sessionId: string;
  exitCode: number;
}
```

### `file-changed`

Watched file was modified externally.

```typescript
interface FileChangedEvent {
  path: string;
  kind: 'create' | 'modify' | 'delete';
}
```

### `network-status`

Network connectivity changed.

```typescript
interface NetworkStatusEvent {
  isOnline: boolean;
}
```
