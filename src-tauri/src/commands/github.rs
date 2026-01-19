use crate::services::GitHubClient;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tauri::State;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GitHubAuth {
    pub is_authenticated: bool,
    pub login: Option<String>,
    pub avatar_url: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PullRequest {
    pub number: u32,
    pub title: String,
    pub state: String,
    pub url: String,
    pub author: String,
    pub branch: String,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PRComment {
    pub id: u64,
    pub author: String,
    pub body: String,
    pub path: Option<String>,
    pub line: Option<u32>,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GitHubIssue {
    pub number: u32,
    pub title: String,
    pub body: String,
    pub state: String,
    pub labels: Vec<String>,
    pub author: String,
    pub url: String,
    pub created_at: String,
    pub comment_count: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeviceCodeResponse {
    pub device_code: String,
    pub user_code: String,
    pub verification_uri: String,
    pub expires_in: u32,
    pub interval: u32,
}

/// Managed state for GitHub client
pub struct GitHubState(pub Arc<GitHubClient>);

/// Extracts owner and repo from a git remote URL or project path
fn extract_owner_repo(project_path: &str) -> Result<(String, String), String> {
    use std::process::Command;
    
    log::info!("Extracting owner/repo from project path: {}", project_path);
    
    // Try to get the git remote URL
    let output = Command::new("git")
        .args(["-C", project_path, "remote", "get-url", "origin"])
        .output()
        .map_err(|e| format!("Failed to run git: {}", e))?;
    
    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        log::error!("Git command failed: {}", stderr);
        return Err(format!("No git remote 'origin' found: {}", stderr));
    }
    
    let remote_url = String::from_utf8_lossy(&output.stdout).trim().to_string();
    log::info!("Got remote URL: {}", remote_url);
    parse_github_url(&remote_url)
}

/// Parses a GitHub URL to extract owner and repo
fn parse_github_url(url: &str) -> Result<(String, String), String> {
    // Handle SSH format: git@github.com:owner/repo.git
    if url.starts_with("git@github.com:") {
        let path = url.trim_start_matches("git@github.com:");
        let path = path.trim_end_matches(".git");
        let parts: Vec<&str> = path.split('/').collect();
        if parts.len() >= 2 {
            return Ok((parts[0].to_string(), parts[1].to_string()));
        }
    }
    
    // Handle HTTPS format: https://github.com/owner/repo.git
    if url.contains("github.com") {
        let path = url
            .trim_start_matches("https://github.com/")
            .trim_start_matches("http://github.com/")
            .trim_end_matches(".git");
        let parts: Vec<&str> = path.split('/').collect();
        if parts.len() >= 2 {
            return Ok((parts[0].to_string(), parts[1].to_string()));
        }
    }
    
    Err(format!("Could not parse GitHub URL: {}", url))
}

/// Sets the GitHub token
#[tauri::command]
pub async fn set_github_token(
    state: State<'_, GitHubState>,
    token: String,
) -> Result<(), String> {
    state.0.set_token(token);
    Ok(())
}

/// Clears the GitHub token
#[tauri::command]
pub async fn clear_github_token(state: State<'_, GitHubState>) -> Result<(), String> {
    state.0.clear_token();
    Ok(())
}

/// Runs `gh auth login` to authenticate with GitHub
/// This opens the browser for the OAuth flow
#[tauri::command]
pub async fn github_login(state: State<'_, GitHubState>) -> Result<GitHubAuth, String> {
    use std::process::Command;
    
    log::info!("Starting gh auth login...");
    
    // Run gh auth login with web flow
    #[cfg(windows)]
    let result = Command::new("cmd")
        .args(["/C", "gh", "auth", "login", "--web", "-h", "github.com"])
        .status();
    
    #[cfg(not(windows))]
    let result = Command::new("gh")
        .args(["auth", "login", "--web", "-h", "github.com"])
        .status();
    
    match result {
        Ok(status) => {
            if status.success() {
                log::info!("gh auth login completed successfully");
                // Refresh token from CLI
                state.0.refresh_from_cli();
                // Return updated auth status
                check_github_auth(state).await
            } else {
                Err("GitHub login was cancelled or failed".to_string())
            }
        }
        Err(e) => {
            log::error!("Failed to run gh auth login: {}", e);
            Err(format!("Failed to run gh CLI: {}. Is gh installed?", e))
        }
    }
}

/// Runs `gh auth logout` to log out from GitHub
#[tauri::command]
pub async fn github_logout(state: State<'_, GitHubState>) -> Result<(), String> {
    use std::process::Command;
    
    log::info!("Starting gh auth logout...");
    
    // Clear local token first
    state.0.clear_token();
    
    // Run gh auth logout
    #[cfg(windows)]
    let result = Command::new("cmd")
        .args(["/C", "gh", "auth", "logout", "-h", "github.com"])
        .status();
    
    #[cfg(not(windows))]
    let result = Command::new("gh")
        .args(["auth", "logout", "-h", "github.com"])
        .status();
    
    match result {
        Ok(status) => {
            if status.success() {
                log::info!("gh auth logout completed successfully");
                Ok(())
            } else {
                // Even if gh logout fails, we've cleared the local token
                log::warn!("gh auth logout returned non-zero status");
                Ok(())
            }
        }
        Err(e) => {
            log::error!("Failed to run gh auth logout: {}", e);
            // Still return Ok since we cleared the local token
            Ok(())
        }
    }
}

/// Checks GitHub authentication status
#[tauri::command]
pub async fn check_github_auth(state: State<'_, GitHubState>) -> Result<GitHubAuth, String> {
    // If not authenticated, try to refresh from gh CLI
    if !state.0.is_authenticated() {
        state.0.refresh_from_cli();
    }
    
    if !state.0.is_authenticated() {
        return Ok(GitHubAuth {
            is_authenticated: false,
            login: None,
            avatar_url: None,
        });
    }

    match state.0.get_user().await {
        Ok(user) => Ok(GitHubAuth {
            is_authenticated: true,
            login: Some(user.login),
            avatar_url: user.avatar_url,
        }),
        Err(e) => {
            log::warn!("GitHub auth check failed: {}", e);
            Ok(GitHubAuth {
                is_authenticated: false,
                login: None,
                avatar_url: None,
            })
        }
    }
}

/// Starts the GitHub OAuth device flow
/// Returns a device code and user code for the user to enter at github.com/login/device
#[tauri::command]
pub async fn github_oauth_start(client_id: String) -> Result<DeviceCodeResponse, String> {
    let client = reqwest::Client::new();
    
    let response = client
        .post("https://github.com/login/device/code")
        .header("Accept", "application/json")
        .form(&[
            ("client_id", client_id.as_str()),
            ("scope", "repo read:user"),
        ])
        .send()
        .await
        .map_err(|e| format!("Failed to start OAuth: {}", e))?;

    if !response.status().is_success() {
        return Err(format!("GitHub returned error: {}", response.status()));
    }

    let device_response: DeviceCodeResponse = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse response: {}", e))?;

    Ok(device_response)
}

/// Polls for OAuth token after user authorizes the device
/// Returns the access token once authorization is complete
#[tauri::command]
pub async fn github_oauth_complete(
    state: State<'_, GitHubState>,
    client_id: String,
    device_code: String,
) -> Result<GitHubAuth, String> {
    let client = reqwest::Client::new();
    
    #[derive(Deserialize)]
    #[allow(dead_code)]
    struct TokenResponse {
        access_token: Option<String>,
        error: Option<String>,
        error_description: Option<String>,
    }

    let response = client
        .post("https://github.com/login/oauth/access_token")
        .header("Accept", "application/json")
        .form(&[
            ("client_id", client_id.as_str()),
            ("device_code", device_code.as_str()),
            ("grant_type", "urn:ietf:params:oauth:grant-type:device_code"),
        ])
        .send()
        .await
        .map_err(|e| format!("Failed to get token: {}", e))?;

    if !response.status().is_success() {
        return Err(format!("GitHub returned error: {}", response.status()));
    }

    let token_response: TokenResponse = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse token response: {}", e))?;

    if let Some(error) = token_response.error {
        // Common errors during polling:
        // - "authorization_pending" - user hasn't authorized yet
        // - "slow_down" - polling too fast
        // - "expired_token" - device code expired
        // - "access_denied" - user denied authorization
        return Err(error);
    }

    if let Some(token) = token_response.access_token {
        state.0.set_token(token);
        
        // Fetch user info
        match state.0.get_user().await {
            Ok(user) => Ok(GitHubAuth {
                is_authenticated: true,
                login: Some(user.login),
                avatar_url: user.avatar_url,
            }),
            Err(e) => Err(format!("Failed to get user info: {}", e)),
        }
    } else {
        Err("No access token in response".to_string())
    }
}

/// Gets pull requests for the repository
#[tauri::command]
pub async fn get_pull_requests(
    state: State<'_, GitHubState>,
    #[allow(non_snake_case)]
    projectPath: String,
    branch: Option<String>,
) -> Result<Vec<PullRequest>, String> {
    let (owner, repo) = extract_owner_repo(&projectPath)?;
    log::info!("Fetching PRs for {}/{}", owner, repo);
    
    let prs = state.0.get_pull_requests(&owner, &repo, Some("open")).await?;
    
    let result: Vec<PullRequest> = prs
        .into_iter()
        .filter(|pr| {
            if let Some(ref branch) = branch {
                pr.head.branch_ref == *branch
            } else {
                true
            }
        })
        .map(|pr| PullRequest {
            number: pr.number,
            title: pr.title,
            state: pr.state,
            url: pr.html_url,
            author: pr.user.login,
            branch: pr.head.branch_ref,
            created_at: pr.created_at,
        })
        .collect();
    
    Ok(result)
}

/// Gets comments for a pull request
#[tauri::command]
pub async fn get_pr_comments(
    state: State<'_, GitHubState>,
    #[allow(non_snake_case)]
    projectPath: String,
    #[allow(non_snake_case)]
    prNumber: u32,
) -> Result<Vec<PRComment>, String> {
    let (owner, repo) = extract_owner_repo(&projectPath)?;
    log::info!("Fetching PR comments for {}/{} #{}", owner, repo, prNumber);
    
    let comments = state.0.get_pr_comments(&owner, &repo, prNumber).await?;
    
    Ok(comments
        .into_iter()
        .map(|c| PRComment {
            id: c.id,
            author: c.user.login,
            body: c.body,
            path: c.path,
            line: c.line,
            created_at: c.created_at,
        })
        .collect())
}

/// Gets issues for the repository
#[tauri::command]
pub async fn get_issues(
    state: State<'_, GitHubState>,
    #[allow(non_snake_case)]
    projectPath: String,
    #[allow(non_snake_case)]
    issueState: Option<String>,
    labels: Option<Vec<String>>,
) -> Result<Vec<GitHubIssue>, String> {
    let (owner, repo) = extract_owner_repo(&projectPath)?;
    log::info!("Fetching issues for {}/{}", owner, repo);
    
    let issues = state.0.get_issues(
        &owner,
        &repo,
        issueState.as_deref(),
        labels.as_deref(),
    ).await?;
    
    Ok(issues
        .into_iter()
        .map(|issue| GitHubIssue {
            number: issue.number,
            title: issue.title,
            body: issue.body.unwrap_or_default(),
            state: issue.state,
            labels: issue.labels.into_iter().map(|l| l.name).collect(),
            author: issue.user.login,
            url: issue.html_url,
            created_at: issue.created_at,
            comment_count: issue.comments,
        })
        .collect())
}

/// Gets details for a specific issue
#[tauri::command]
pub async fn get_issue_detail(
    state: State<'_, GitHubState>,
    #[allow(non_snake_case)]
    projectPath: String,
    #[allow(non_snake_case)]
    issueNumber: u32,
) -> Result<GitHubIssue, String> {
    let (owner, repo) = extract_owner_repo(&projectPath)?;
    log::info!("Fetching issue {}/{} #{}", owner, repo, issueNumber);
    
    let issue = state.0.get_issue(&owner, &repo, issueNumber).await?;
    
    Ok(GitHubIssue {
        number: issue.number,
        title: issue.title,
        body: issue.body.unwrap_or_default(),
        state: issue.state,
        labels: issue.labels.into_iter().map(|l| l.name).collect(),
        author: issue.user.login,
        url: issue.html_url,
        created_at: issue.created_at,
        comment_count: issue.comments,
    })
}
