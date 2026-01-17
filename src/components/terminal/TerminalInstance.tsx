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

  // Initialize terminal
  useEffect(() => {
    if (!containerRef.current) return;

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

    // Handle user input
    terminal.onData((data) => {
      writeTerminal(sessionId, data).catch((err) => {
        console.error('Failed to write to terminal:', err);
        onError?.(err.message || 'Failed to write to terminal');
      });
      onData?.(data);
    });

    onReady?.();

    return () => {
      terminal.dispose();
      terminalRef.current = null;
      fitAddonRef.current = null;
    };
  }, [sessionId, onReady, onData, onError]);

  // Listen for terminal output from Tauri
  useEffect(() => {
    let unlisten: UnlistenFn | null = null;

    const setupListener = async () => {
      try {
        unlisten = await listen<TerminalOutputPayload>(
          `terminal-output-${sessionId}`,
          (event) => {
            if (terminalRef.current && event.payload) {
              terminalRef.current.write(event.payload);
            }
          }
        );
      } catch (err) {
        console.error('Failed to setup terminal output listener:', err);
      }
    };

    setupListener();

    return () => {
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
