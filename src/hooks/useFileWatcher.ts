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

// Raw event from Rust backend (different field names)
interface RawFileChangeEvent {
  path: string;
  change_type: string; // "created" | "modified" | "deleted" | "changed"
}

// Convert Rust event format to our internal format
function normalizeEvent(raw: RawFileChangeEvent): FileChangeEvent {
  const kindMap: Record<string, FileChangeEvent['kind']> = {
    'created': 'create',
    'modified': 'modify',
    'deleted': 'delete',
    'changed': 'modify',
  };
  return {
    path: raw.path,
    kind: kindMap[raw.change_type] || 'modify',
    timestamp: new Date().toISOString(),
  };
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

const FILE_CHANGE_EVENT = 'file-changed'; // Must match Rust event name

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
        unlisten = await listen<RawFileChangeEvent>(FILE_CHANGE_EVENT, (event) => {
          const normalizedEvent = normalizeEvent(event.payload);
          handleFileChange(normalizedEvent);
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
export function useArtifactWatcher(onArtifactChange: (path: string, kind: FileChangeEvent['kind']) => void) {
  const activeSpec = useProjectStore((state) => state.activeSpec);

  const handleFileChange = useCallback(
    (event: FileChangeEvent) => {
      // Handle modify, delete, AND create events
      if (event.kind === 'modify' || event.kind === 'delete' || event.kind === 'create') {
        onArtifactChange(event.path, event.kind);
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

/**
 * Hook to watch for new artifact file creation and trigger project refresh
 * This updates the artifact manifest when files are created by external tools (like AI agents)
 */
export function useArtifactCreationWatcher(onRefreshNeeded: () => void) {
  const project = useProjectStore((state) => state.project);
  const activeSpec = useProjectStore((state) => state.activeSpec);
  const lastRefreshRef = useRef<number>(0);
  const refreshCallbackRef = useRef(onRefreshNeeded);

  // Keep callback ref up to date
  useEffect(() => {
    refreshCallbackRef.current = onRefreshNeeded;
  }, [onRefreshNeeded]);

  const handleFileChange = useCallback(
    (event: FileChangeEvent) => {
      // Only care about file creation events
      if (event.kind !== 'create') return;

      // Debounce rapid creation events (e.g., when agent creates multiple files)
      const now = Date.now();
      if (now - lastRefreshRef.current < 1000) return;

      // Check if the created file is in the active spec directory
      if (activeSpec && event.path.includes(activeSpec.path)) {
        console.log('[ArtifactCreationWatcher] New artifact detected:', event.path);
        lastRefreshRef.current = now;
        refreshCallbackRef.current();
      }
    },
    [activeSpec]
  );

  useFileWatcher({
    patterns: project ? [`${project.path}/specs/**`] : undefined,
    onFileChange: handleFileChange,
    enabled: !!project,
  });
}
