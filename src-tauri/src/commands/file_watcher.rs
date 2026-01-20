use crate::services::file_watcher::FileWatcherState;
use tauri::{AppHandle, State};

/// Start watching a project directory for file changes
#[tauri::command]
pub async fn start_file_watcher<R: tauri::Runtime>(
    state: State<'_, FileWatcherState>,
    app_handle: AppHandle<R>,
    path: String,
) -> Result<(), String> {
    let mut watcher = state.0.lock().map_err(|e| format!("Lock error: {}", e))?;
    watcher.watch_with_events(&path, app_handle)?;
    Ok(())
}

/// Stop watching for file changes
#[tauri::command]
pub async fn stop_file_watcher(state: State<'_, FileWatcherState>) -> Result<(), String> {
    let mut watcher = state.0.lock().map_err(|e| format!("Lock error: {}", e))?;
    watcher.unwatch();
    Ok(())
}

/// Watch artifact files in a spec directory
/// This sets up watching for markdown files in the spec directory
#[tauri::command]
pub async fn watch_artifact_files<R: tauri::Runtime>(
    state: State<'_, FileWatcherState>,
    app_handle: AppHandle<R>,
    spec_dir: String,
    _files: Vec<String>, // Files to watch - for future filtering
) -> Result<String, String> {
    let mut watcher = state.0.lock().map_err(|e| format!("Lock error: {}", e))?;
    watcher.watch_with_events(&spec_dir, app_handle)?;
    // Return a watch ID for tracking
    Ok(spec_dir)
}

/// Stop watching artifact files
#[tauri::command]
pub async fn unwatch_artifact_files(
    state: State<'_, FileWatcherState>,
    _watch_id: String,
) -> Result<(), String> {
    let mut watcher = state.0.lock().map_err(|e| format!("Lock error: {}", e))?;
    watcher.unwatch();
    Ok(())
}
