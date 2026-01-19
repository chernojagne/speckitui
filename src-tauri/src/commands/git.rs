use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GitBranchInfo {
    /// The current branch name, or None if not a git repo
    pub branch: Option<String>,
    /// Whether the repository is in a detached HEAD state
    pub is_detached: bool,
    /// Short commit hash when in detached HEAD state
    pub commit_hash: Option<String>,
}

/// Gets the current git branch for a project path
#[tauri::command]
pub async fn get_git_branch(project_path: String) -> Result<GitBranchInfo, String> {
    let git_dir = Path::new(&project_path).join(".git");
    
    // Check if it's a git repository
    if !git_dir.exists() {
        return Ok(GitBranchInfo {
            branch: None,
            is_detached: false,
            commit_hash: None,
        });
    }
    
    // Handle worktree: .git might be a file pointing to the actual git dir
    let actual_git_dir = if git_dir.is_file() {
        // Read the gitdir pointer
        let content = fs::read_to_string(&git_dir)
            .map_err(|e| format!("Failed to read .git file: {}", e))?;
        
        if let Some(gitdir) = content.strip_prefix("gitdir: ") {
            Path::new(&project_path).join(gitdir.trim()).to_path_buf()
        } else {
            git_dir
        }
    } else {
        git_dir
    };
    
    let head_path = actual_git_dir.join("HEAD");
    
    if !head_path.exists() {
        return Ok(GitBranchInfo {
            branch: None,
            is_detached: false,
            commit_hash: None,
        });
    }
    
    // Read HEAD file
    let head_content = fs::read_to_string(&head_path)
        .map_err(|e| format!("Failed to read HEAD: {}", e))?;
    
    let head_content = head_content.trim();
    
    // Check if it's a symbolic ref (normal branch) or a commit hash (detached HEAD)
    if let Some(ref_path) = head_content.strip_prefix("ref: refs/heads/") {
        // Normal branch reference
        Ok(GitBranchInfo {
            branch: Some(ref_path.to_string()),
            is_detached: false,
            commit_hash: None,
        })
    } else if head_content.len() == 40 && head_content.chars().all(|c| c.is_ascii_hexdigit()) {
        // Detached HEAD - it's a full commit hash
        Ok(GitBranchInfo {
            branch: None,
            is_detached: true,
            commit_hash: Some(head_content[..7].to_string()), // Short hash
        })
    } else {
        // Unknown format
        log::warn!("Unknown HEAD format: {}", head_content);
        Ok(GitBranchInfo {
            branch: None,
            is_detached: false,
            commit_hash: None,
        })
    }
}
