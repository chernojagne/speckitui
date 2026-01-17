use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::Manager;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AppSettings {
    pub recent_projects: Vec<String>,
    pub last_project_path: Option<String>,
    pub last_spec_id: Option<String>,
    pub terminal_panel_height: u32,
    pub terminal_panel_collapsed: bool,
    pub theme: String,
}

fn get_settings_path(app: &tauri::AppHandle) -> PathBuf {
    let config_dir = app.path().app_config_dir().expect("Failed to get config dir");
    fs::create_dir_all(&config_dir).ok();
    config_dir.join("settings.json")
}

/// Loads application settings
#[tauri::command]
pub async fn load_settings(app: tauri::AppHandle) -> Result<AppSettings, String> {
    let settings_path = get_settings_path(&app);

    if !settings_path.exists() {
        return Ok(AppSettings {
            terminal_panel_height: 200,
            terminal_panel_collapsed: true,
            theme: "system".to_string(),
            ..Default::default()
        });
    }

    let content = fs::read_to_string(&settings_path)
        .map_err(|e| format!("Failed to read settings: {}", e))?;

    serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse settings: {}", e))
}

/// Saves application settings
#[tauri::command]
pub async fn save_settings(app: tauri::AppHandle, settings: AppSettings) -> Result<(), String> {
    let settings_path = get_settings_path(&app);

    let content = serde_json::to_string_pretty(&settings)
        .map_err(|e| format!("Failed to serialize settings: {}", e))?;

    fs::write(&settings_path, content)
        .map_err(|e| format!("Failed to write settings: {}", e))
}
