use portable_pty::{native_pty_system, CommandBuilder, MasterPty, PtySize, Child};
use std::collections::HashMap;
use std::io::{Read, Write};
use std::sync::{Arc, Mutex};
use std::thread;
use tauri::{AppHandle, Emitter};

/// Terminal session with PTY handles
pub struct TerminalSession {
    pub id: String,
    pub cwd: String,
    pub shell: String,
    pub master: Arc<Mutex<Box<dyn MasterPty + Send>>>,
    pub child: Arc<Mutex<Box<dyn Child + Send + Sync>>>,
    pub writer: Arc<Mutex<Box<dyn Write + Send>>>,
}

// Make TerminalSession Send + Sync safe
unsafe impl Send for TerminalSession {}
unsafe impl Sync for TerminalSession {}

/// Terminal session manager
/// Manages PTY sessions for the integrated terminal
pub struct TerminalManager {
    sessions: Mutex<HashMap<String, Arc<TerminalSession>>>,
}

impl TerminalManager {
    pub fn new() -> Self {
        Self {
            sessions: Mutex::new(HashMap::new()),
        }
    }

    /// Creates a new PTY session
    pub fn create_session(
        &self,
        app_handle: AppHandle,
        cwd: String,
        shell: String,
        env: Option<HashMap<String, String>>,
    ) -> Result<String, String> {
        let id = uuid::Uuid::new_v4().to_string();
        
        // Get the PTY system
        let pty_system = native_pty_system();
        
        // Configure PTY size
        let pair = pty_system
            .openpty(PtySize {
                rows: 24,
                cols: 80,
                pixel_width: 0,
                pixel_height: 0,
            })
            .map_err(|e| format!("Failed to open PTY: {}", e))?;

        // Build the shell command
        let mut cmd = CommandBuilder::new(&shell);
        cmd.cwd(&cwd);
        
        // IMPORTANT: Inherit the parent process's environment variables
        // This ensures PATH and other important vars are available
        for (key, value) in std::env::vars() {
            cmd.env(key, value);
        }
        
        // Set/override terminal-specific environment variables
        #[cfg(windows)]
        {
            cmd.env("TERM", "xterm-256color");
        }
        #[cfg(not(windows))]
        {
            cmd.env("TERM", "xterm-256color");
            cmd.env("COLORTERM", "truecolor");
        }

        // Apply custom environment variables (feature env from the store)
        if let Some(env_vars) = env {
            for (key, value) in env_vars {
                log::info!("Setting terminal env var: {}={}", key, value);
                cmd.env(key, value);
            }
        }

        // Spawn the child process
        let child = pair
            .slave
            .spawn_command(cmd)
            .map_err(|e| format!("Failed to spawn shell: {}", e))?;

        // Get the writer for sending input
        let writer = pair.master.take_writer()
            .map_err(|e| format!("Failed to get PTY writer: {}", e))?;

        // Get reader for output
        let mut reader = pair.master.try_clone_reader()
            .map_err(|e| format!("Failed to clone PTY reader: {}", e))?;

        let session = Arc::new(TerminalSession {
            id: id.clone(),
            cwd,
            shell,
            master: Arc::new(Mutex::new(pair.master)),
            child: Arc::new(Mutex::new(child)),
            writer: Arc::new(Mutex::new(writer)),
        });

        // Store the session
        self.sessions.lock().unwrap().insert(id.clone(), session.clone());

        // Spawn a thread to read output and emit events
        let session_id = id.clone();
        let session_id_for_output = id.clone();
        let app_handle_for_child = app_handle.clone();
        
        // Thread to read PTY output
        thread::spawn(move || {
            let mut buf = [0u8; 4096];
            loop {
                match reader.read(&mut buf) {
                    Ok(0) => {
                        // EOF - terminal closed
                        log::info!("PTY EOF for session {}", session_id_for_output);
                        let _ = app_handle.emit(&format!("terminal-exit-{}", session_id_for_output), ());
                        break;
                    }
                    Ok(n) => {
                        let data = String::from_utf8_lossy(&buf[..n]).to_string();
                        let _ = app_handle.emit(&format!("terminal-output-{}", session_id_for_output), data);
                    }
                    Err(e) => {
                        log::error!("Error reading from PTY: {}", e);
                        let _ = app_handle.emit(&format!("terminal-exit-{}", session_id_for_output), ());
                        break;
                    }
                }
            }
        });
        
        // Thread to monitor child process exit (Windows ConPTY may not signal EOF on exit)
        let child_arc = session.child.clone();
        thread::spawn(move || {
            // Wait for child process to exit
            loop {
                thread::sleep(std::time::Duration::from_millis(100));
                let mut child = child_arc.lock().unwrap();
                match child.try_wait() {
                    Ok(Some(status)) => {
                        log::info!("Child process exited with status {:?} for session {}", status, session_id);
                        let _ = app_handle_for_child.emit(&format!("terminal-exit-{}", session_id), ());
                        break;
                    }
                    Ok(None) => {
                        // Still running
                        continue;
                    }
                    Err(e) => {
                        log::error!("Error checking child status: {}", e);
                        break;
                    }
                }
            }
        });

        Ok(id)
    }

    /// Writes data to a terminal session
    pub fn write_to_session(&self, id: &str, data: &str) -> Result<(), String> {
        let sessions = self.sessions.lock().unwrap();
        let session = sessions
            .get(id)
            .ok_or_else(|| format!("Terminal session not found: {}", id))?;

        let mut writer = session.writer.lock().unwrap();
        writer
            .write_all(data.as_bytes())
            .map_err(|e| format!("Failed to write to terminal: {}", e))?;
        writer.flush().map_err(|e| format!("Failed to flush: {}", e))?;
        
        Ok(())
    }

    /// Resizes a terminal session
    pub fn resize_session(&self, id: &str, cols: u16, rows: u16) -> Result<(), String> {
        let sessions = self.sessions.lock().unwrap();
        let session = sessions
            .get(id)
            .ok_or_else(|| format!("Terminal session not found: {}", id))?;

        let master = session.master.lock().unwrap();
        master
            .resize(PtySize {
                rows,
                cols,
                pixel_width: 0,
                pixel_height: 0,
            })
            .map_err(|e| format!("Failed to resize terminal: {}", e))?;

        Ok(())
    }

    /// Closes a terminal session with proper cleanup
    pub fn close_session(&self, id: &str) -> Result<(), String> {
        let mut sessions = self.sessions.lock().unwrap();
        
        if let Some(session) = sessions.remove(id) {
            // Kill the child process and wait for it to exit
            let mut child = session.child.lock().unwrap();
            
            // First, try to kill the child process
            if let Err(e) = child.kill() {
                log::warn!("Failed to kill terminal child process {}: {}", id, e);
            }
            
            // Wait for the child process to fully exit to prevent orphaned processes
            match child.wait() {
                Ok(status) => {
                    log::info!("Terminal session {} closed with status: {:?}", id, status);
                }
                Err(e) => {
                    log::warn!("Failed to wait for terminal child process {}: {}", id, e);
                }
            }
            
            log::debug!("Terminal session {} cleanup complete", id);
            Ok(())
        } else {
            Err(format!("Terminal session not found: {}", id))
        }
    }

    /// Closes all terminal sessions (called on app exit)
    pub fn close_all_sessions(&self) {
        let mut sessions = self.sessions.lock().unwrap();
        let ids: Vec<String> = sessions.keys().cloned().collect();
        
        for id in ids {
            if let Some(session) = sessions.remove(&id) {
                let mut child = session.child.lock().unwrap();
                let _ = child.kill();
                let _ = child.wait();
                log::info!("Cleaned up terminal session: {}", id);
            }
        }
    }

    /// Lists all active session IDs
    pub fn list_sessions(&self) -> Vec<String> {
        self.sessions.lock().unwrap().keys().cloned().collect()
    }

    /// Gets session info
    pub fn get_session_info(&self, id: &str) -> Option<(String, String)> {
        let sessions = self.sessions.lock().unwrap();
        sessions.get(id).map(|s| (s.cwd.clone(), s.shell.clone()))
    }
}

impl Default for TerminalManager {
    fn default() -> Self {
        Self::new()
    }
}
