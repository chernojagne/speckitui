// File write commands for 005-ui-enhancements
// Handles write_file, create_directory, and update_agent_context IPC commands

use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;

// ============ Request/Response Types ============

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WriteFileRequest {
    pub path: String,
    pub content: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct WriteFileResponse {
    pub success: bool,
    pub path: String,
    pub bytes_written: usize,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateDirectoryRequest {
    pub path: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateDirectoryResponse {
    pub success: bool,
    pub path: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateAgentContextRequest {
    pub agent_type: String,
    pub content: String,
    pub feature_name: String,
    pub repo_path: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateAgentContextResponse {
    pub success: bool,
    pub file_path: String,
    pub created: bool,
}

// ============ Agent Configuration ============

struct AgentConfig {
    file_path: &'static str,
    marker_start: &'static str,
    marker_end: &'static str,
}

fn get_agent_config(agent_type: &str) -> Result<AgentConfig, String> {
    match agent_type {
        "copilot" => Ok(AgentConfig {
            file_path: ".github/agents/copilot-instructions.md",
            marker_start: "<!-- SPECKITUI-DESCRIBE-START -->",
            marker_end: "<!-- SPECKITUI-DESCRIBE-END -->",
        }),
        "claude" => Ok(AgentConfig {
            file_path: "CLAUDE.md",
            marker_start: "<!-- SPECKITUI-DESCRIBE-START -->",
            marker_end: "<!-- SPECKITUI-DESCRIBE-END -->",
        }),
        "gemini" => Ok(AgentConfig {
            file_path: "GEMINI.md",
            marker_start: "<!-- SPECKITUI-DESCRIBE-START -->",
            marker_end: "<!-- SPECKITUI-DESCRIBE-END -->",
        }),
        _ => Err(format!("INVALID_AGENT: Unknown agent type: {}", agent_type)),
    }
}

// ============ Tauri Commands ============

/// Write content to a file, creating parent directories if needed
#[tauri::command]
pub async fn write_file(path: String, content: String) -> Result<WriteFileResponse, String> {
    let file_path = Path::new(&path);

    // Create parent directories if they don't exist
    if let Some(parent) = file_path.parent() {
        if !parent.exists() {
            fs::create_dir_all(parent)
                .map_err(|e| format!("PERMISSION_DENIED: Failed to create parent directories: {}", e))?;
        }
    }

    // Write the file
    let bytes_written = content.len();
    fs::write(file_path, &content)
        .map_err(|e| format!("IO_ERROR: Failed to write file: {}", e))?;

    log::info!("Wrote {} bytes to {}", bytes_written, path);

    Ok(WriteFileResponse {
        success: true,
        path,
        bytes_written,
    })
}

/// Create a directory and parent directories
#[tauri::command]
pub async fn create_directory(path: String) -> Result<CreateDirectoryResponse, String> {
    let dir_path = Path::new(&path);

    // Check if already exists
    if dir_path.exists() {
        if dir_path.is_dir() {
            return Ok(CreateDirectoryResponse {
                success: true,
                path,
            });
        } else {
            return Err(format!("INVALID_PATH: Path exists but is not a directory: {}", path));
        }
    }

    // Create directory and parents
    fs::create_dir_all(dir_path)
        .map_err(|e| format!("PERMISSION_DENIED: Failed to create directory: {}", e))?;

    log::info!("Created directory: {}", path);

    Ok(CreateDirectoryResponse {
        success: true,
        path,
    })
}

/// Update an AI agent context file with new content
/// Uses markers to avoid overwriting existing spec-kit sections
#[tauri::command]
pub async fn update_agent_context(
    agent_type: String,
    content: String,
    feature_name: String,
    repo_path: String,
) -> Result<UpdateAgentContextResponse, String> {
    let config = get_agent_config(&agent_type)?;
    let file_path = Path::new(&repo_path).join(config.file_path);
    let file_path_str = file_path.to_string_lossy().to_string();

    // Create parent directories if needed
    if let Some(parent) = file_path.parent() {
        if !parent.exists() {
            fs::create_dir_all(parent)
                .map_err(|e| format!("PERMISSION_DENIED: Failed to create directories: {}", e))?;
        }
    }

    // Format the new section
    let timestamp = chrono::Utc::now().format("%Y-%m-%d").to_string();
    let new_section = format!(
        "{}\n## Feature Context: {}\n\n{}\n\n*Added via SpeckitUI on {}*\n{}\n",
        config.marker_start,
        feature_name,
        content.trim(),
        timestamp,
        config.marker_end
    );

    // Check if file exists
    let created = !file_path.exists();
    
    let final_content = if created {
        // Create new file with just the section
        format!("# {}\n\n{}", feature_name, new_section)
    } else {
        // Read existing file
        let existing = fs::read_to_string(&file_path)
            .map_err(|e| format!("IO_ERROR: Failed to read file: {}", e))?;

        // Check if markers exist
        if existing.contains(config.marker_start) && existing.contains(config.marker_end) {
            // Replace content between markers
            let start_idx = existing.find(config.marker_start)
                .ok_or("Failed to find start marker")?;
            let end_idx = existing.find(config.marker_end)
                .ok_or("Failed to find end marker")?
                + config.marker_end.len();

            format!(
                "{}{}{}",
                &existing[..start_idx],
                new_section,
                &existing[end_idx..]
            )
        } else {
            // Append new section at the end
            format!("{}\n\n{}", existing.trim_end(), new_section)
        }
    };

    // Write the file
    fs::write(&file_path, &final_content)
        .map_err(|e| format!("IO_ERROR: Failed to write file: {}", e))?;

    log::info!("Updated agent context file: {} (created: {})", file_path_str, created);

    Ok(UpdateAgentContextResponse {
        success: true,
        file_path: file_path_str,
        created,
    })
}

// ============ Tests ============

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use tempfile::TempDir;

    #[tokio::test]
    async fn test_write_file_creates_file() {
        let temp_dir = TempDir::new().unwrap();
        let file_path = temp_dir.path().join("test.md");
        let content = "# Test Content\n\nHello, world!";

        let result = write_file(
            file_path.to_string_lossy().to_string(),
            content.to_string(),
        ).await;

        assert!(result.is_ok());
        let response = result.unwrap();
        assert!(response.success);
        assert_eq!(response.bytes_written, content.len());
        
        // Verify file was created with correct content
        let saved = fs::read_to_string(&file_path).unwrap();
        assert_eq!(saved, content);
    }

    #[tokio::test]
    async fn test_write_file_creates_parent_dirs() {
        let temp_dir = TempDir::new().unwrap();
        let file_path = temp_dir.path().join("nested/deep/path/test.md");
        let content = "Nested file content";

        let result = write_file(
            file_path.to_string_lossy().to_string(),
            content.to_string(),
        ).await;

        assert!(result.is_ok());
        assert!(file_path.exists());
    }

    #[tokio::test]
    async fn test_create_directory_new() {
        let temp_dir = TempDir::new().unwrap();
        let dir_path = temp_dir.path().join("new_directory");

        let result = create_directory(dir_path.to_string_lossy().to_string()).await;

        assert!(result.is_ok());
        assert!(dir_path.exists());
        assert!(dir_path.is_dir());
    }

    #[tokio::test]
    async fn test_create_directory_already_exists() {
        let temp_dir = TempDir::new().unwrap();
        let dir_path = temp_dir.path().join("existing");
        fs::create_dir(&dir_path).unwrap();

        let result = create_directory(dir_path.to_string_lossy().to_string()).await;

        assert!(result.is_ok());
        let response = result.unwrap();
        assert!(response.success);
    }

    #[tokio::test]
    async fn test_update_agent_context_new_file() {
        let temp_dir = TempDir::new().unwrap();
        let content = "This is the feature description.";

        let result = update_agent_context(
            "claude".to_string(),
            content.to_string(),
            "My Feature".to_string(),
            temp_dir.path().to_string_lossy().to_string(),
        ).await;

        assert!(result.is_ok());
        let response = result.unwrap();
        assert!(response.success);
        assert!(response.created);

        // Verify file was created
        let file_path = temp_dir.path().join("CLAUDE.md");
        assert!(file_path.exists());
        
        let saved = fs::read_to_string(&file_path).unwrap();
        assert!(saved.contains("<!-- SPECKITUI-DESCRIBE-START -->"));
        assert!(saved.contains(content));
        assert!(saved.contains("<!-- SPECKITUI-DESCRIBE-END -->"));
    }

    #[tokio::test]
    async fn test_update_agent_context_existing_with_markers() {
        let temp_dir = TempDir::new().unwrap();
        let file_path = temp_dir.path().join("CLAUDE.md");
        
        // Create existing file with markers
        let existing_content = "# CLAUDE.md\n\n<!-- SPECKITUI-DESCRIBE-START -->\nOld content\n<!-- SPECKITUI-DESCRIBE-END -->\n\nMore stuff";
        fs::write(&file_path, existing_content).unwrap();

        let new_content = "New feature description";
        let result = update_agent_context(
            "claude".to_string(),
            new_content.to_string(),
            "Updated Feature".to_string(),
            temp_dir.path().to_string_lossy().to_string(),
        ).await;

        assert!(result.is_ok());
        let response = result.unwrap();
        assert!(!response.created); // File existed

        let saved = fs::read_to_string(&file_path).unwrap();
        assert!(saved.contains(new_content));
        assert!(!saved.contains("Old content"));
        assert!(saved.contains("More stuff")); // Preserved content after markers
    }

    #[tokio::test]
    async fn test_invalid_agent_type() {
        let temp_dir = TempDir::new().unwrap();

        let result = update_agent_context(
            "invalid_agent".to_string(),
            "content".to_string(),
            "Feature".to_string(),
            temp_dir.path().to_string_lossy().to_string(),
        ).await;

        assert!(result.is_err());
        assert!(result.unwrap_err().contains("INVALID_AGENT"));
    }
}
