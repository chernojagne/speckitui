// Git status service for 005-ui-enhancements
// Provides git status checking for artifact files

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::Path;
use std::process::Command;

// ============ Types ============

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum GitFileStatus {
    Clean,
    Modified,
    Untracked,
    Staged,
    Conflict,
}

impl Default for GitFileStatus {
    fn default() -> Self {
        GitFileStatus::Clean
    }
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GitStatusResponse {
    pub statuses: HashMap<String, GitFileStatus>,
}

// ============ Git Status Service ============

pub struct GitStatusService;

impl GitStatusService {
    /// Check if a path is a git repository
    pub fn is_git_repo(path: &Path) -> bool {
        let git_dir = path.join(".git");
        git_dir.exists() && git_dir.is_dir()
    }

    /// Get git status for specific files
    pub fn get_status_for_files(
        repo_path: &Path,
        files: &[String],
    ) -> Result<HashMap<String, GitFileStatus>, String> {
        if !Self::is_git_repo(repo_path) {
            return Err("NOT_A_REPO: Path is not a git repository".to_string());
        }

        // Run git status --porcelain
        let output = Command::new("git")
            .args(["status", "--porcelain", "-uall"])
            .current_dir(repo_path)
            .output()
            .map_err(|e| format!("GIT_NOT_FOUND: Failed to run git: {}", e))?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            return Err(format!("GIT_ERROR: {}", stderr));
        }

        let stdout = String::from_utf8_lossy(&output.stdout);
        let mut all_statuses: HashMap<String, GitFileStatus> = HashMap::new();

        // Parse git status output
        for line in stdout.lines() {
            if line.len() < 3 {
                continue;
            }

            let status_chars = &line[0..2];
            let file_path = line[3..].trim();

            let status = Self::parse_status_chars(status_chars);
            all_statuses.insert(file_path.to_string(), status);
        }

        // Build response for requested files
        let mut result: HashMap<String, GitFileStatus> = HashMap::new();
        
        for file in files {
            // Try to find the file in git status output
            let status = all_statuses.get(file).cloned().unwrap_or(GitFileStatus::Clean);
            result.insert(file.clone(), status);
        }

        Ok(result)
    }

    /// Parse git status two-character code
    fn parse_status_chars(chars: &str) -> GitFileStatus {
        let index = chars.chars().next().unwrap_or(' ');
        let worktree = chars.chars().nth(1).unwrap_or(' ');

        // Check for conflict markers
        if chars == "UU" || chars == "AA" || chars == "DD" {
            return GitFileStatus::Conflict;
        }

        // Staged changes (index has changes)
        if index != ' ' && index != '?' {
            if worktree != ' ' && worktree != '?' {
                // Both staged and modified in worktree - report as modified
                return GitFileStatus::Modified;
            }
            return GitFileStatus::Staged;
        }

        // Worktree changes
        if worktree == 'M' || worktree == 'D' {
            return GitFileStatus::Modified;
        }

        // Untracked
        if index == '?' && worktree == '?' {
            return GitFileStatus::Untracked;
        }

        GitFileStatus::Clean
    }
}

// ============ Tests ============

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use tempfile::TempDir;
    use std::process::Command;

    fn setup_git_repo(temp_dir: &TempDir) {
        let path = temp_dir.path();
        
        Command::new("git")
            .args(["init"])
            .current_dir(path)
            .output()
            .expect("Failed to init git repo");

        Command::new("git")
            .args(["config", "user.email", "test@test.com"])
            .current_dir(path)
            .output()
            .expect("Failed to set git email");

        Command::new("git")
            .args(["config", "user.name", "Test User"])
            .current_dir(path)
            .output()
            .expect("Failed to set git name");
    }

    #[test]
    fn test_is_git_repo() {
        let temp_dir = TempDir::new().unwrap();
        
        // Not a git repo initially
        assert!(!GitStatusService::is_git_repo(temp_dir.path()));

        // Initialize git
        setup_git_repo(&temp_dir);
        
        assert!(GitStatusService::is_git_repo(temp_dir.path()));
    }

    #[test]
    fn test_parse_status_chars() {
        assert_eq!(GitStatusService::parse_status_chars("  "), GitFileStatus::Clean);
        assert_eq!(GitStatusService::parse_status_chars(" M"), GitFileStatus::Modified);
        assert_eq!(GitStatusService::parse_status_chars("M "), GitFileStatus::Staged);
        assert_eq!(GitStatusService::parse_status_chars("MM"), GitFileStatus::Modified);
        assert_eq!(GitStatusService::parse_status_chars("??"), GitFileStatus::Untracked);
        assert_eq!(GitStatusService::parse_status_chars("UU"), GitFileStatus::Conflict);
        assert_eq!(GitStatusService::parse_status_chars("A "), GitFileStatus::Staged);
        assert_eq!(GitStatusService::parse_status_chars("D "), GitFileStatus::Staged);
    }

    #[test]
    fn test_not_a_repo() {
        let temp_dir = TempDir::new().unwrap();
        
        let result = GitStatusService::get_status_for_files(
            temp_dir.path(),
            &["file.txt".to_string()],
        );

        assert!(result.is_err());
        assert!(result.unwrap_err().contains("NOT_A_REPO"));
    }

    #[test]
    fn test_untracked_file() {
        let temp_dir = TempDir::new().unwrap();
        setup_git_repo(&temp_dir);

        // Create an untracked file
        fs::write(temp_dir.path().join("untracked.txt"), "content").unwrap();

        let result = GitStatusService::get_status_for_files(
            temp_dir.path(),
            &["untracked.txt".to_string()],
        );

        assert!(result.is_ok());
        let statuses = result.unwrap();
        assert_eq!(statuses.get("untracked.txt"), Some(&GitFileStatus::Untracked));
    }

    #[test]
    fn test_modified_file() {
        let temp_dir = TempDir::new().unwrap();
        setup_git_repo(&temp_dir);

        // Create and commit a file
        let file_path = temp_dir.path().join("tracked.txt");
        fs::write(&file_path, "initial content").unwrap();
        
        Command::new("git")
            .args(["add", "tracked.txt"])
            .current_dir(temp_dir.path())
            .output()
            .expect("Failed to add file");

        Command::new("git")
            .args(["commit", "-m", "Initial commit"])
            .current_dir(temp_dir.path())
            .output()
            .expect("Failed to commit");

        // Modify the file
        fs::write(&file_path, "modified content").unwrap();

        let result = GitStatusService::get_status_for_files(
            temp_dir.path(),
            &["tracked.txt".to_string()],
        );

        assert!(result.is_ok());
        let statuses = result.unwrap();
        assert_eq!(statuses.get("tracked.txt"), Some(&GitFileStatus::Modified));
    }

    #[test]
    fn test_staged_file() {
        let temp_dir = TempDir::new().unwrap();
        setup_git_repo(&temp_dir);

        // Create a file and stage it
        fs::write(temp_dir.path().join("staged.txt"), "content").unwrap();
        
        Command::new("git")
            .args(["add", "staged.txt"])
            .current_dir(temp_dir.path())
            .output()
            .expect("Failed to add file");

        let result = GitStatusService::get_status_for_files(
            temp_dir.path(),
            &["staged.txt".to_string()],
        );

        assert!(result.is_ok());
        let statuses = result.unwrap();
        assert_eq!(statuses.get("staged.txt"), Some(&GitFileStatus::Staged));
    }

    #[test]
    fn test_clean_file() {
        let temp_dir = TempDir::new().unwrap();
        setup_git_repo(&temp_dir);

        // Create, add, and commit a file
        fs::write(temp_dir.path().join("clean.txt"), "content").unwrap();
        
        Command::new("git")
            .args(["add", "clean.txt"])
            .current_dir(temp_dir.path())
            .output()
            .expect("Failed to add file");

        Command::new("git")
            .args(["commit", "-m", "Add file"])
            .current_dir(temp_dir.path())
            .output()
            .expect("Failed to commit");

        let result = GitStatusService::get_status_for_files(
            temp_dir.path(),
            &["clean.txt".to_string()],
        );

        assert!(result.is_ok());
        let statuses = result.unwrap();
        assert_eq!(statuses.get("clean.txt"), Some(&GitFileStatus::Clean));
    }

    #[test]
    fn test_multiple_files() {
        let temp_dir = TempDir::new().unwrap();
        setup_git_repo(&temp_dir);

        // Create various file states
        fs::write(temp_dir.path().join("untracked.txt"), "content").unwrap();
        fs::write(temp_dir.path().join("staged.txt"), "content").unwrap();
        
        Command::new("git")
            .args(["add", "staged.txt"])
            .current_dir(temp_dir.path())
            .output()
            .expect("Failed to add file");

        let result = GitStatusService::get_status_for_files(
            temp_dir.path(),
            &[
                "untracked.txt".to_string(),
                "staged.txt".to_string(),
                "nonexistent.txt".to_string(),
            ],
        );

        assert!(result.is_ok());
        let statuses = result.unwrap();
        assert_eq!(statuses.get("untracked.txt"), Some(&GitFileStatus::Untracked));
        assert_eq!(statuses.get("staged.txt"), Some(&GitFileStatus::Staged));
        assert_eq!(statuses.get("nonexistent.txt"), Some(&GitFileStatus::Clean)); // Not in git status = clean
    }
}
