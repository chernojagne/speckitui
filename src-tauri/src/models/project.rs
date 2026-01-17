use serde::{Deserialize, Serialize};
use super::SpecInstance;

/// Represents an opened repository/folder containing spec-kit structure
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Project {
    /// Absolute path to project root
    pub path: String,
    
    /// Project name (derived from folder name)
    pub name: String,
    
    /// Whether .specify/ directory exists
    pub has_specify_dir: bool,
    
    /// Whether specs/ directory exists
    pub has_specs_dir: bool,
    
    /// Git remote URL if available
    pub git_remote: Option<String>,
    
    /// Current git branch
    pub git_branch: Option<String>,
    
    /// List of spec instances found
    pub spec_instances: Vec<SpecInstance>,
}

impl Project {
    pub fn new(path: String) -> Self {
        let name = std::path::Path::new(&path)
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("Unknown")
            .to_string();
        
        Self {
            path,
            name,
            has_specify_dir: false,
            has_specs_dir: false,
            git_remote: None,
            git_branch: None,
            spec_instances: Vec::new(),
        }
    }
}

/// Recent project entry for session restore
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RecentProject {
    pub path: String,
    pub name: String,
    pub last_opened: String, // ISO date string
}

/// Git status information
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GitStatus {
    pub branch: String,
    pub is_clean: bool,
    pub ahead: u32,
    pub behind: u32,
    pub staged: Vec<String>,
    pub unstaged: Vec<String>,
    pub untracked: Vec<String>,
}

/// Changed file entry
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ChangedFile {
    pub path: String,
    pub status: String, // "added" | "modified" | "deleted" | "renamed" | "untracked"
    pub staged: bool,
}
