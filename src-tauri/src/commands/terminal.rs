use crate::services::TerminalManager;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tauri::State;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TerminalSession {
    pub session_id: String,
    pub shell: String,
    pub cwd: String,
    pub status: String, // "running" | "exited"
}

/// Managed state for terminal sessions
pub struct TerminalState(pub Arc<TerminalManager>);

/// Creates a new terminal session
#[tauri::command]
pub async fn create_terminal(
    app: tauri::AppHandle,
    state: State<'_, TerminalState>,
    cwd: Option<String>,
    shell: Option<String>,
) -> Result<TerminalSession, String> {
    let cwd = cwd.unwrap_or_else(|| {
        std::env::current_dir()
            .map(|p| p.to_string_lossy().to_string())
            .unwrap_or_else(|_| "/".to_string())
    });

    // Detect default shell - Windows uses cmd.exe by default
    let shell = shell.unwrap_or_else(|| {
        #[cfg(windows)]
        {
            "cmd.exe".to_string()
        }
        #[cfg(not(windows))]
        {
            std::env::var("SHELL").unwrap_or_else(|_| "/bin/bash".to_string())
        }
    });

    // Create the PTY session
    let session_id = state.0.create_session(app, cwd.clone(), shell.clone())?;

    Ok(TerminalSession {
        session_id,
        shell,
        cwd,
        status: "running".to_string(),
    })
}

/// Writes input to a terminal session
#[tauri::command]
pub async fn write_terminal(
    state: State<'_, TerminalState>,
    session_id: String,
    data: String,
) -> Result<(), String> {
    state.0.write_to_session(&session_id, &data)?;
    log::debug!("Terminal write to {}: {} bytes", session_id, data.len());
    Ok(())
}

/// Resizes a terminal session
#[tauri::command]
pub async fn resize_terminal(
    state: State<'_, TerminalState>,
    session_id: String,
    cols: u16,
    rows: u16,
) -> Result<(), String> {
    state.0.resize_session(&session_id, cols, rows)?;
    log::info!("Terminal resize {}: {}x{}", session_id, rows, cols);
    Ok(())
}

/// Closes a terminal session
#[tauri::command]
pub async fn close_terminal(
    state: State<'_, TerminalState>,
    session_id: String,
) -> Result<(), String> {
    state.0.close_session(&session_id)?;
    log::info!("Terminal closed: {}", session_id);
    Ok(())
}

/// Lists all active terminal sessions
#[tauri::command]
pub async fn list_terminals(state: State<'_, TerminalState>) -> Result<Vec<String>, String> {
    Ok(state.0.list_sessions())
}
