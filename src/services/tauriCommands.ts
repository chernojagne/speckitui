/**
 * Tauri IPC Commands Wrapper
 * Provides type-safe functions for all Tauri backend commands
 */

import { invoke } from '@tauri-apps/api/core';
import type {
  Project,
  SpecInstance,
  ArtifactContent,
  SourceFileContent,
  FileEntry,
  AppSettings,
  GitStatus,
  ChangedFile,
  PRFeedback,
  GitHubIssue,
} from '@/types';

// ============ Project Commands ============

export async function openProject(path: string): Promise<Project> {
  return invoke('open_project', { path });
}

export async function getSpecInstances(projectPath: string): Promise<SpecInstance[]> {
  return invoke('get_spec_instances', { projectPath });
}

export interface RecentProject {
  path: string;
  name: string;
  lastOpened: string;
}

export async function getRecentProjects(): Promise<RecentProject[]> {
  return invoke('get_recent_projects');
}

export async function getChangedFiles(projectPath: string): Promise<ChangedFile[]> {
  return invoke('get_changed_files', { projectPath });
}

export async function getGitStatus(projectPath: string): Promise<GitStatus> {
  return invoke('get_git_status', { projectPath });
}

export async function createSpec(projectPath: string, specName: string): Promise<SpecInstance> {
  return invoke('create_spec', { projectPath, specName });
}

// ============ Artifact Commands ============

export async function readArtifact(filePath: string): Promise<ArtifactContent> {
  return invoke('read_artifact', { filePath });
}

export interface WriteArtifactResponse {
  success: boolean;
  lastModified: string;
}

export async function writeArtifact(
  filePath: string,
  content: string
): Promise<WriteArtifactResponse> {
  return invoke('write_artifact', { filePath, content });
}

export interface UpdateCheckboxParams {
  filePath: string;
  lineNumber: number;
  checked: boolean;
}

export interface UpdateCheckboxResponse {
  success: boolean;
  newContent: string;
}

export async function updateCheckbox(params: UpdateCheckboxParams): Promise<UpdateCheckboxResponse> {
  return invoke('update_checkbox', { 
    filePath: params.filePath, 
    lineNumber: params.lineNumber, 
    checked: params.checked 
  });
}

export interface DirectoryListingResponse {
  entries: FileEntry[];
  path: string;
}

export async function listDirectory(path: string): Promise<DirectoryListingResponse> {
  return invoke('list_directory', { path });
}

export async function readSourceFile(path: string): Promise<SourceFileContent> {
  return invoke('read_source_file', { path });
}

// ============ Description Commands ============

/**
 * Save feature description text to a spec's description.md file.
 * @param specPath - Absolute path to spec directory
 * @param content - Description text to save
 */
export async function saveDescription(specPath: string, content: string): Promise<void> {
  return invoke('save_description', { specPath, content });
}

/**
 * Load feature description text from a spec's description.md file.
 * @param specPath - Absolute path to spec directory
 * @returns Description text (empty string if file doesn't exist)
 */
export async function loadDescription(specPath: string): Promise<string> {
  return invoke('load_description', { specPath });
}

// ============ Terminal Commands ============

export interface TerminalCreatedResponse {
  sessionId: string;
  shell: string;
  cwd: string;
}

export async function createTerminal(
  cwd?: string,
  shell?: string
): Promise<TerminalCreatedResponse> {
  return invoke('create_terminal', { cwd, shell });
}

export async function writeTerminal(sessionId: string, data: string): Promise<void> {
  return invoke('write_terminal', { sessionId, data });
}

export async function resizeTerminal(sessionId: string, cols: number, rows: number): Promise<void> {
  return invoke('resize_terminal', { sessionId, cols, rows });
}

export async function closeTerminal(sessionId: string): Promise<void> {
  return invoke('close_terminal', { sessionId });
}

// ============ GitHub Commands ============

export interface GitHubAuthStatus {
  isAuthenticated: boolean;
  login?: string;
  avatarUrl?: string;
}

export async function checkGitHubAuth(): Promise<GitHubAuthStatus> {
  return invoke('check_github_auth');
}

export async function githubLogin(): Promise<GitHubAuthStatus> {
  return invoke('github_login');
}

export async function githubLogout(): Promise<void> {
  return invoke('github_logout');
}

// Device flow OAuth
export interface DeviceCodeResponse {
  deviceCode: string;
  userCode: string;
  verificationUri: string;
  expiresIn: number;
  interval: number;
}

export async function githubOAuthStart(clientId: string): Promise<DeviceCodeResponse> {
  return invoke('github_oauth_start', { clientId });
}

export async function githubOAuthComplete(clientId: string, deviceCode: string): Promise<GitHubAuthStatus> {
  return invoke('github_oauth_complete', { clientId, deviceCode });
}

export async function getPullRequests(projectPath: string): Promise<PRFeedback[]> {
  return invoke('get_pull_requests', { projectPath });
}

export async function getPRComments(
  projectPath: string,
  prNumber: number
): Promise<{ id: number; author: string; body: string }[]> {
  return invoke('get_pr_comments', { projectPath, prNumber });
}

export async function getIssues(projectPath: string): Promise<GitHubIssue[]> {
  return invoke('get_issues', { projectPath });
}

export async function getIssueDetail(
  projectPath: string,
  issueNumber: number
): Promise<GitHubIssue> {
  return invoke('get_issue_detail', { projectPath, issueNumber });
}

// ============ Settings Commands ============

export async function loadSettings(): Promise<AppSettings> {
  return invoke('load_settings');
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  return invoke('save_settings', { settings });
}

// ============ Git Commands ============

export interface GitBranchInfo {
  branch: string | null;
  isDetached: boolean;
  commitHash: string | null;
}

export async function getGitBranch(projectPath: string): Promise<GitBranchInfo> {
  return invoke('get_git_branch', { projectPath });
}

// ============ File Write Commands (005-ui-enhancements) ============

export interface WriteFileResponse {
  success: boolean;
  path: string;
  bytesWritten: number;
}

/**
 * Write content to a file, creating parent directories if needed.
 * @param path - Absolute path to file
 * @param content - File content to write
 */
export async function writeFile(path: string, content: string): Promise<WriteFileResponse> {
  return invoke('write_file', { path, content });
}

export interface CreateDirectoryResponse {
  success: boolean;
  path: string;
}

/**
 * Create a directory and parent directories.
 * @param path - Absolute path to directory
 */
export async function createDirectory(path: string): Promise<CreateDirectoryResponse> {
  return invoke('create_directory', { path });
}

// AgentType re-exported from types for convenience
import type { AgentType } from '@/types';
export type { AgentType };

export interface UpdateAgentContextResponse {
  success: boolean;
  filePath: string;
  created: boolean;
}

/**
 * Update an AI agent context file with new content.
 * Uses markers to avoid overwriting existing spec-kit sections.
 * @param agentType - Agent type (copilot, claude, etc.)
 * @param content - Markdown content to add
 * @param featureName - Feature name for header
 * @param repoPath - Path to repository root
 */
export async function updateAgentContext(
  agentType: AgentType,
  content: string,
  featureName: string,
  repoPath: string
): Promise<UpdateAgentContextResponse> {
  return invoke('update_agent_context', { agentType, content, featureName, repoPath });
}

// ============ Shell Execution Commands (005-ui-enhancements) ============

export interface ExecuteShellResponse {
  exitCode: number;
  stdout: string;
  stderr: string;
}

/**
 * Execute a shell script with arguments.
 * Security: Only allows scripts within .specify/scripts/ directory.
 * @param scriptPath - Relative path to script from repo root
 * @param args - Command line arguments
 * @param cwd - Working directory (defaults to repo root)
 */
export async function executeShellScript(
  scriptPath: string,
  args: string[],
  cwd?: string
): Promise<ExecuteShellResponse> {
  return invoke('execute_shell_script', { scriptPath, args, cwd });
}

// ============ Git File Status Commands (005-ui-enhancements) ============

export type GitFileStatus = 'clean' | 'modified' | 'untracked' | 'staged' | 'conflict';

export interface GitFileStatusResponse {
  statuses: Record<string, GitFileStatus>;
}

/**
 * Get git status for specific files.
 * @param repoPath - Path to git repository
 * @param files - Files to check (relative to repo root)
 */
export async function getGitFileStatus(
  repoPath: string,
  files: string[]
): Promise<GitFileStatusResponse> {
  return invoke('get_git_file_status', { repoPath, files });
}

// ============ File Watcher Commands (005-ui-enhancements) ============

export interface WatchArtifactResponse {
  success: boolean;
  watchedPaths: string[];
}

/**
 * Start watching artifact files for changes.
 * @param paths - Array of absolute file paths to watch
 */
export async function watchArtifactFiles(paths: string[]): Promise<WatchArtifactResponse> {
  return invoke('watch_artifact_files', { paths });
}

export interface UnwatchArtifactResponse {
  success: boolean;
  unwatchedPaths: string[];
}

/**
 * Stop watching artifact files.
 * @param paths - Array of absolute file paths to stop watching
 */
export async function unwatchArtifactFiles(paths: string[]): Promise<UnwatchArtifactResponse> {
  return invoke('unwatch_artifact_files', { paths });
}
