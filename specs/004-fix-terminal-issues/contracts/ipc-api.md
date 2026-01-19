# IPC API Contracts: Fix Terminal Issues

**Feature**: 004-fix-terminal-issues  
**Date**: January 18, 2026

## Updated Commands

### create_terminal (Updated)

Creates a new terminal session with shell detection.

**Request**:
```typescript
{
  cwd?: string;       // Working directory (default: project root)
  shell?: string;     // Shell type: "cmd" | "powershell" | "bash" | "default"
}
```

**Response**:
```typescript
{
  sessionId: string;
  shell: string;      // Actual shell used (may differ from requested)
  cwd: string;
  status: "running";
  shellFallback?: string;  // If fallback occurred, original requested shell
}
```

**Behavior Changes**:
- On Windows, `"default"` → `cmd.exe` (was `powershell.exe`)
- If `"bash"` requested but not found, falls back to `cmd.exe` and includes `shellFallback`
- Searches multiple paths for Git Bash before falling back

**Error Codes**:
| Code | Message |
|------|---------|
| `shell_not_found` | "Requested shell not found, using fallback" (warning, not error) |
| `pty_failed` | "Failed to open PTY: {details}" |
| `spawn_failed` | "Failed to spawn shell: {details}" |

---

### detect_available_shells (New)

Returns list of available shells on the system.

**Request**: None

**Response**:
```typescript
{
  shells: Array<{
    id: string;          // "cmd" | "powershell" | "bash"
    name: string;        // Display name: "Command Prompt", "PowerShell", "Git Bash"
    path: string;        // Full path to executable
    available: boolean;  // Whether shell exists at this path
  }>;
  defaultShell: string;  // ID of recommended default shell
}
```

**Platform Behavior**:
- Windows: Returns cmd, powershell, bash (if detected)
- macOS/Linux: Returns detected shells from /etc/shells and $SHELL

---

### get_git_branch (New)

Gets current git branch for the project.

**Request**:
```typescript
{
  projectPath: string;  // Path to project root
}
```

**Response**:
```typescript
{
  branch: string | null;   // Branch name, null if not a git repo
  isDetached: boolean;     // True if HEAD is detached
  commitHash: string | null; // Short hash when detached
}
```

**Error Codes**:
| Code | Message |
|------|---------|
| `not_git_repo` | "Not a git repository" (returns null branch, not error) |
| `git_error` | "Failed to read git state: {details}" |

---

## Updated Events

### terminal-output-{sessionId}

No changes to payload.

### terminal-exit-{sessionId}

No changes to payload.

### git-branch-changed (New)

Emitted when .git/HEAD file changes.

**Payload**:
```typescript
{
  projectPath: string;
  branch: string | null;
  isDetached: boolean;
  commitHash: string | null;
}
```

---

## Frontend API Changes

### useTerminal Hook (Updated)

```typescript
interface UseTerminalReturn {
  // ... existing fields ...
  
  // Updated
  createSession: (shell?: ShellType, label?: string) => Promise<{
    sessionId: string | null;
    shellFallback?: string;  // Added: if fallback occurred
  }>;
}

type ShellType = 'cmd' | 'powershell' | 'bash' | 'default';
```

---

### useGitBranch Hook (New)

```typescript
interface UseGitBranchReturn {
  branch: string | null;
  isDetached: boolean;
  commitHash: string | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

function useGitBranch(): UseGitBranchReturn;
```

---

### terminalStore (Updated)

```typescript
interface TerminalState {
  sessions: TerminalSession[];
  activeSessionId: string | null;
  panelHeight: number;
  // REMOVED: isCollapsed
  
  // Actions
  addSession: (session: TerminalSession) => void;
  removeSession: (sessionId: string) => void;
  setActiveSession: (sessionId: string | null) => void;
  updateSession: (sessionId: string, updates: Partial<TerminalSession>) => void;
  renameSession: (sessionId: string, label: string) => void;  // NEW
  setPanelHeight: (height: number) => void;  // Updated: no max
  // REMOVED: setCollapsed, toggleCollapsed
}
```
