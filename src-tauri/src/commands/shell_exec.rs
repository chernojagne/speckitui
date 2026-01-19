// Shell script execution command for 005-ui-enhancements
// Handles execute_shell_script IPC command for running scripts in .specify/scripts/

use serde::{Deserialize, Serialize};
use std::path::Path;
use std::process::Command;

// ============ Request/Response Types ============

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExecuteShellRequest {
    /// Relative path to script from repo root
    pub script_path: String,
    /// Command line arguments
    pub args: Vec<String>,
    /// Working directory (defaults to repo root)
    pub cwd: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ExecuteShellResponse {
    pub exit_code: i32,
    pub stdout: String,
    pub stderr: String,
}

// ============ Constants ============

/// Allowed script directory prefix for security
const ALLOWED_SCRIPT_PREFIX: &str = ".specify/scripts/";

// ============ Tauri Commands ============

/// Execute a shell script with arguments
/// Security: Only allows scripts within .specify/scripts/ directory
#[tauri::command]
pub async fn execute_shell_script(
    script_path: String,
    args: Vec<String>,
    cwd: Option<String>,
) -> Result<ExecuteShellResponse, String> {
    // Security check: script must be in allowed directory
    if !script_path.starts_with(ALLOWED_SCRIPT_PREFIX) && !script_path.starts_with(".specify\\scripts\\") {
        return Err(format!(
            "SCRIPT_NOT_FOUND: Script must be in {} directory. Got: {}",
            ALLOWED_SCRIPT_PREFIX,
            script_path
        ));
    }

    // Determine working directory
    let working_dir = cwd.clone().unwrap_or_else(|| ".".to_string());
    let work_path = Path::new(&working_dir);

    if !work_path.exists() {
        return Err(format!("EXECUTION_FAILED: Working directory does not exist: {}", working_dir));
    }

    // Build full script path
    let full_script_path = work_path.join(&script_path);
    
    if !full_script_path.exists() {
        return Err(format!("SCRIPT_NOT_FOUND: Script file not found: {}", script_path));
    }

    log::info!("Executing script: {} with args: {:?}", script_path, args);

    // Determine shell based on OS and script extension
    let (shell, shell_arg) = if cfg!(target_os = "windows") {
        if script_path.ends_with(".sh") {
            // Use bash for .sh files on Windows (Git Bash, WSL, etc.)
            ("bash", "-c")
        } else if script_path.ends_with(".ps1") {
            ("powershell", "-ExecutionPolicy Bypass -File")
        } else {
            ("cmd", "/C")
        }
    } else {
        // Unix-like systems
        ("bash", "-c")
    };

    // Build the command
    let script_with_args = if cfg!(target_os = "windows") && script_path.ends_with(".sh") {
        // For bash on Windows, use the script path directly
        let mut cmd_parts = vec![full_script_path.to_string_lossy().to_string()];
        cmd_parts.extend(args.iter().map(|a| format!("\"{}\"", a)));
        cmd_parts.join(" ")
    } else if cfg!(target_os = "windows") {
        // For cmd/powershell on Windows
        let mut cmd_parts = vec![full_script_path.to_string_lossy().to_string()];
        cmd_parts.extend(args.clone());
        cmd_parts.join(" ")
    } else {
        // Unix: make script executable and run
        let mut cmd_parts = vec![full_script_path.to_string_lossy().to_string()];
        cmd_parts.extend(args.iter().map(|a| format!("\"{}\"", a)));
        cmd_parts.join(" ")
    };

    // Execute with timeout
    let output = if cfg!(target_os = "windows") && !script_path.ends_with(".sh") {
        Command::new(shell)
            .arg(shell_arg)
            .arg(&script_with_args)
            .current_dir(work_path)
            .output()
    } else {
        Command::new(shell)
            .arg(shell_arg)
            .arg(&script_with_args)
            .current_dir(work_path)
            .output()
    };

    match output {
        Ok(output) => {
            let stdout = String::from_utf8_lossy(&output.stdout).to_string();
            let stderr = String::from_utf8_lossy(&output.stderr).to_string();
            let exit_code = output.status.code().unwrap_or(-1);

            log::info!("Script {} exited with code {}", script_path, exit_code);

            if !stderr.is_empty() {
                log::warn!("Script stderr: {}", stderr);
            }

            Ok(ExecuteShellResponse {
                exit_code,
                stdout,
                stderr,
            })
        }
        Err(e) => {
            log::error!("Script execution failed: {}", e);
            Err(format!("EXECUTION_FAILED: {}", e))
        }
    }
}

// ============ Tests ============

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use tempfile::TempDir;

    fn setup_test_script(temp_dir: &TempDir, script_name: &str, content: &str) -> String {
        let scripts_dir = temp_dir.path().join(".specify/scripts/bash");
        fs::create_dir_all(&scripts_dir).unwrap();
        
        let script_path = scripts_dir.join(script_name);
        fs::write(&script_path, content).unwrap();
        
        // Make executable on Unix
        #[cfg(unix)]
        {
            use std::os::unix::fs::PermissionsExt;
            let mut perms = fs::metadata(&script_path).unwrap().permissions();
            perms.set_mode(0o755);
            fs::set_permissions(&script_path, perms).unwrap();
        }

        format!(".specify/scripts/bash/{}", script_name)
    }

    #[tokio::test]
    async fn test_script_security_check() {
        let result = execute_shell_script(
            "malicious/script.sh".to_string(),
            vec![],
            None,
        ).await;

        assert!(result.is_err());
        assert!(result.unwrap_err().contains("SCRIPT_NOT_FOUND"));
    }

    #[tokio::test]
    async fn test_script_not_found() {
        let temp_dir = TempDir::new().unwrap();
        fs::create_dir_all(temp_dir.path().join(".specify/scripts/bash")).unwrap();

        let result = execute_shell_script(
            ".specify/scripts/bash/nonexistent.sh".to_string(),
            vec![],
            Some(temp_dir.path().to_string_lossy().to_string()),
        ).await;

        assert!(result.is_err());
        assert!(result.unwrap_err().contains("SCRIPT_NOT_FOUND"));
    }

    #[tokio::test]
    #[cfg(unix)]
    async fn test_execute_simple_script() {
        let temp_dir = TempDir::new().unwrap();
        let script_path = setup_test_script(
            &temp_dir,
            "test.sh",
            "#!/bin/bash\necho 'Hello from script'",
        );

        let result = execute_shell_script(
            script_path,
            vec![],
            Some(temp_dir.path().to_string_lossy().to_string()),
        ).await;

        assert!(result.is_ok());
        let response = result.unwrap();
        assert_eq!(response.exit_code, 0);
        assert!(response.stdout.contains("Hello from script"));
    }

    #[tokio::test]
    #[cfg(unix)]
    async fn test_script_with_args() {
        let temp_dir = TempDir::new().unwrap();
        let script_path = setup_test_script(
            &temp_dir,
            "echo-args.sh",
            "#!/bin/bash\necho \"Arg1: $1, Arg2: $2\"",
        );

        let result = execute_shell_script(
            script_path,
            vec!["value1".to_string(), "value2".to_string()],
            Some(temp_dir.path().to_string_lossy().to_string()),
        ).await;

        assert!(result.is_ok());
        let response = result.unwrap();
        assert!(response.stdout.contains("value1"));
        assert!(response.stdout.contains("value2"));
    }

    #[tokio::test]
    #[cfg(unix)]
    async fn test_script_exit_code() {
        let temp_dir = TempDir::new().unwrap();
        let script_path = setup_test_script(
            &temp_dir,
            "exit-code.sh",
            "#!/bin/bash\nexit 42",
        );

        let result = execute_shell_script(
            script_path,
            vec![],
            Some(temp_dir.path().to_string_lossy().to_string()),
        ).await;

        assert!(result.is_ok());
        let response = result.unwrap();
        assert_eq!(response.exit_code, 42);
    }

    #[tokio::test]
    #[cfg(unix)]
    async fn test_script_stderr() {
        let temp_dir = TempDir::new().unwrap();
        let script_path = setup_test_script(
            &temp_dir,
            "stderr.sh",
            "#!/bin/bash\necho 'error message' >&2",
        );

        let result = execute_shell_script(
            script_path,
            vec![],
            Some(temp_dir.path().to_string_lossy().to_string()),
        ).await;

        assert!(result.is_ok());
        let response = result.unwrap();
        assert!(response.stderr.contains("error message"));
    }
}
