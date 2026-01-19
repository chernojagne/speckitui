# IPC API Contracts: SpeckitUI Enhanced Editing and Project Management

**Feature**: 005-ui-enhancements  
**Date**: 2026-01-19

## Overview

This document defines the Tauri IPC command contracts for the UI enhancements feature.

## Commands

### write_file

Write content to a file, creating parent directories if needed.

**Command**: `write_file`

**Request**:
```typescript
interface WriteFileRequest {
  path: string;      // Absolute path to file
  content: string;   // File content to write
}
```

**Response**:
```typescript
interface WriteFileResponse {
  success: boolean;
  path: string;
  bytesWritten: number;
}
```

**Errors**:
- `PERMISSION_DENIED`: No write access to path
- `INVALID_PATH`: Path is invalid or outside allowed scope
- `IO_ERROR`: General I/O failure

---

### execute_shell_script

Execute a shell script with arguments.

**Command**: `execute_shell_script`

**Request**:
```typescript
interface ExecuteShellRequest {
  scriptPath: string;   // Relative path to script from repo root
  args: string[];       // Command line arguments
  cwd?: string;         // Working directory (defaults to repo root)
}
```

**Response**:
```typescript
interface ExecuteShellResponse {
  exitCode: number;
  stdout: string;
  stderr: string;
}
```

**Errors**:
- `SCRIPT_NOT_FOUND`: Script file doesn't exist
- `EXECUTION_FAILED`: Script failed to execute
- `TIMEOUT`: Script exceeded timeout (30s default)

---

### get_git_status

Get git status for specific files.

**Command**: `get_git_status`

**Request**:
```typescript
interface GitStatusRequest {
  repoPath: string;     // Path to git repository
  files: string[];      // Files to check (relative to repo root)
}
```

**Response**:
```typescript
interface GitStatusResponse {
  statuses: Record<string, GitFileStatus>;
}

type GitFileStatus = 'clean' | 'modified' | 'untracked' | 'staged' | 'conflict';
```

**Errors**:
- `NOT_A_REPO`: Path is not a git repository
- `GIT_NOT_FOUND`: Git executable not available

---

### create_directory

Create a directory (and parent directories).

**Command**: `create_directory`

**Request**:
```typescript
interface CreateDirectoryRequest {
  path: string;         // Absolute path to directory
}
```

**Response**:
```typescript
interface CreateDirectoryResponse {
  success: boolean;
  path: string;
}
```

**Errors**:
- `PERMISSION_DENIED`: No write access
- `ALREADY_EXISTS`: Directory already exists (not an error, returns success)
- `INVALID_PATH`: Path is invalid

---

### watch_artifact_files

Start watching artifact files for a spec. Emits events when files change.

**Command**: `watch_artifact_files`

**Request**:
```typescript
interface WatchArtifactRequest {
  specDir: string;      // Path to spec directory (e.g., specs/005-ui-enhancements)
  files: string[];      // Files to watch (e.g., ['spec.md', 'plan.md'])
}
```

**Response**:
```typescript
interface WatchArtifactResponse {
  watchId: string;      // ID to reference this watch session
}
```

---

### unwatch_artifact_files

Stop watching artifact files.

**Command**: `unwatch_artifact_files`

**Request**:
```typescript
interface UnwatchArtifactRequest {
  watchId: string;
}
```

**Response**:
```typescript
interface UnwatchArtifactResponse {
  success: boolean;
}
```

---

### update_agent_context

Append content to an AI agent context file.

**Command**: `update_agent_context`

**Request**:
```typescript
interface UpdateAgentContextRequest {
  agentType: 'copilot' | 'claude' | 'gemini';
  content: string;          // Markdown content to add
  featureName: string;      // Feature name for header
  repoPath: string;         // Path to repository root
}
```

**Response**:
```typescript
interface UpdateAgentContextResponse {
  success: boolean;
  filePath: string;         // Path to updated agent file
  created: boolean;         // True if file was created new
}
```

**Errors**:
- `PERMISSION_DENIED`: No write access
- `INVALID_AGENT`: Unknown agent type

---

## Events

### artifact-file-changed

Emitted when a watched artifact file changes.

**Event**: `artifact-file-changed`

**Payload**:
```typescript
interface ArtifactFileChangedEvent {
  watchId: string;
  file: string;           // Filename that changed (e.g., 'spec.md')
  path: string;           // Full path to file
  changeType: 'modified' | 'created' | 'deleted';
}
```

---

### git-status-changed

Emitted when git status changes for watched files.

**Event**: `git-status-changed`

**Payload**:
```typescript
interface GitStatusChangedEvent {
  repoPath: string;
  file: string;
  status: GitFileStatus;
}
```

---

## Error Handling

All commands return errors in this format:

```typescript
interface IpcError {
  code: string;           // Error code (e.g., 'PERMISSION_DENIED')
  message: string;        // Human-readable message
  details?: unknown;      // Additional error details
}
```

Frontend should catch errors and display appropriate messages using shadcn/ui Toast or AlertDialog.

## Security Considerations

- All file operations are scoped to the project directory
- Shell script execution is limited to `.specify/scripts/` directory
- No arbitrary command execution - only predefined scripts
- Git operations read-only except for file modifications
