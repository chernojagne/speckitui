// Core TypeScript types for SpeckitUI
// Based on data-model.md specifications

import type { LucideIcon } from 'lucide-react';

// ============ Project & Spec Types ============

export interface Project {
  /** Absolute path to project root */
  path: string;
  /** Project name (derived from folder name) */
  name: string;
  /** Whether .specify/ directory exists */
  hasSpecifyDir: boolean;
  /** Whether specs/ directory exists */
  hasSpecsDir: boolean;
  /** Whether .git/ directory exists */
  hasGitDir: boolean;
  /** Git remote URL if available */
  gitRemote?: string;
  /** Current git branch */
  gitBranch?: string;
  /** List of spec instances found */
  specInstances: SpecInstance[];
}

export interface SpecInstance {
  /** Unique ID derived from directory name (e.g., "001-speckitui-core") */
  id: string;
  /** Numeric prefix (e.g., 1) */
  number: number;
  /** Short name (e.g., "speckitui-core") */
  shortName: string;
  /** Display name derived from spec.md title */
  displayName: string;
  /** Absolute path to spec directory */
  path: string;
  /** Available artifacts in this spec */
  artifacts: ArtifactManifest;
  /** Associated git branch name (matches id pattern) */
  branch?: string;
}

export interface ArtifactManifest {
  hasDescription: boolean;
  hasSpec: boolean;
  hasPlan: boolean;
  hasResearch: boolean;
  hasDataModel: boolean;
  hasQuickstart: boolean;
  hasTasks: boolean;
  contractFiles: string[];
  checklistFiles: string[];
}

// ============ Artifact Types ============

export interface Artifact {
  relativePath: string;
  absolutePath: string;
  fileName: string;
  rawContent: string;
  lastModified: Date;
  checklists: ChecklistSection[];
  status: 'loading' | 'loaded' | 'error';
  error?: string;
}

export interface ArtifactContent {
  content: string;
  lastModified: string;
  size: number;
}

export interface SourceFileContent {
  content: string;
  language: string;
  lineCount: number;
  size: number;
}

export interface FileEntry {
  name: string;
  path: string;
  isDirectory: boolean;
  size?: number;
  lastModified?: string;
  children?: FileEntry[];
}

// ============ Checklist Types ============

export interface ChecklistSection {
  heading: string;
  level: number;
  startLine: number;
  endLine: number;
  items: ChecklistItem[];
  completionRatio: number;
}

export interface ChecklistItem {
  id: string;
  lineNumber: number;
  rawText: string;
  displayText: string;
  checked: boolean;
  indent: number;
  metadata?: TaskMetadata;
}

export interface TaskMetadata {
  priority?: string;
  isParallel?: boolean;
  file?: string;
  story?: string;
}

// ============ Workflow Types ============

export type WorkflowStepId =
  | 'describe'
  | 'specify'
  | 'plan'
  | 'tasks'
  | 'implement'
  | 'test'
  | 'push'
  | 'pr'
  | 'bugfix'
  | 'constitution';

export interface WorkflowStep {
  id: WorkflowStepId;
  label: string;
  icon: LucideIcon;
  artifactPatterns: string[];
  requiresGitHub: boolean;
  hasContent: boolean;
}

// ============ Terminal Types ============

export interface TerminalSession {
  id: string;
  label: string;
  cwd: string;
  shell: string;
  shellType: 'cmd' | 'powershell' | 'bash' | 'default';
  status: 'running' | 'exited';
  exitCode?: number;
  isActive: boolean;
}

// ============ GitHub Types ============

export interface GitHubConnection {
  isAuthenticated: boolean;
  isOnline: boolean;
  user?: {
    login: string;
    avatarUrl: string;
  };
  repoOwner?: string;
  repoName?: string;
  lastSync?: Date;
}

export interface PRFeedback {
  number: number;
  title: string;
  state: 'open' | 'closed' | 'merged';
  status?: 'open' | 'draft' | 'merged' | 'closed';
  url: string;
  author: string;
  branch?: string;
  createdAt?: string;
  comments?: PRComment[];
  statusChecks?: StatusCheck[];
  reviewState?: 'approved' | 'changes_requested' | 'pending' | 'none';
}

export interface PRComment {
  id: number;
  author: string;
  body: string;
  path?: string;
  line?: number;
  createdAt: Date;
  state: 'pending' | 'submitted';
}

export interface StatusCheck {
  name: string;
  status: 'pending' | 'success' | 'failure' | 'error';
  url?: string;
}

export interface GitHubIssue {
  number: number;
  title: string;
  body: string;
  state: 'open' | 'closed';
  labels: string[];
  author: string;
  url: string;
  createdAt: Date;
  commentCount: number;
}

// ============ Settings Types ============

export interface AppSettings {
  recentProjects: string[];
  lastProjectPath?: string;
  lastSpecId?: string;
  terminalPanelHeight: number;
  terminalPanelCollapsed: boolean;
  theme: 'light' | 'dark' | 'system';
  // Editor settings
  editorFontSize: number;
  editorLineNumbers: boolean;
  editorWordWrap: boolean;
  // Sidebar settings
  sidebarShowIcons: boolean;
  sidebarCompactMode: boolean;
  // Navigation pane settings
  navPaneWidth: number;
  navPaneCollapsed: boolean;
  // Terminal settings
  terminalFontSize: number;
  terminalFontFamily: string;
  terminalTheme: 'auto' | 'dark' | 'light' | 'caffeine-dark' | 'caffeine-light' | 'monokai' | 'dracula';
  terminalCursorBlink: boolean;
  defaultTerminal: 'cmd' | 'powershell' | 'bash';
}

// ============ Git Types ============

export interface GitStatus {
  branch: string;
  isClean: boolean;
  ahead: number;
  behind: number;
  staged: string[];
  unstaged: string[];
  untracked: string[];
}

export interface ChangedFile {
  path: string;
  status: 'added' | 'modified' | 'deleted' | 'renamed' | 'untracked';
  staged: boolean;
}

// ============ Editor & Composer Types (005-ui-enhancements) ============

/** Rich content for the Describe view composer, persisted to description.md */
export interface ComposerContent {
  /** Raw markdown content (primary storage format) */
  markdown: string;
  /** ISO timestamp of last modification */
  lastModified: string;
  /** Embedded assets (images/files) */
  assets: ComposerAsset[];
}

export interface ComposerAsset {
  id: string;
  type: 'image' | 'file';
  filename: string;
  /** For inline images: base64 data URI; for files: relative path to assets/ */
  reference: string;
}

/** Supported AI agent CLI tools */
export type AgentType = 'copilot' | 'claude' | 'cursor' | 'custom';

export interface AgentConfig {
  /** Unique identifier matching AgentType */
  id: AgentType;
  /** Display name for UI */
  name: string;
  /** File name only */
  fileName: string;
  /** Path relative to project root */
  relativePath: string;
  /** Start marker for context insertion */
  startMarker: string;
  /** End marker for context insertion */
  endMarker: string;
  /** Description of the agent */
  description: string;
}

/** Git status for an artifact file */
export type GitFileStatus = 'clean' | 'modified' | 'untracked' | 'staged' | 'conflict';

/** A markdown file associated with a workflow step */
export interface ArtifactFile {
  id: string;
  filename: string;
  path: string;
  content: string;
  exists: boolean;
  isModified: boolean;
  gitStatus: GitFileStatus;
  lastLoaded: string;
}

/** Editor state for markdown editing */
export interface EditorState {
  activeArtifact: string | null;
  unsavedChanges: Record<string, string>;
  isEditing: boolean;
}

/** Input for creating a new feature spec */
export interface NewSpecInput {
  shortName: string;
  description: string;
}

export interface NewSpecResult {
  branchName: string;
  specFile: string;
  featureNum: string;
}

/** Input for creating a new project */
export interface NewProjectInput {
  name: string;
  location: string;
}

export interface NewProjectResult {
  path: string;
  initCommand: string;
}

// ============ IPC Request/Response Types (005-ui-enhancements) ============

export interface WriteFileRequest {
  path: string;
  content: string;
}

export interface WriteFileResponse {
  success: boolean;
  path: string;
  bytesWritten: number;
}

export interface ExecuteShellRequest {
  scriptPath: string;
  args: string[];
  cwd?: string;
}

export interface ExecuteShellResponse {
  exitCode: number;
  stdout: string;
  stderr: string;
}

export interface GitStatusRequest {
  repoPath: string;
  files: string[];
}

export interface GitStatusResponse {
  statuses: Record<string, GitFileStatus>;
}

export interface CreateDirectoryRequest {
  path: string;
}

export interface CreateDirectoryResponse {
  success: boolean;
  path: string;
}

export interface WatchArtifactRequest {
  specDir: string;
  files: string[];
}

export interface WatchArtifactResponse {
  watchId: string;
}

export interface UnwatchArtifactRequest {
  watchId: string;
}

export interface UnwatchArtifactResponse {
  success: boolean;
}

export interface UpdateAgentContextRequest {
  agentType: AgentType;
  content: string;
  featureName: string;
  repoPath: string;
}

export interface UpdateAgentContextResponse {
  success: boolean;
  filePath: string;
  created: boolean;
}

export interface ArtifactFileChangedEvent {
  watchId: string;
  file: string;
  path: string;
  changeType: 'modified' | 'created' | 'deleted';
}

export interface GitStatusChangedEvent {
  repoPath: string;
  file: string;
  status: GitFileStatus;
}
