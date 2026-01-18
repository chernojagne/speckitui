use crate::models::{
    ArtifactManifest, ChangedFile, GitStatus, Project, RecentProject,
    SpecInstance,
};
use std::fs;
use std::path::Path;
use std::process::Command;

/// Opens a project folder and scans for spec instances
#[tauri::command]
pub async fn open_project(path: String) -> Result<Project, String> {
    let project_path = Path::new(&path);

    if !project_path.exists() {
        return Err("The specified path does not exist".to_string());
    }

    if !project_path.is_dir() {
        return Err("The path is not a directory".to_string());
    }

    let mut project = Project::new(path.clone());

    // Check for .specify directory
    let specify_path = project_path.join(".specify");
    project.has_specify_dir = specify_path.exists() && specify_path.is_dir();

    // Check for specs directory
    let specs_path = project_path.join("specs");
    project.has_specs_dir = specs_path.exists() && specs_path.is_dir();

    if !project.has_specify_dir {
        return Err("No .specify directory found. Is this a spec-kit project?".to_string());
    }

    // Get git info
    if let Ok(output) = Command::new("git")
        .args(["remote", "get-url", "origin"])
        .current_dir(&path)
        .output()
    {
        if output.status.success() {
            project.git_remote = Some(String::from_utf8_lossy(&output.stdout).trim().to_string());
        }
    }

    if let Ok(output) = Command::new("git")
        .args(["branch", "--show-current"])
        .current_dir(&path)
        .output()
    {
        if output.status.success() {
            project.git_branch = Some(String::from_utf8_lossy(&output.stdout).trim().to_string());
        }
    }

    // Scan for spec instances
    if project.has_specs_dir {
        if let Ok(entries) = fs::read_dir(&specs_path) {
            for entry in entries.flatten() {
                if entry.path().is_dir() {
                    if let Some(dir_name) = entry.file_name().to_str() {
                        if let Some(mut spec) = SpecInstance::from_dir_name(dir_name, &path) {
                            // Scan for artifacts in this spec
                            spec.artifacts = scan_artifacts(&spec.path);
                            project.spec_instances.push(spec);
                        }
                    }
                }
            }
        }
    }

    // Sort by number
    project.spec_instances.sort_by_key(|s| s.number);

    Ok(project)
}

/// Scans a spec directory for available artifacts
fn scan_artifacts(spec_path: &str) -> ArtifactManifest {
    let path = Path::new(spec_path);
    
    let mut contract_files = Vec::new();
    let mut checklist_files = Vec::new();

    // Scan contracts directory
    let contracts_path = path.join("contracts");
    if contracts_path.exists() && contracts_path.is_dir() {
        if let Ok(entries) = fs::read_dir(contracts_path) {
            for entry in entries.flatten() {
                if let Some(name) = entry.file_name().to_str() {
                    if name.ends_with(".md") {
                        contract_files.push(name.to_string());
                    }
                }
            }
        }
    }

    // Scan checklists directory
    let checklists_path = path.join("checklists");
    if checklists_path.exists() && checklists_path.is_dir() {
        if let Ok(entries) = fs::read_dir(checklists_path) {
            for entry in entries.flatten() {
                if let Some(name) = entry.file_name().to_str() {
                    if name.ends_with(".md") {
                        checklist_files.push(name.to_string());
                    }
                }
            }
        }
    }

    ArtifactManifest {
        has_spec: path.join("spec.md").exists(),
        has_plan: path.join("plan.md").exists(),
        has_research: path.join("research.md").exists(),
        has_data_model: path.join("data-model.md").exists(),
        has_quickstart: path.join("quickstart.md").exists(),
        has_tasks: path.join("tasks.md").exists(),
        contract_files,
        checklist_files,
    }
}

/// Returns list of spec instances in a project
#[tauri::command]
pub async fn get_spec_instances(project_path: String) -> Result<Vec<SpecInstance>, String> {
    let project = open_project(project_path).await?;
    Ok(project.spec_instances)
}

/// Returns list of recently opened projects
#[tauri::command]
pub async fn get_recent_projects() -> Result<Vec<RecentProject>, String> {
    // TODO: Implement with actual settings storage
    Ok(Vec::new())
}

/// Returns files changed for the current spec (git-based)
#[tauri::command]
pub async fn get_changed_files(project_path: String) -> Result<Vec<ChangedFile>, String> {
    // Get changed files using git status
    let status_output = Command::new("git")
        .args(["status", "--porcelain"])
        .current_dir(&project_path)
        .output()
        .map_err(|e| format!("Failed to get git status: {}", e))?;

    if !status_output.status.success() {
        return Err("Project is not a git repository".to_string());
    }

    let mut files = Vec::new();
    let status_str = String::from_utf8_lossy(&status_output.stdout);

    for line in status_str.lines() {
        if line.len() < 4 {
            continue;
        }

        let staged_status = line.chars().next().unwrap_or(' ');
        let unstaged_status = line.chars().nth(1).unwrap_or(' ');
        let file_path = line[3..].to_string();

        let status = match (staged_status, unstaged_status) {
            ('A', _) | (_, 'A') => "added",
            ('D', _) | (_, 'D') => "deleted",
            ('R', _) | (_, 'R') => "renamed",
            ('?', '?') => "untracked",
            _ => "modified",
        };

        files.push(ChangedFile {
            path: file_path,
            status: status.to_string(),
            staged: staged_status != ' ' && staged_status != '?',
        });
    }

    Ok(files)
}

/// Returns current git status for the project
#[tauri::command]
pub async fn get_git_status(project_path: String) -> Result<GitStatus, String> {
    // Get current branch
    let branch_output = Command::new("git")
        .args(["branch", "--show-current"])
        .current_dir(&project_path)
        .output()
        .map_err(|e| format!("Failed to get git branch: {}", e))?;

    if !branch_output.status.success() {
        return Err("Project is not a git repository".to_string());
    }

    let branch = String::from_utf8_lossy(&branch_output.stdout)
        .trim()
        .to_string();

    // Get ahead/behind counts
    let mut ahead = 0u32;
    let mut behind = 0u32;

    if let Ok(output) = Command::new("git")
        .args(["rev-list", "--left-right", "--count", "HEAD...@{upstream}"])
        .current_dir(&project_path)
        .output()
    {
        if output.status.success() {
            let output_str = String::from_utf8_lossy(&output.stdout);
            let counts: Vec<&str> = output_str
                .trim()
                .split('\t')
                .collect();
            if counts.len() == 2 {
                ahead = counts[0].parse().unwrap_or(0);
                behind = counts[1].parse().unwrap_or(0);
            }
        }
    }

    // Get status
    let status_output = Command::new("git")
        .args(["status", "--porcelain"])
        .current_dir(&project_path)
        .output()
        .map_err(|e| format!("Failed to get git status: {}", e))?;

    let mut staged = Vec::new();
    let mut unstaged = Vec::new();
    let mut untracked = Vec::new();

    let status_str = String::from_utf8_lossy(&status_output.stdout);
    for line in status_str.lines() {
        if line.len() < 4 {
            continue;
        }

        let staged_status = line.chars().next().unwrap_or(' ');
        let unstaged_status = line.chars().nth(1).unwrap_or(' ');
        let file_path = line[3..].to_string();

        if staged_status == '?' && unstaged_status == '?' {
            untracked.push(file_path);
        } else {
            if staged_status != ' ' {
                staged.push(file_path.clone());
            }
            if unstaged_status != ' ' && unstaged_status != '?' {
                unstaged.push(file_path);
            }
        }
    }

    let is_clean = staged.is_empty() && unstaged.is_empty() && untracked.is_empty();

    Ok(GitStatus {
        branch,
        is_clean,
        ahead,
        behind,
        staged,
        unstaged,
        untracked,
    })
}
