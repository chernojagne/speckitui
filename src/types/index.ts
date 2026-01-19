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
  | 'bugfix';

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
