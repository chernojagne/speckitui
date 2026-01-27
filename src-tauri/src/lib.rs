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
    let terminal_manager_clone = terminal_manager.clone();
    
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
        .on_window_event(move |_window, event| {
            // Clean up all terminal sessions when window is closing
            if let tauri::WindowEvent::Destroyed = event {
                log::info!("Window closing - cleaning up terminal sessions");
                terminal_manager_clone.close_all_sessions();
            }
        })
        .invoke_handler(tauri::generate_handler![
            // Project commands
            project::open_project,
            project::get_spec_instances,
            project::get_recent_projects,
            project::get_changed_files,
            project::get_git_status,
            project::create_spec,
            // Artifact commands
            artifacts::read_artifact,
            artifacts::write_artifact,
            artifacts::update_checkbox,
            artifacts::list_directory,
            artifacts::read_source_file,
            // Description commands
            description::save_description,
            description::load_description,
            description::save_description_file,
            description::load_description_file,
            // Terminal commands
            terminal::create_terminal,
            terminal::write_terminal,
            terminal::resize_terminal,
            terminal::close_terminal,
            terminal::list_terminals,
            // File watcher commands
            file_watcher::start_file_watcher,
            file_watcher::stop_file_watcher,
            file_watcher::watch_artifact_files,
            file_watcher::unwatch_artifact_files,
            // Network commands
            network::get_network_status,
            network::start_network_monitoring,
            network::stop_network_monitoring,
            network::check_github_reachable,
            // Git commands
            git::get_git_branch,
            git::get_git_file_status,
            // GitHub commands
            github::check_github_auth,
            github::set_github_token,
            github::clear_github_token,
            github::github_login,
            github::github_logout,
            github::github_oauth_start,
            github::github_oauth_complete,
            github::get_pull_requests,
            github::get_pr_comments,
            github::get_issues,
            github::get_issue_detail,
            // Settings commands
            settings::load_settings,
            settings::save_settings,
            // File write commands (005-ui-enhancements)
            file_write::write_file,
            file_write::create_directory,
            file_write::update_agent_context,
            file_write::save_attachment,
            file_write::write_feature_context,
            // Shell execution commands (005-ui-enhancements)
            shell_exec::execute_shell_script,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
