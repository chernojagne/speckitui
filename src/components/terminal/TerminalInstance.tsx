/**
 * TerminalInstance Component
 * Renders a single terminal instance using xterm.js
 */

import { useEffect, useRef, useCallback } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { listen, type UnlistenFn } from '@tauri-apps/api/event';
import { writeTerminal, resizeTerminal } from '@/services/tauriCommands';
import '@xterm/xterm/css/xterm.css';
import './TerminalInstance.css';

interface TerminalInstanceProps {
  sessionId: string;
  isActive: boolean;
  onReady?: () => void;
  onData?: (data: string) => void;
  onError?: (error: string) => void;
}

// Backend emits just the data string as payload
type TerminalOutputPayload = string;

// Global map to track terminal instances by sessionId
// This prevents duplicate terminals in React StrictMode
const terminalInstances = new Map<string, { terminal: Terminal; fitAddon: FitAddon }>();

export function TerminalInstance({
  sessionId,
  isActive,
  onReady,
  onData,
  onError,
}: TerminalInstanceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const mountedRef = useRef(false);
  
  // Store callbacks in refs to avoid re-initializing terminal when they change
  const onReadyRef = useRef(onReady);
  const onDataRef = useRef(onData);
  const onErrorRef = useRef(onError);
  
  // Keep refs up to date
  useEffect(() => {
    onReadyRef.current = onReady;
    onDataRef.current = onData;
    onErrorRef.current = onError;
  }, [onReady, onData, onError]);

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

    // Create terminal with theme matching app
    const terminal = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      theme: {
        background: '#1e1e1e',
        foreground: '#d4d4d4',
        cursor: '#d4d4d4',
        cursorAccent: '#1e1e1e',
        black: '#000000',
        red: '#cd3131',
        green: '#0dbc79',
        yellow: '#e5e510',
        blue: '#2472c8',
        magenta: '#bc3fbc',
        cyan: '#11a8cd',
        white: '#e5e5e5',
        brightBlack: '#666666',
        brightRed: '#f14c4c',
        brightGreen: '#23d18b',
        brightYellow: '#f5f543',
        brightBlue: '#3b8eea',
        brightMagenta: '#d670d6',
        brightCyan: '#29b8db',
        brightWhite: '#ffffff',
      },
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
      
      // Delay cleanup to allow StrictMode remount to claim the terminal
      setTimeout(() => {
        if (!mountedRef.current) {
          // Component didn't remount - truly unmounting
          terminalInstances.delete(sessionId);
          terminal.dispose();
          terminalRef.current = null;
          fitAddonRef.current = null;
        }
      }, 100);
    };
  }, [sessionId]);

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

  // Resize on container size change
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [handleResize]);

  // Focus terminal when active
  useEffect(() => {
    if (isActive && terminalRef.current) {
      terminalRef.current.focus();
    }
  }, [isActive]);

  return (
    <div 
      ref={containerRef}
      className={`terminal-instance ${isActive ? 'active' : ''}`}
      role="application"
      aria-label={`Terminal session ${sessionId}`}
    />
  );
}
