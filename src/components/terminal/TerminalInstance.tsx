/**
 * TerminalInstance Component
 * Renders a single terminal instance using xterm.js
 * 
 * @feature 006-more-themes - Updated to use useTerminalTheme hook
 */

import { useEffect, useRef, useCallback } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { listen, type UnlistenFn } from '@tauri-apps/api/event';
import { writeTerminal, resizeTerminal } from '@/services/tauriCommands';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTerminalTheme } from '@/hooks/useTheme';
import '@xterm/xterm/css/xterm.css';
import './TerminalInstance.css';

interface TerminalInstanceProps {
  sessionId: string;
  isActive: boolean;
  onReady?: () => void;
  onData?: (data: string) => void;
  onError?: (error: string) => void;
  onExit?: () => void;
}

// Backend emits just the data string as payload
type TerminalOutputPayload = string;

// Global map to track terminal instances by sessionId
// This prevents duplicate terminals in React StrictMode
const terminalInstances = new Map<string, { terminal: Terminal; fitAddon: FitAddon }>();

// Development logging helper
const logTerminalDebug = (message: string, sessionId: string) => {
  if (import.meta.env.DEV) {
    console.debug(`[Terminal ${sessionId.slice(0, 8)}] ${message} | Active instances: ${terminalInstances.size}`);
  }
};

export function TerminalInstance({
  sessionId,
  isActive,
  onReady,
  onData,
  onError,
  onExit,
}: TerminalInstanceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const mountedRef = useRef(false);
  
  // Get terminal settings from store
  const terminalFontSize = useSettingsStore((s) => s.terminalFontSize);
  const terminalFontFamily = useSettingsStore((s) => s.terminalFontFamily);
  const terminalCursorBlink = useSettingsStore((s) => s.terminalCursorBlink);
  
  // Use the new theme hook for resolved theme (006-more-themes)
  const { theme: terminalTheme } = useTerminalTheme();
  
  // Store callbacks in refs to avoid re-initializing terminal when they change
  const onReadyRef = useRef(onReady);
  const onDataRef = useRef(onData);
  const onErrorRef = useRef(onError);
  const onExitRef = useRef(onExit);
  
  // Keep refs up to date
  useEffect(() => {
    onReadyRef.current = onReady;
    onDataRef.current = onData;
    onErrorRef.current = onError;
    onExitRef.current = onExit;
  }, [onReady, onData, onError, onExit]);

  // Initialize terminal - only depends on sessionId
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Check if terminal already exists for this session (React StrictMode protection)
    const existing = terminalInstances.get(sessionId);
    if (existing) {
      // Reattach existing terminal to this container
      terminalRef.current = existing.terminal;
      fitAddonRef.current = existing.fitAddon;
      
      // Re-open in the new container if needed
      if (!containerRef.current.querySelector('.xterm')) {
        existing.terminal.open(containerRef.current);
        existing.fitAddon.fit();
      }
      
      mountedRef.current = true;
      return;
    }

    // Create terminal with theme from settings
    const terminal = new Terminal({
      cursorBlink: terminalCursorBlink,
      fontSize: terminalFontSize,
      fontFamily: terminalFontFamily,
      theme: terminalTheme,
      allowProposedApi: true,
    });

    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);

    terminal.open(containerRef.current);
    fitAddon.fit();

    terminalRef.current = terminal;
    fitAddonRef.current = fitAddon;
    
    // Store in global map
    terminalInstances.set(sessionId, { terminal, fitAddon });
    logTerminalDebug('Created new terminal instance', sessionId);

    // Handle user input - use ref for callback
    terminal.onData((data) => {
      writeTerminal(sessionId, data).catch((err) => {
        console.error('Failed to write to terminal:', err);
        onErrorRef.current?.(err.message || 'Failed to write to terminal');
      });
      onDataRef.current?.(data);
    });

    mountedRef.current = true;
    onReadyRef.current?.();

    // Cleanup only removes from map when component is truly unmounting
    // We use a timeout to distinguish StrictMode remount from real unmount
    return () => {
      mountedRef.current = false;
      logTerminalDebug('Cleanup started (100ms delay)', sessionId);
      
      // Delay cleanup to allow StrictMode remount to claim the terminal
      setTimeout(() => {
        if (!mountedRef.current) {
          // Component didn't remount - truly unmounting
          logTerminalDebug('Disposing terminal (no remount)', sessionId);
          terminalInstances.delete(sessionId);
          terminal.dispose();
          terminalRef.current = null;
          fitAddonRef.current = null;
        }
      }, 100);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]); // Only recreate terminal when sessionId changes - settings updates handled separately

  // Update terminal theme when settings change
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.options.theme = terminalTheme;
    }
  }, [terminalTheme]);

  // Update terminal font settings when they change
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.options.fontSize = terminalFontSize;
      terminalRef.current.options.fontFamily = terminalFontFamily;
      terminalRef.current.options.cursorBlink = terminalCursorBlink;
      // Refit after font changes
      fitAddonRef.current?.fit();
    }
  }, [terminalFontSize, terminalFontFamily, terminalCursorBlink]);

  // Listen for terminal output from Tauri
  useEffect(() => {
    let unlisten: UnlistenFn | null = null;
    let cancelled = false;

    const setupListener = async () => {
      try {
        const unlistenFn = await listen<TerminalOutputPayload>(
          `terminal-output-${sessionId}`,
          (event) => {
            if (terminalRef.current && event.payload) {
              terminalRef.current.write(event.payload);
            }
          }
        );
        
        // If cancelled during async setup, immediately unlisten
        if (cancelled) {
          unlistenFn();
        } else {
          unlisten = unlistenFn;
        }
      } catch (err) {
        console.error('Failed to setup terminal output listener:', err);
      }
    };

    setupListener();

    return () => {
      cancelled = true;
      unlisten?.();
    };
  }, [sessionId]);

  // Listen for terminal exit events (PTY process terminated unexpectedly)
  useEffect(() => {
    let unlisten: UnlistenFn | null = null;
    let cancelled = false;

    const setupExitListener = async () => {
      try {
        console.log(`[Terminal ${sessionId}] Setting up exit listener`);
        const unlistenFn = await listen<void>(
          `terminal-exit-${sessionId}`,
          () => {
            console.log(`[Terminal ${sessionId}] Exit event received!`);
            // Terminal process exited - write message and notify
            if (terminalRef.current) {
              terminalRef.current.write('\r\n\x1b[90m[Process exited]\x1b[0m\r\n');
            }
            onErrorRef.current?.('Terminal process exited');
            // Auto-close the tab when shell exits
            console.log(`[Terminal ${sessionId}] Calling onExit callback...`);
            onExitRef.current?.();
          }
        );
        
        if (cancelled) {
          unlistenFn();
        } else {
          unlisten = unlistenFn;
        }
      } catch (err) {
        console.error('Failed to setup terminal exit listener:', err);
      }
    };

    setupExitListener();

    return () => {
      cancelled = true;
      unlisten?.();
    };
  }, [sessionId]);

  // Handle resize
  const handleResize = useCallback(() => {
    if (fitAddonRef.current && terminalRef.current) {
      fitAddonRef.current.fit();
      
      const { rows, cols } = terminalRef.current;
      resizeTerminal(sessionId, cols, rows).catch((err) => {
        console.error('Failed to resize terminal:', err);
      });
    }
  }, [sessionId]);

  // Debounced resize with dimension tracking
  const lastDimensionsRef = useRef<{ width: number; height: number }>({ width: 0, height: 0 });
  const resizeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Resize on container size change with debouncing
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;

      const { width, height } = entry.contentRect;
      const lastDims = lastDimensionsRef.current;

      // Only trigger resize if dimensions actually changed
      if (width === lastDims.width && height === lastDims.height) {
        return;
      }

      lastDimensionsRef.current = { width, height };

      // Cancel pending resize
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }

      // Debounce resize calls by 50ms
      resizeTimeoutRef.current = setTimeout(() => {
        handleResize();
        resizeTimeoutRef.current = null;
      }, 50);
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [handleResize]);

  // Focus terminal when active or when terminal becomes ready while active
  // Also refit terminal to fix content truncation when switching tabs
  useEffect(() => {
    if (isActive && terminalRef.current) {
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        terminalRef.current?.focus();
        // Refit terminal to fix truncation after tab switch
        if (fitAddonRef.current) {
          fitAddonRef.current.fit();
        }
      });
    }
  }, [isActive]);

  // Also focus on initial mount if active (for new terminals)
  const initialFocusRef = useRef(false);
  useEffect(() => {
    if (isActive && terminalRef.current && !initialFocusRef.current) {
      initialFocusRef.current = true;
      // Small delay to ensure terminal is fully initialized
      setTimeout(() => {
        terminalRef.current?.focus();
      }, 50);
    }
  });

  return (
    <div 
      ref={containerRef}
      className={`terminal-instance ${isActive ? 'active' : ''}`}
      role="application"
      aria-label={`Terminal session ${sessionId}`}
    />
  );
}
