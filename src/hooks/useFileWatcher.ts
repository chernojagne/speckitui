/**
 * useFileWatcher Hook
 * Subscribes to file change events from the Tauri backend
 */

import { useEffect, useCallback, useRef } from 'react';
import { listen, type UnlistenFn } from '@tauri-apps/api/event';
import { useProjectStore } from '@/stores/projectStore';

export interface FileChangeEvent {
  path: string;
  kind: 'create' | 'modify' | 'delete' | 'rename';
  timestamp: string;
}

interface UseFileWatcherOptions {
  /** Only watch paths matching these patterns */
  patterns?: string[];
  /** Callback when a file changes */
  onFileChange?: (event: FileChangeEvent) => void;
  /** Debounce time in milliseconds */
  debounceMs?: number;
  /** Whether the watcher is enabled */
  enabled?: boolean;
}

interface UseFileWatcherReturn {
  /** Whether the watcher is currently active */
  isWatching: boolean;
}

const FILE_CHANGE_EVENT = 'file-change';

export function useFileWatcher({
  patterns,
  onFileChange,
  debounceMs = 100,
  enabled = true,
}: UseFileWatcherOptions = {}): UseFileWatcherReturn {
  const project = useProjectStore((state) => state.project);
  const callbackRef = useRef(onFileChange);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingEventsRef = useRef<FileChangeEvent[]>([]);

  // Keep callback ref up to date
  useEffect(() => {
    callbackRef.current = onFileChange;
  }, [onFileChange]);

  // Process debounced events
  const processEvents = useCallback(() => {
    const events = pendingEventsRef.current;
    pendingEventsRef.current = [];

    if (events.length === 0) return;

    // Dedupe events for the same path
    const uniqueEvents = new Map<string, FileChangeEvent>();
    events.forEach((event) => {
      uniqueEvents.set(event.path, event);
    });

    uniqueEvents.forEach((event) => {
      callbackRef.current?.(event);
    });
  }, []);

  // Handle incoming file change event
  const handleFileChange = useCallback(
    (event: FileChangeEvent) => {
      // Check if path matches patterns
      if (patterns && patterns.length > 0) {
        const matches = patterns.some((pattern) => {
          if (pattern.includes('*')) {
            const regexPattern = pattern
              .replace(/\./g, '\\.')
              .replace(/\*\*/g, '.*')
              .replace(/\*/g, '[^/]*');
            return new RegExp(regexPattern).test(event.path);
          }
          return event.path.includes(pattern);
        });

        if (!matches) return;
      }

      // Add to pending events
      pendingEventsRef.current.push(event);

      // Debounce processing
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(processEvents, debounceMs);
    },
    [patterns, debounceMs, processEvents]
  );

  // Subscribe to file change events
  useEffect(() => {
    if (!enabled || !project) {
      return;
    }

    let unlisten: UnlistenFn | null = null;

    const setupListener = async () => {
      try {
        unlisten = await listen<FileChangeEvent>(FILE_CHANGE_EVENT, (event) => {
          handleFileChange(event.payload);
        });
      } catch (err) {
        console.error('Failed to setup file watcher:', err);
      }
    };

    setupListener();

    return () => {
      if (unlisten) {
        unlisten();
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [enabled, project, handleFileChange]);

  return {
    isWatching: enabled && !!project,
  };
}

/**
 * Hook to watch for changes to artifact files and invalidate cache
 */
export function useArtifactWatcher(onArtifactChange: (path: string) => void) {
  const activeSpec = useProjectStore((state) => state.activeSpec);

  const handleFileChange = useCallback(
    (event: FileChangeEvent) => {
      if (event.kind === 'modify' || event.kind === 'delete') {
        onArtifactChange(event.path);
      }
    },
    [onArtifactChange]
  );

  useFileWatcher({
    patterns: activeSpec ? [`${activeSpec.path}/**`] : undefined,
    onFileChange: handleFileChange,
    enabled: !!activeSpec,
  });
}
