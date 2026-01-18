use notify::{Event, EventKind, RecommendedWatcher, RecursiveMode, Watcher};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::sync::{Arc, Mutex};
use tauri::{AppHandle, Emitter};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FileChangeEvent {
    pub path: String,
    pub change_type: String,
}

/// File watcher service for detecting external file changes
pub struct FileWatcher {
    watcher: Option<RecommendedWatcher>,
    watched_paths: Arc<Mutex<HashMap<String, PathBuf>>>,
}

impl FileWatcher {
    pub fn new() -> Self {
        Self {
            watcher: None,
            watched_paths: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    /// Start watching a directory for changes with event emission to frontend
    pub fn watch_with_events<R: tauri::Runtime>(
        &mut self,
        path: &str,
        app_handle: AppHandle<R>,
    ) -> Result<(), String> {
        let path_buf = PathBuf::from(path);
        let path_str = path.to_string();
        
        // Track watched paths
        {
            let mut paths = self.watched_paths.lock().unwrap();
            paths.insert(path_str.clone(), path_buf.clone());
        }

        let watched_paths = Arc::clone(&self.watched_paths);

        let mut watcher = notify::recommended_watcher(move |res: Result<Event, notify::Error>| {
            match res {
                Ok(event) => {
                    // Determine change type from event kind
                    let change_type = match event.kind {
                        EventKind::Create(_) => "created",
                        EventKind::Modify(_) => "modified",
                        EventKind::Remove(_) => "deleted",
                        EventKind::Any => "changed",
                        _ => return, // Ignore access and other events
                    };

                    // Emit event for each affected path
                    for path in event.paths {
                        // Skip non-relevant files
                        if let Some(ext) = path.extension() {
                            let ext_str = ext.to_string_lossy().to_lowercase();
                            // Focus on markdown and config files
                            if !["md", "json", "yaml", "yml", "toml"].contains(&ext_str.as_str()) {
                                continue;
                            }
                        } else {
                            continue; // Skip files without extension
                        }

                        // Check if path is within a watched directory
                        let is_watched = {
                            let paths = watched_paths.lock().unwrap();
                            paths.values().any(|watched| path.starts_with(watched))
                        };

                        if is_watched {
                            let file_event = FileChangeEvent {
                                path: path.to_string_lossy().to_string(),
                                change_type: change_type.to_string(),
                            };

                            // Emit to frontend
                            if let Err(e) = app_handle.emit("file-changed", file_event) {
                                log::warn!("Failed to emit file change event: {}", e);
                            }
                        }
                    }
                }
                Err(e) => {
                    log::error!("File watcher error: {:?}", e);
                }
            }
        })
        .map_err(|e| format!("Failed to create watcher: {}", e))?;

        watcher
            .watch(Path::new(path), RecursiveMode::Recursive)
            .map_err(|e| format!("Failed to watch path: {}", e))?;

        self.watcher = Some(watcher);
        
        log::info!("Started watching path: {}", path);
        Ok(())
    }

    /// Start watching a directory for changes (basic version without events)
    pub fn watch(&mut self, path: &str) -> Result<(), String> {
        use std::sync::mpsc::channel;
        
        let (tx, _rx) = channel();

        let mut watcher = notify::recommended_watcher(move |res| {
            if let Ok(event) = res {
                let _ = tx.send(event);
            }
        })
        .map_err(|e| format!("Failed to create watcher: {}", e))?;

        watcher
            .watch(Path::new(path), RecursiveMode::Recursive)
            .map_err(|e| format!("Failed to watch path: {}", e))?;

        self.watcher = Some(watcher);
        Ok(())
    }

    /// Stop watching
    pub fn unwatch(&mut self) {
        self.watcher = None;
        if let Ok(mut paths) = self.watched_paths.lock() {
            paths.clear();
        }
    }

    /// Check if a specific file has been modified since a given timestamp
    pub fn check_file_modified(path: &str, since: std::time::SystemTime) -> Result<bool, String> {
        let metadata = std::fs::metadata(path)
            .map_err(|e| format!("Failed to get file metadata: {}", e))?;
        
        let modified = metadata.modified()
            .map_err(|e| format!("Failed to get modification time: {}", e))?;
        
        Ok(modified > since)
    }
}

impl Default for FileWatcher {
    fn default() -> Self {
        Self::new()
    }
}

/// Managed state for file watcher
pub struct FileWatcherState(pub Arc<Mutex<FileWatcher>>);
