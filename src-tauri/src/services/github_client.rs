use reqwest::header::{HeaderMap, HeaderValue, ACCEPT, AUTHORIZATION, USER_AGENT};
use serde::{Deserialize, Serialize};
use std::sync::Mutex;

/// GitHub API response types
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GitHubUser {
    pub login: String,
    pub avatar_url: Option<String>,
    pub name: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GitHubPullRequest {
    pub number: u32,
    pub title: String,
    pub state: String,
    pub html_url: String,
    pub user: GitHubUser,
    pub head: GitHubBranch,
    pub base: GitHubBranch,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GitHubBranch {
    #[serde(rename = "ref")]
    pub branch_ref: String,
    pub sha: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GitHubComment {
    pub id: u64,
    pub user: GitHubUser,
    pub body: String,
    pub path: Option<String>,
    pub line: Option<u32>,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GitHubIssueRaw {
    pub number: u32,
    pub title: String,
    pub body: Option<String>,
    pub state: String,
    pub labels: Vec<GitHubLabel>,
    pub user: GitHubUser,
    pub html_url: String,
    pub created_at: String,
    pub comments: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GitHubLabel {
    pub name: String,
    pub color: String,
}

/// GitHub API client service
/// Uses reqwest for HTTP requests to GitHub REST API
pub struct GitHubClient {
    token: Mutex<Option<String>>,
    base_url: String,
    client: reqwest::Client,
}

impl GitHubClient {
    pub fn new() -> Self {
        // Try to get token from gh CLI on initialization
        let initial_token = Self::get_gh_cli_token();
        
        Self {
            token: Mutex::new(initial_token),
            base_url: "https://api.github.com".to_string(),
            client: reqwest::Client::new(),
        }
    }
    
    /// Attempts to read the GitHub token from the gh CLI
    fn get_gh_cli_token() -> Option<String> {
        use std::process::Command;
        
        // On Windows, try multiple approaches to find gh
        #[cfg(windows)]
        {
            // Try gh.exe directly first
            if let Some(token) = Self::try_gh_command("gh.exe") {
                return Some(token);
            }
            // Try through cmd.exe (picks up PATH properly)
            if let Ok(output) = Command::new("cmd")
                .args(["/C", "gh", "auth", "token"])
                .output()
            {
                if output.status.success() {
                    let token = String::from_utf8_lossy(&output.stdout).trim().to_string();
                    if !token.is_empty() {
                        log::info!("Successfully loaded GitHub token from gh CLI (via cmd)");
                        return Some(token);
                    }
                }
            }
        }
        
        // Unix/Mac or fallback
        Self::try_gh_command("gh")
    }
    
    fn try_gh_command(cmd: &str) -> Option<String> {
        use std::process::Command;
        
        match Command::new(cmd).args(["auth", "token"]).output() {
            Ok(output) => {
                if output.status.success() {
                    let token = String::from_utf8_lossy(&output.stdout).trim().to_string();
                    if !token.is_empty() {
                        log::info!("Successfully loaded GitHub token from gh CLI");
                        return Some(token);
                    }
                } else {
                    let stderr = String::from_utf8_lossy(&output.stderr);
                    log::warn!("gh auth token failed: {}", stderr);
                }
            }
            Err(e) => {
                log::warn!("Failed to run gh command '{}': {}", cmd, e);
            }
        }
        None
    }
    
    /// Refreshes the token from gh CLI
    pub fn refresh_from_cli(&self) -> bool {
        if let Some(token) = Self::get_gh_cli_token() {
            self.set_token(token);
            true
        } else {
            false
        }
    }

    pub fn set_token(&self, token: String) {
        let mut t = self.token.lock().unwrap();
        *t = Some(token);
    }

    pub fn clear_token(&self) {
        let mut t = self.token.lock().unwrap();
        *t = None;
    }

    pub fn is_authenticated(&self) -> bool {
        self.token.lock().unwrap().is_some()
    }

    fn get_headers(&self) -> Result<HeaderMap, String> {
        let mut headers = HeaderMap::new();
        headers.insert(USER_AGENT, HeaderValue::from_static("SpeckitUI/0.1.1"));
        headers.insert(ACCEPT, HeaderValue::from_static("application/vnd.github.v3+json"));
        
        if let Some(token) = self.token.lock().unwrap().as_ref() {
            headers.insert(
                AUTHORIZATION,
                HeaderValue::from_str(&format!("Bearer {}", token))
                    .map_err(|e| format!("Invalid token: {}", e))?,
            );
        }
        
        Ok(headers)
    }

    /// Gets the authenticated user
    pub async fn get_user(&self) -> Result<GitHubUser, String> {
        let headers = self.get_headers()?;
        
        let response = self.client
            .get(format!("{}/user", self.base_url))
            .headers(headers)
            .send()
            .await
            .map_err(|e| format!("Failed to fetch user: {}", e))?;

        if !response.status().is_success() {
            return Err(format!("GitHub API error: {}", response.status()));
        }

        response.json().await.map_err(|e| format!("Failed to parse user: {}", e))
    }

    /// Gets pull requests for a repository
    pub async fn get_pull_requests(
        &self,
        owner: &str,
        repo: &str,
        state: Option<&str>,
    ) -> Result<Vec<GitHubPullRequest>, String> {
        let headers = self.get_headers()?;
        let state = state.unwrap_or("open");
        
        let response = self.client
            .get(format!("{}/repos/{}/{}/pulls?state={}", self.base_url, owner, repo, state))
            .headers(headers)
            .send()
            .await
            .map_err(|e| format!("Failed to fetch PRs: {}", e))?;

        if !response.status().is_success() {
            return Err(format!("GitHub API error: {}", response.status()));
        }

        response.json().await.map_err(|e| format!("Failed to parse PRs: {}", e))
    }

    /// Gets comments for a pull request
    pub async fn get_pr_comments(
        &self,
        owner: &str,
        repo: &str,
        pr_number: u32,
    ) -> Result<Vec<GitHubComment>, String> {
        let headers = self.get_headers()?;
        
        // Get both issue comments and review comments
        let issue_comments: Vec<GitHubComment> = self.client
            .get(format!("{}/repos/{}/{}/issues/{}/comments", self.base_url, owner, repo, pr_number))
            .headers(headers.clone())
            .send()
            .await
            .map_err(|e| format!("Failed to fetch comments: {}", e))?
            .json()
            .await
            .unwrap_or_default();

        let review_comments: Vec<GitHubComment> = self.client
            .get(format!("{}/repos/{}/{}/pulls/{}/comments", self.base_url, owner, repo, pr_number))
            .headers(headers)
            .send()
            .await
            .map_err(|e| format!("Failed to fetch review comments: {}", e))?
            .json()
            .await
            .unwrap_or_default();

        let mut all_comments = issue_comments;
        all_comments.extend(review_comments);
        all_comments.sort_by(|a, b| a.created_at.cmp(&b.created_at));
        
        Ok(all_comments)
    }

    /// Gets issues for a repository
    pub async fn get_issues(
        &self,
        owner: &str,
        repo: &str,
        state: Option<&str>,
        labels: Option<&[String]>,
    ) -> Result<Vec<GitHubIssueRaw>, String> {
        let headers = self.get_headers()?;
        let state = state.unwrap_or("open");
        
        let mut url = format!("{}/repos/{}/{}/issues?state={}", self.base_url, owner, repo, state);
        
        if let Some(labels) = labels {
            if !labels.is_empty() {
                url.push_str(&format!("&labels={}", labels.join(",")));
            }
        }
        
        let response = self.client
            .get(&url)
            .headers(headers)
            .send()
            .await
            .map_err(|e| format!("Failed to fetch issues: {}", e))?;

        if !response.status().is_success() {
            return Err(format!("GitHub API error: {}", response.status()));
        }

        // Filter out pull requests (GitHub API returns PRs in issues endpoint)
        let all_issues: Vec<GitHubIssueRaw> = response.json().await
            .map_err(|e| format!("Failed to parse issues: {}", e))?;
        
        Ok(all_issues)
    }

    /// Gets a single issue
    pub async fn get_issue(
        &self,
        owner: &str,
        repo: &str,
        issue_number: u32,
    ) -> Result<GitHubIssueRaw, String> {
        let headers = self.get_headers()?;
        
        let response = self.client
            .get(format!("{}/repos/{}/{}/issues/{}", self.base_url, owner, repo, issue_number))
            .headers(headers)
            .send()
            .await
            .map_err(|e| format!("Failed to fetch issue: {}", e))?;

        if !response.status().is_success() {
            return Err(format!("GitHub API error: {}", response.status()));
        }

        response.json().await.map_err(|e| format!("Failed to parse issue: {}", e))
    }
}

impl Default for GitHubClient {
    fn default() -> Self {
        Self::new()
    }
}
