use std::fs;
use std::path::Path;

/// Save feature description text to a spec's description.md file.
/// 
/// # Arguments
/// * `spec_path` - Absolute path to spec directory
/// * `content` - Description text to save
/// 
/// # Returns
/// * `Ok(())` on successful save
/// * `Err(message)` on file system error
#[tauri::command]
pub async fn save_description(spec_path: String, content: String) -> Result<(), String> {
    let spec_dir = Path::new(&spec_path);
    
    // Validate spec path exists
    if !spec_dir.exists() {
        return Err(format!("Invalid spec path: {}", spec_path));
    }
    
    if !spec_dir.is_dir() {
        return Err(format!("Path is not a directory: {}", spec_path));
    }
    
    let description_path = spec_dir.join("description.md");
    
    fs::write(&description_path, &content)
        .map_err(|e| {
            if e.kind() == std::io::ErrorKind::PermissionDenied {
                format!("Permission denied: {}", description_path.display())
            } else {
                format!("IO error: {}", e)
            }
        })
}

/// Load feature description text from a spec's description.md file.
/// 
/// # Arguments
/// * `spec_path` - Absolute path to spec directory
/// 
/// # Returns
/// * `Ok(content)` - description text (empty string if file doesn't exist)
/// * `Err(message)` on file system error
#[tauri::command]
pub async fn load_description(spec_path: String) -> Result<String, String> {
    let spec_dir = Path::new(&spec_path);
    
    // Validate spec path exists
    if !spec_dir.exists() {
        return Err(format!("Invalid spec path: {}", spec_path));
    }
    
    if !spec_dir.is_dir() {
        return Err(format!("Path is not a directory: {}", spec_path));
    }
    
    let description_path = spec_dir.join("description.md");
    
    // If file doesn't exist, return empty string (not an error)
    if !description_path.exists() {
        return Ok(String::new());
    }
    
    fs::read_to_string(&description_path)
        .map_err(|e| {
            if e.kind() == std::io::ErrorKind::PermissionDenied {
                format!("Permission denied: {}", description_path.display())
            } else if e.kind() == std::io::ErrorKind::InvalidData {
                "Encoding error: file is not valid UTF-8".to_string()
            } else {
                format!("IO error: {}", e)
            }
        })
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    // T007a: Unit tests for save_description command
    
    #[tokio::test]
    async fn test_save_description_creates_file() {
        let dir = tempdir().unwrap();
        let spec_path = dir.path().to_string_lossy().to_string();
        
        let result = save_description(spec_path.clone(), "Test description".to_string()).await;
        assert!(result.is_ok());
        
        // Verify file was created
        let file_path = dir.path().join("description.md");
        assert!(file_path.exists());
        
        // Verify content
        let content = fs::read_to_string(&file_path).unwrap();
        assert_eq!(content, "Test description");
    }
    
    #[tokio::test]
    async fn test_save_description_overwrites_existing() {
        let dir = tempdir().unwrap();
        let spec_path = dir.path().to_string_lossy().to_string();
        let file_path = dir.path().join("description.md");
        
        // Create existing file
        fs::write(&file_path, "Old content").unwrap();
        
        // Save new content
        let result = save_description(spec_path.clone(), "New content".to_string()).await;
        assert!(result.is_ok());
        
        // Verify content was overwritten
        let content = fs::read_to_string(&file_path).unwrap();
        assert_eq!(content, "New content");
    }
    
    #[tokio::test]
    async fn test_save_description_invalid_path() {
        let result = save_description("/nonexistent/path".to_string(), "content".to_string()).await;
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("Invalid spec path"));
    }
    
    #[tokio::test]
    async fn test_save_description_path_is_file() {
        let dir = tempdir().unwrap();
        let file_path = dir.path().join("not_a_dir");
        fs::write(&file_path, "").unwrap();
        
        let result = save_description(file_path.to_string_lossy().to_string(), "content".to_string()).await;
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("not a directory"));
    }
    
    // T007b: Unit tests for load_description command
    
    #[tokio::test]
    async fn test_load_description_existing_file() {
        let dir = tempdir().unwrap();
        let spec_path = dir.path().to_string_lossy().to_string();
        let file_path = dir.path().join("description.md");
        
        // Create file with content
        fs::write(&file_path, "Test description").unwrap();
        
        let result = load_description(spec_path).await;
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), "Test description");
    }
    
    #[tokio::test]
    async fn test_load_description_missing_returns_empty() {
        let dir = tempdir().unwrap();
        let spec_path = dir.path().to_string_lossy().to_string();
        
        let result = load_description(spec_path).await;
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), "");
    }
    
    #[tokio::test]
    async fn test_load_description_invalid_path() {
        let result = load_description("/nonexistent/path".to_string()).await;
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("Invalid spec path"));
    }
    
    #[tokio::test]
    async fn test_load_description_path_is_file() {
        let dir = tempdir().unwrap();
        let file_path = dir.path().join("not_a_dir");
        fs::write(&file_path, "").unwrap();
        
        let result = load_description(file_path.to_string_lossy().to_string()).await;
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("not a directory"));
    }
    
    #[tokio::test]
    async fn test_save_and_load_roundtrip() {
        let dir = tempdir().unwrap();
        let spec_path = dir.path().to_string_lossy().to_string();
        
        // Save
        let save_result = save_description(spec_path.clone(), "Roundtrip test".to_string()).await;
        assert!(save_result.is_ok());
        
        // Load
        let load_result = load_description(spec_path).await;
        assert!(load_result.is_ok());
        assert_eq!(load_result.unwrap(), "Roundtrip test");
    }
    
    #[tokio::test]
    async fn test_save_empty_content() {
        let dir = tempdir().unwrap();
        let spec_path = dir.path().to_string_lossy().to_string();
        
        let result = save_description(spec_path.clone(), String::new()).await;
        assert!(result.is_ok());
        
        let content = load_description(spec_path).await.unwrap();
        assert_eq!(content, "");
    }
    
    #[tokio::test]
    async fn test_save_multiline_content() {
        let dir = tempdir().unwrap();
        let spec_path = dir.path().to_string_lossy().to_string();
        let multiline = "Line 1\nLine 2\nLine 3";
        
        let result = save_description(spec_path.clone(), multiline.to_string()).await;
        assert!(result.is_ok());
        
        let content = load_description(spec_path).await.unwrap();
        assert_eq!(content, multiline);
    }
}
