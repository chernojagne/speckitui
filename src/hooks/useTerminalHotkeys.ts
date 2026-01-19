/**
 * Terminal Hotkeys Hook
 * Provides keyboard shortcuts for terminal operations
 */

import { useEffect, useCallback } from 'react';
import { useTerminalStore } from '@/stores/terminalStore';
import { useSettingsStore } from '@/stores/settingsStore';
import type { ShellType } from '@/hooks/useTerminal';

// Default terminal font size and zoom constraints
const DEFAULT_FONT_SIZE = 14;
const MIN_FONT_SIZE = 8;
const MAX_FONT_SIZE = 32;
const ZOOM_STEP = 2;

interface UseTerminalHotkeysOptions {
  /** Callback to create a new terminal session */
  onNewTerminal?: (shell?: ShellType) => void;
  /** Callback to close the active terminal session */
  onCloseTerminal?: (sessionId: string) => void;
  /** Whether hotkeys are enabled (disabled when terminal panel is not visible) */
  enabled?: boolean;
}

/**
 * Hook that registers global keyboard shortcuts for terminal operations
 * 
 * Supported shortcuts:
 * - Ctrl+Shift+N: New terminal window (opens in new session)
 * - Ctrl+Shift+T: New terminal tab
 * - Ctrl+Shift+W: Close active terminal tab
 * - Ctrl+PageUp: Switch to previous tab
 * - Ctrl+PageDown: Switch to next tab
 * - Ctrl++/-: Zoom in/out (font size)
 * - Ctrl+0: Reset zoom to default
 */
export function useTerminalHotkeys({
  onNewTerminal,
  onCloseTerminal,
  enabled = true,
}: UseTerminalHotkeysOptions) {
  const { sessions, activeSessionId, setActiveSession, removeSession } = useTerminalStore();
  const { terminalFontSize, setTerminalFontSize } = useSettingsStore();

  // Switch to previous tab
  const switchToPreviousTab = useCallback(() => {
    if (sessions.length <= 1 || !activeSessionId) return;
    
    const currentIndex = sessions.findIndex((s) => s.id === activeSessionId);
    if (currentIndex === -1) return;
    
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : sessions.length - 1;
    setActiveSession(sessions[prevIndex].id);
  }, [sessions, activeSessionId, setActiveSession]);

  // Switch to next tab
  const switchToNextTab = useCallback(() => {
    if (sessions.length <= 1 || !activeSessionId) return;
    
    const currentIndex = sessions.findIndex((s) => s.id === activeSessionId);
    if (currentIndex === -1) return;
    
    const nextIndex = (currentIndex + 1) % sessions.length;
    setActiveSession(sessions[nextIndex].id);
  }, [sessions, activeSessionId, setActiveSession]);

  // Zoom in
  const zoomIn = useCallback(() => {
    const newSize = Math.min(MAX_FONT_SIZE, terminalFontSize + ZOOM_STEP);
    setTerminalFontSize(newSize);
  }, [terminalFontSize, setTerminalFontSize]);

  // Zoom out
  const zoomOut = useCallback(() => {
    const newSize = Math.max(MIN_FONT_SIZE, terminalFontSize - ZOOM_STEP);
    setTerminalFontSize(newSize);
  }, [terminalFontSize, setTerminalFontSize]);

  // Reset zoom
  const resetZoom = useCallback(() => {
    setTerminalFontSize(DEFAULT_FONT_SIZE);
  }, [setTerminalFontSize]);

  // Close active tab
  const closeActiveTab = useCallback(() => {
    if (!activeSessionId) return;
    
    removeSession(activeSessionId);
    onCloseTerminal?.(activeSessionId);
  }, [activeSessionId, removeSession, onCloseTerminal]);

  // Handle keyboard events
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle Ctrl-based shortcuts
      if (!e.ctrlKey) return;

      // Ctrl+Shift combinations
      if (e.shiftKey) {
        switch (e.key.toUpperCase()) {
          case 'N':
            // Ctrl+Shift+N: New terminal (same as new tab for now)
            e.preventDefault();
            onNewTerminal?.('default');
            break;
          case 'T':
            // Ctrl+Shift+T: New terminal tab
            e.preventDefault();
            onNewTerminal?.('default');
            break;
          case 'W':
            // Ctrl+Shift+W: Close active tab
            e.preventDefault();
            closeActiveTab();
            break;
        }
        return;
      }

      // Ctrl-only combinations (no Shift)
      switch (e.key) {
        case 'PageUp':
          // Ctrl+PageUp: Previous tab
          e.preventDefault();
          switchToPreviousTab();
          break;
        case 'PageDown':
          // Ctrl+PageDown: Next tab
          e.preventDefault();
          switchToNextTab();
          break;
        case '+':
        case '=':
          // Ctrl++/= (= is unshifted + on most keyboards): Zoom in
          e.preventDefault();
          zoomIn();
          break;
        case '-':
          // Ctrl+-: Zoom out
          e.preventDefault();
          zoomOut();
          break;
        case '0':
          // Ctrl+0: Reset zoom
          e.preventDefault();
          resetZoom();
          break;
      }
    };

    // Use capture phase to intercept before terminal gets the event
    window.addEventListener('keydown', handleKeyDown, { capture: true });
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, [
    enabled,
    onNewTerminal,
    closeActiveTab,
    switchToPreviousTab,
    switchToNextTab,
    zoomIn,
    zoomOut,
    resetZoom,
  ]);

  return {
    switchToPreviousTab,
    switchToNextTab,
    zoomIn,
    zoomOut,
    resetZoom,
    closeActiveTab,
  };
}
