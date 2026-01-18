use crate::models::{ArtifactContent, FileEntry, SourceFileContent};
use std::fs;
use std::path::Path;
use std::time::SystemTime;

/// Reads a markdown artifact file
#[tauri::command]
pub async fn read_artifact(file_path: String) -> Result<ArtifactContent, String> {
    let path = Path::new(&file_path);

    if !path.exists() {
        return Err(format!("Artifact file not found: {}", file_path));
    }

    let content = fs::read_to_string(path)
        .map_err(|e| format!("Failed to read file: {}", e))?;

    let metadata = fs::metadata(path)
        .map_err(|e| format!("Failed to get file metadata: {}", e))?;

    let last_modified = metadata
        .modified()
        .unwrap_or(SystemTime::UNIX_EPOCH)
        .duration_since(SystemTime::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();

    Ok(ArtifactContent {
        content,
        last_modified: format!("{}", last_modified),
        size: metadata.len(),
    })
}

/// Writes content to an artifact file
#[tauri::command]
pub async fn write_artifact(
    file_path: String,
    content: String,
) -> Result<serde_json::Value, String> {
    let path = Path::new(&file_path);

    fs::write(path, &content)
        .map_err(|e| format!("Failed to write file: {}", e))?;

    let metadata = fs::metadata(path)
        .map_err(|e| format!("Failed to get file metadata: {}", e))?;

    let last_modified = metadata
        .modified()
        .unwrap_or(SystemTime::UNIX_EPOCH)
        .duration_since(SystemTime::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();

    Ok(serde_json::json!({
        "success": true,
        "lastModified": format!("{}", last_modified)
    }))
}

/// Updates a single checkbox in a markdown file (atomic operation)
#[tauri::command]
pub async fn update_checkbox(
    file_path: String,
    line_number: usize,
    checked: bool,
) -> Result<serde_json::Value, String> {
    let path = Path::new(&file_path);

    if !path.exists() {
        return Err(format!("File not found: {}", file_path));
    }

    let content = fs::read_to_string(path)
        .map_err(|e| format!("Failed to read file: {}", e))?;

    let lines: Vec<&str> = content.lines().collect();

    if line_number == 0 || line_number > lines.len() {
        return Err(format!("Line {} not found in file", line_number));
    }

    let line = lines[line_number - 1];

    // Check if line contains a checkbox
    if !line.contains("- [ ]") && !line.contains("- [x]") && !line.contains("- [X]") {
        return Err(format!("Line {} is not a checkbox item", line_number));
    }

    // Replace checkbox state
    let new_line = if checked {
        line.replace("- [ ]", "- [X]")
            .replace("- [x]", "- [X]")
    } else {
        line.replace("- [X]", "- [ ]")
            .replace("- [x]", "- [ ]")
    };

    // Rebuild content
    let mut new_lines: Vec<String> = lines.iter().map(|l| l.to_string()).collect();
    new_lines[line_number - 1] = new_line;

    let new_content = new_lines.join("\n");

    fs::write(path, &new_content)
        .map_err(|e| format!("Failed to write file: {}", e))?;

    Ok(serde_json::json!({
        "success": true,
        "newContent": new_content
    }))
}

/// Lists files in a directory
#[tauri::command]
pub async fn list_directory(path: String) -> Result<serde_json::Value, String> {
    let dir_path = Path::new(&path);

    if !dir_path.exists() {
        return Err(format!("Directory not found: {}", path));
    }

    if !dir_path.is_dir() {
        return Err(format!("Path is not a directory: {}", path));
    }

    let entries = list_directory_internal(dir_path, false, false)?;
    
    Ok(serde_json::json!({
        "entries": entries,
        "path": path
    }))
}

fn list_directory_internal(
    path: &Path,
    recursive: bool,
    include_hidden: bool,
) -> Result<Vec<FileEntry>, String> {
    let mut entries = Vec::new();

    let dir_entries = fs::read_dir(path)
        .map_err(|e| format!("Failed to read directory: {}", e))?;

    for entry in dir_entries.flatten() {
        let file_name = entry.file_name().to_string_lossy().to_string();

        // Skip hidden files unless requested
        if !include_hidden && file_name.starts_with('.') {
            continue;
        }

        // Skip common non-source directories
        if file_name == "node_modules" || file_name == "target" || file_name == ".git" {
            continue;
        }

        let file_path = entry.path();
        let is_directory = file_path.is_dir();

        let metadata = entry.metadata().ok();
        let size = metadata.as_ref().and_then(|m| if m.is_file() { Some(m.len()) } else { None });
        let last_modified = metadata.and_then(|m| m.modified().ok()).map(|t| {
            t.duration_since(SystemTime::UNIX_EPOCH)
                .unwrap_or_default()
                .as_secs()
                .to_string()
        });

        let children = if is_directory && recursive {
            Some(list_directory_internal(&file_path, recursive, include_hidden)?)
        } else {
            None
        };

        entries.push(FileEntry {
            name: file_name,
            path: file_path.to_string_lossy().to_string(),
            is_directory,
            size,
            last_modified,
            children,
        });
    }

    // Sort: directories first, then alphabetically
    entries.sort_by(|a, b| {
        match (a.is_directory, b.is_directory) {
            (true, false) => std::cmp::Ordering::Less,
            (false, true) => std::cmp::Ordering::Greater,
            _ => a.name.to_lowercase().cmp(&b.name.to_lowercase()),
        }
    });

    Ok(entries)
}

/// Reads a source code file for the viewer
#[tauri::command]
pub async fn read_source_file(path: String) -> Result<SourceFileContent, String> {
    let file_path = Path::new(&path);

    if !file_path.exists() {
        return Err(format!("File not found: {}", path));
    }

    let content = fs::read_to_string(file_path)
        .map_err(|e| format!("Failed to read file: {}", e))?;

    let metadata = fs::metadata(file_path)
        .map_err(|e| format!("Failed to get file metadata: {}", e))?;

    // Detect language from extension
    let language = file_path
        .extension()
        .and_then(|ext| ext.to_str())
        .map(|ext| match ext {
            "rs" => "rust",
            "ts" | "tsx" => "typescript",
            "js" | "jsx" => "javascript",
            "py" => "python",
            "md" => "markdown",
            "json" => "json",
            "toml" => "toml",
            "yaml" | "yml" => "yaml",
            "html" => "html",
            "css" => "css",
            "scss" | "sass" => "scss",
            _ => "plaintext",
        })
        .unwrap_or("plaintext")
        .to_string();

    let line_count = content.lines().count();

    Ok(SourceFileContent {
        content,
        language,
        line_count,
        size: metadata.len(),
    })
}
