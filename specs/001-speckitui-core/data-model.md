# Data Model: SpeckitUI Core Application

**Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)  
**Date**: January 16, 2026

---

## Overview

SpeckitUI operates on local file system data with ephemeral runtime state. There is no database—all persistent data lives in the project's `.specify/` and `specs/` directories as markdown files. Application preferences are stored in the OS-standard config location via Tauri.

---

## Core Entities

### Project

Represents an opened repository/folder containing spec-kit structure.

```typescript
interface Project {
  /** Absolute path to project root */
  path: string;
  
  /** Project name (derived from folder name) */
  name: string;
  
  /** Whether .specify/ directory exists */
  hasSpecifyDir: boolean;
  
  /** Whether specs/ directory exists */
  hasSpecsDir: boolean;
  
  /** Git remote URL if available */
  gitRemote?: string;
  
  /** Current git branch */
  gitBranch?: string;
  
  /** List of spec instances found */
  specInstances: SpecInstance[];
}
```

**Source**: File system scan on project open  
**Persistence**: Path stored in localStorage for "recent projects" and session restore

---

### SpecInstance

A single feature specification within a project.

```typescript
interface SpecInstance {
  /** Unique ID derived from directory name (e.g., "001-speckitui-core") */
  id: string;
  
  /** Numeric prefix (e.g., 1) */
  number: number;
  
  /** Short name (e.g., "speckitui-core") */
  shortName: string;
  
  /** Display name (e.g., "SpeckitUI Core") derived from spec.md title */
  displayName: string;
  
  /** Absolute path to spec directory */
  path: string;
  
  /** Available artifacts in this spec */
  artifacts: ArtifactManifest;
  
  /** Associated git branch name (matches id pattern) */
  branch?: string;
}
```

**Source**: Directory listing of `specs/` + file existence checks  
**Relationships**: 
- Belongs to one Project
- Contains multiple Artifacts

---

### ArtifactManifest

Tracks which artifacts exist for a spec instance.

```typescript
interface ArtifactManifest {
  /** spec.md exists */
  hasSpec: boolean;
  
  /** plan.md exists */
  hasPlan: boolean;
  
  /** research.md exists */
  hasResearch: boolean;
  
  /** data-model.md exists */
  hasDataModel: boolean;
  
  /** quickstart.md exists */
  hasQuickstart: boolean;
  
  /** tasks.md exists */
  hasTasks: boolean;
  
  /** Files in contracts/ directory */
  contractFiles: string[];
  
  /** Files in checklists/ directory */
  checklistFiles: string[];
}
```

**Source**: File system check on spec instance load  
**Used By**: Navigation indicators, tab population

---

### Artifact

Represents a loaded markdown file with parsed content.

```typescript
interface Artifact {
  /** File path relative to spec directory */
  relativePath: string;
  
  /** Absolute file path */
  absolutePath: string;
  
  /** File name (e.g., "spec.md") */
  fileName: string;
  
  /** Raw markdown content */
  rawContent: string;
  
  /** Last modified timestamp */
  lastModified: Date;
  
  /** Parsed checklist items (if any) */
  checklists: ChecklistSection[];
  
  /** Loading/error state */
  status: 'loading' | 'loaded' | 'error';
  
  /** Error message if status is 'error' */
  error?: string;
}
```

**Source**: File read via Tauri fs API  
**Caching**: Cached in memory, invalidated on file watch events

---

### ChecklistSection

A group of checklist items within a markdown file.

```typescript
interface ChecklistSection {
  /** Section heading (e.g., "## Phase 1: Foundational") */
  heading: string;
  
  /** Nesting level (h2 = 2, h3 = 3, etc.) */
  level: number;
  
  /** Line number where section starts */
  startLine: number;
  
  /** Line number where section ends */
  endLine: number;
  
  /** Checklist items in this section */
  items: ChecklistItem[];
  
  /** Computed: items checked / total items */
  completionRatio: number;
}
```

---

### ChecklistItem

A single checkbox item parsed from markdown.

```typescript
interface ChecklistItem {
  /** Unique ID within the file (line number based) */
  id: string;
  
  /** Line number in source file (1-indexed) */
  lineNumber: number;
  
  /** Full line text including checkbox */
  rawText: string;
  
  /** Display text (without checkbox markdown) */
  displayText: string;
  
  /** Whether checked */
  checked: boolean;
  
  /** Indentation level (for nested items) */
  indent: number;
  
  /** Task metadata extracted from text */
  metadata?: TaskMetadata;
}

interface TaskMetadata {
  /** Priority marker [P1], [P2], etc. */
  priority?: string;
  
  /** Parallelizable marker [P] */
  isParallel?: boolean;
  
  /** File reference if present */
  file?: string;
  
  /** Story reference (US1, US2, etc.) */
  story?: string;
}
```

**Source**: Regex parsing of markdown content  
**Persistence**: Changes written back to source file via Tauri fs API

---

### WorkflowStep

Definition of a workflow step in the navigation.

```typescript
interface WorkflowStep {
  /** Unique step ID */
  id: WorkflowStepId;
  
  /** Display label */
  label: string;
  
  /** Icon identifier */
  icon: string;
  
  /** Artifact files to display for this step */
  artifactPatterns: string[];
  
  /** Whether step requires GitHub connection */
  requiresGitHub: boolean;
  
  /** Whether step has content (derived from artifacts) */
  hasContent: boolean;
}

type WorkflowStepId = 
  | 'specify'
  | 'plan'
  | 'tasks'
  | 'implement'
  | 'test'
  | 'push'
  | 'pr'
  | 'bugfix';
```

**Source**: Static configuration  
**Artifact Mapping**:

| Step | Artifacts |
|------|-----------|
| specify | spec.md, checklists/requirements.md |
| plan | plan.md, research.md, data-model.md, quickstart.md, contracts/* |
| tasks | tasks.md |
| implement | (file tree from git/source) |
| test | test-results.md, coverage/* |
| push | (git status, no file) |
| pr | (GitHub API data) |
| bugfix | (GitHub issues API data) |

---

### TerminalSession

An active terminal process.

```typescript
interface TerminalSession {
  /** Unique session ID */
  id: string;
  
  /** Display label (e.g., "Terminal 1", "bash") */
  label: string;
  
  /** Current working directory */
  cwd: string;
  
  /** Shell type (bash, zsh, powershell, cmd) */
  shell: string;
  
  /** Process running state */
  status: 'running' | 'exited';
  
  /** Exit code if exited */
  exitCode?: number;
  
  /** Whether this is the active/focused terminal */
  isActive: boolean;
}
```

**Source**: PTY spawn via Tauri command  
**Lifecycle**: Created on user request, destroyed on close or process exit

---

### GitHubConnection

GitHub authentication and connection state.

```typescript
interface GitHubConnection {
  /** Whether authenticated */
  isAuthenticated: boolean;
  
  /** Whether network is available */
  isOnline: boolean;
  
  /** Authenticated user info */
  user?: {
    login: string;
    avatarUrl: string;
  };
  
  /** Repository owner (derived from git remote) */
  repoOwner?: string;
  
  /** Repository name (derived from git remote) */
  repoName?: string;
  
  /** Last sync timestamp */
  lastSync?: Date;
}
```

**Source**: Octokit auth check + network status  
**Persistence**: Token stored in OS keychain via Tauri plugin

---

### PRFeedback

Pull request data from GitHub.

```typescript
interface PRFeedback {
  /** PR number */
  number: number;
  
  /** PR title */
  title: string;
  
  /** PR state (open, closed, merged) */
  state: 'open' | 'closed' | 'merged';
  
  /** PR URL */
  url: string;
  
  /** PR author */
  author: string;
  
  /** Review comments */
  comments: PRComment[];
  
  /** Status checks */
  statusChecks: StatusCheck[];
  
  /** Overall review state */
  reviewState: 'approved' | 'changes_requested' | 'pending' | 'none';
}

interface PRComment {
  id: number;
  author: string;
  body: string;
  path?: string;
  line?: number;
  createdAt: Date;
  state: 'pending' | 'submitted';
}

interface StatusCheck {
  name: string;
  status: 'pending' | 'success' | 'failure' | 'error';
  url?: string;
}
```

**Source**: GitHub REST API via Octokit  
**Caching**: Cached in memory, refreshed on step selection

---

### GitHubIssue

Issue data from GitHub.

```typescript
interface GitHubIssue {
  /** Issue number */
  number: number;
  
  /** Issue title */
  title: string;
  
  /** Issue body/description */
  body: string;
  
  /** Issue state */
  state: 'open' | 'closed';
  
  /** Issue labels */
  labels: string[];
  
  /** Issue author */
  author: string;
  
  /** Issue URL */
  url: string;
  
  /** Created timestamp */
  createdAt: Date;
  
  /** Comment count */
  commentCount: number;
}
```

**Source**: GitHub REST API via Octokit

---

### AppSettings

User preferences and application state.

```typescript
interface AppSettings {
  /** Recently opened project paths */
  recentProjects: string[];
  
  /** Last opened project path */
  lastProjectPath?: string;
  
  /** Last selected spec instance ID */
  lastSpecId?: string;
  
  /** Terminal panel height (pixels) */
  terminalPanelHeight: number;
  
  /** Whether terminal panel is collapsed */
  terminalPanelCollapsed: boolean;
  
  /** Editor/viewer theme */
  theme: 'light' | 'dark' | 'system';
  
  /** GitHub auth token (stored separately in keychain) */
  // githubToken: stored in OS keychain, not in settings
}
```

**Source**: Tauri config directory + OS keychain  
**Persistence**: JSON file in app config directory

---

## Entity Relationships

```
Project (1) ────────< SpecInstance (many)
    │                      │
    │                      └────< Artifact (many)
    │                                  │
    │                                  └────< ChecklistSection (many)
    │                                              │
    │                                              └────< ChecklistItem (many)
    │
    └──── GitHubConnection (1)
              │
              ├────< PRFeedback (many, from API)
              │
              └────< GitHubIssue (many, from API)

TerminalSession (many) ──── independent, managed by app

WorkflowStep (8) ──── static config, maps to artifacts

AppSettings (1) ──── singleton, persisted
```

---

## State Transitions

### SpecInstance Selection
```
[No Selection] → select(specId) → [Loading Artifacts] → [Artifacts Loaded]
                                         ↓
                                    [Load Error]
```

### Checklist Item Toggle
```
[Unchecked] → toggle() → [Optimistic Update] → [Write to File] → [Confirmed]
                                  ↓                    ↓
                             [Rollback]           [Write Error]
```

### Terminal Session Lifecycle
```
[None] → create() → [Spawning] → [Running] → exit() → [Exited] → close() → [Destroyed]
                         ↓                       ↓
                    [Spawn Error]            [Crashed]
```

### GitHub Connection
```
[Disconnected] → authenticate() → [Connecting] → [Connected]
      ↑                                  ↓
      └──────────── logout() ◄──── [Auth Error]
      
[Connected] + network_lost → [Offline Mode]
[Offline Mode] + network_restored → [Connected]
```
