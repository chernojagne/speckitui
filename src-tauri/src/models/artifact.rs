use serde::{Deserialize, Serialize};

/// Tracks which artifacts exist for a spec instance
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ArtifactManifest {
    /// description.md exists
    pub has_description: bool,
    
    /// spec.md exists
    pub has_spec: bool,
    
    /// plan.md exists
    pub has_plan: bool,
    
    /// research.md exists
    pub has_research: bool,
    
    /// data-model.md exists
    pub has_data_model: bool,
    
    /// quickstart.md exists
    pub has_quickstart: bool,
    
    /// tasks.md exists
    pub has_tasks: bool,
    
    /// Files in contracts/ directory
    pub contract_files: Vec<String>,
    
    /// Files in checklists/ directory
    pub checklist_files: Vec<String>,
}

/// Represents a loaded markdown file with parsed content
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Artifact {
    /// File path relative to spec directory
    pub relative_path: String,
    
    /// Absolute file path
    pub absolute_path: String,
    
    /// File name (e.g., "spec.md")
    pub file_name: String,
    
    /// Raw markdown content
    pub raw_content: String,
    
    /// Last modified timestamp (ISO string)
    pub last_modified: String,
    
    /// File size in bytes
    pub size: u64,
}

/// Content response for read_artifact command
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ArtifactContent {
    pub content: String,
    pub last_modified: String,
    pub size: u64,
}

/// Source file content response
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SourceFileContent {
    pub content: String,
    pub language: String,
    pub line_count: usize,
    pub size: u64,
}

/// File entry for directory listing
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FileEntry {
    pub name: String,
    pub path: String,
    pub is_directory: bool,
    pub size: Option<u64>,
    pub last_modified: Option<String>,
    pub children: Option<Vec<FileEntry>>,
}
