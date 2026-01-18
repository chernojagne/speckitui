use serde::{Deserialize, Serialize};
use super::ArtifactManifest;

/// A single feature specification within a project
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SpecInstance {
    /// Unique ID derived from directory name (e.g., "001-speckitui-core")
    pub id: String,
    
    /// Numeric prefix (e.g., 1)
    pub number: u32,
    
    /// Short name (e.g., "speckitui-core")
    pub short_name: String,
    
    /// Display name derived from spec.md title
    pub display_name: String,
    
    /// Absolute path to spec directory
    pub path: String,
    
    /// Available artifacts in this spec
    pub artifacts: ArtifactManifest,
    
    /// Associated git branch name (matches id pattern)
    pub branch: Option<String>,
}

impl SpecInstance {
    /// Parse a spec instance from a directory name
    pub fn from_dir_name(dir_name: &str, base_path: &str) -> Option<Self> {
        // Expected format: NNN-name or NNN-some-name
        let parts: Vec<&str> = dir_name.splitn(2, '-').collect();
        if parts.len() < 2 {
            return None;
        }
        
        let number = parts[0].parse::<u32>().ok()?;
        let short_name = parts[1].to_string();
        
        // Convert short_name to display name (kebab-case to Title Case)
        let display_name = short_name
            .split('-')
            .map(|word| {
                let mut chars = word.chars();
                match chars.next() {
                    None => String::new(),
                    Some(first) => first.to_uppercase().collect::<String>() + chars.as_str(),
                }
            })
            .collect::<Vec<_>>()
            .join(" ");
        
        Some(Self {
            id: dir_name.to_string(),
            number,
            short_name,
            display_name,
            path: format!("{}/specs/{}", base_path, dir_name),
            artifacts: ArtifactManifest::default(),
            branch: Some(dir_name.to_string()),
        })
    }
}
