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
