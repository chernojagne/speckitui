use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;
use tauri::{AppHandle, Emitter};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NetworkStatus {
    pub is_online: bool,
    pub github_reachable: bool,
}

/// Network monitor service for detecting connectivity status
pub struct NetworkMonitor {
    is_running: Arc<Mutex<bool>>,
    last_status: Arc<Mutex<NetworkStatus>>,
}

impl NetworkMonitor {
    pub fn new() -> Self {
        Self {
            is_running: Arc::new(Mutex::new(false)),
            last_status: Arc::new(Mutex::new(NetworkStatus {
                is_online: true,
                github_reachable: true,
            })),
        }
    }

    /// Check if GitHub API is reachable
    pub async fn check_github_reachable() -> bool {
        let client = reqwest::Client::builder()
            .timeout(Duration::from_secs(5))
            .build();

        match client {
            Ok(client) => {
                match client.get("https://api.github.com").send().await {
                    Ok(response) => response.status().is_success() || response.status().as_u16() == 403,
                    Err(_) => false,
                }
            }
            Err(_) => false,
        }
    }

    /// Get current network status
    pub fn get_status(&self) -> NetworkStatus {
        self.last_status.lock().unwrap().clone()
    }

    /// Start periodic network monitoring
    pub fn start_monitoring<R: tauri::Runtime + 'static>(
        &self,
        app_handle: AppHandle<R>,
        interval_secs: u64,
    ) {
        let is_running = Arc::clone(&self.is_running);
        let last_status = Arc::clone(&self.last_status);

        // Set running flag
        {
            let mut running = is_running.lock().unwrap();
            if *running {
                return; // Already running
            }
            *running = true;
        }

        thread::spawn(move || {
            let rt = tokio::runtime::Builder::new_current_thread()
                .enable_all()
                .build()
                .expect("Failed to create runtime");

            loop {
                // Check if we should stop
                {
                    let running = is_running.lock().unwrap();
                    if !*running {
                        break;
                    }
                }

                // Check network status
                let github_reachable = rt.block_on(Self::check_github_reachable());
                
                let new_status = NetworkStatus {
                    is_online: github_reachable, // Simple check - if GitHub is reachable, we're online
                    github_reachable,
                };

                // Check if status changed
                let status_changed = {
                    let mut current = last_status.lock().unwrap();
                    let changed = current.is_online != new_status.is_online
                        || current.github_reachable != new_status.github_reachable;
                    *current = new_status.clone();
                    changed
                };

                // Emit event if status changed
                if status_changed {
                    if let Err(e) = app_handle.emit("network-status-changed", new_status) {
                        log::warn!("Failed to emit network status event: {}", e);
                    }
                }

                thread::sleep(Duration::from_secs(interval_secs));
            }
        });
    }

    /// Stop network monitoring
    pub fn stop_monitoring(&self) {
        let mut running = self.is_running.lock().unwrap();
        *running = false;
    }
}

impl Default for NetworkMonitor {
    fn default() -> Self {
        Self::new()
    }
}

/// Managed state for network monitor
pub struct NetworkMonitorState(pub Arc<NetworkMonitor>);
