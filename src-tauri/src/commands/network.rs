use crate::services::network_monitor::{NetworkMonitorState, NetworkStatus};
use tauri::{AppHandle, State};

/// Get current network status
#[tauri::command]
pub async fn get_network_status(state: State<'_, NetworkMonitorState>) -> Result<NetworkStatus, String> {
    Ok(state.0.get_status())
}

/// Start network monitoring with periodic checks
#[tauri::command]
pub async fn start_network_monitoring<R: tauri::Runtime>(
    state: State<'_, NetworkMonitorState>,
    app_handle: AppHandle<R>,
    interval_secs: Option<u64>,
) -> Result<(), String> {
    let interval = interval_secs.unwrap_or(30);
    state.0.start_monitoring(app_handle, interval);
    Ok(())
}

/// Stop network monitoring
#[tauri::command]
pub async fn stop_network_monitoring(state: State<'_, NetworkMonitorState>) -> Result<(), String> {
    state.0.stop_monitoring();
    Ok(())
}

/// Check if GitHub is reachable (one-time check)
#[tauri::command]
pub async fn check_github_reachable() -> Result<bool, String> {
    use crate::services::NetworkMonitor;
    Ok(NetworkMonitor::check_github_reachable().await)
}
