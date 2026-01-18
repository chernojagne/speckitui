// Module declarations
pub mod commands;
pub mod models;
pub mod services;

use commands::*;
use commands::terminal::TerminalState;
use commands::github::GitHubState;
use services::{TerminalManager, GitHubClient, FileWatcher, NetworkMonitor};
use services::file_watcher::FileWatcherState;
use services::network_monitor::NetworkMonitorState;
use std::sync::{Arc, Mutex};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Create terminal manager
    let terminal_manager = Arc::new(TerminalManager::new());
    
    // Create GitHub client
    let github_client = Arc::new(GitHubClient::new());
    
    // Create file watcher
    let file_watcher = Arc::new(Mutex::new(FileWatcher::new()));
    
    // Create network monitor
    let network_monitor = Arc::new(NetworkMonitor::new());

    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .manage(TerminalState(terminal_manager))
        .manage(GitHubState(github_client))
        .manage(FileWatcherState(file_watcher))
        .manage(NetworkMonitorState(network_monitor))
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .target(tauri_plugin_log::Target::new(
                            tauri_plugin_log::TargetKind::Stdout,
                        ))
                        .build(),
                )?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // Project commands
            project::open_project,
            project::get_spec_instances,
            project::get_recent_projects,
            project::get_changed_files,
            project::get_git_status,
            // Artifact commands
            artifacts::read_artifact,
            artifacts::write_artifact,
            artifacts::update_checkbox,
            artifacts::list_directory,
            artifacts::read_source_file,
            // Terminal commands
            terminal::create_terminal,
            terminal::write_terminal,
            terminal::resize_terminal,
            terminal::close_terminal,
            terminal::list_terminals,
            // File watcher commands
            file_watcher::start_file_watcher,
            file_watcher::stop_file_watcher,
            // Network commands
            network::get_network_status,
            network::start_network_monitoring,
            network::stop_network_monitoring,
            network::check_github_reachable,
            // GitHub commands
            github::check_github_auth,
            github::set_github_token,
            github::clear_github_token,
            github::github_oauth_start,
            github::github_oauth_complete,
            github::get_pull_requests,
            github::get_pr_comments,
            github::get_issues,
            github::get_issue_detail,
            // Settings commands
            settings::load_settings,
            settings::save_settings,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
