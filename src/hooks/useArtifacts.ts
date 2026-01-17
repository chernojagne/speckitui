/**
 * useArtifacts Hook
 * Provides artifact loading, caching, and mutation operations
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  readArtifact,
  writeArtifact,
  updateCheckbox,
  listDirectory,
  readSourceFile,
  type UpdateCheckboxParams,
} from '@/services/tauriCommands';
import type { ArtifactContent, SourceFileContent, FileEntry } from '@/types';
import { useProjectStore } from '@/stores/projectStore';

interface ArtifactCache {
  [path: string]: {
    content: ArtifactContent;
    timestamp: number;
  };
}

interface UseArtifactsReturn {
  // State
  content: ArtifactContent | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadArtifact: (filePath: string) => Promise<ArtifactContent | null>;
  saveArtifact: (filePath: string, content: string) => Promise<boolean>;
  toggleCheckbox: (params: UpdateCheckboxParams) => Promise<boolean>;
  listFiles: (dirPath: string) => Promise<FileEntry[]>;
  loadSourceFile: (filePath: string) => Promise<SourceFileContent | null>;
  invalidateCache: (filePath?: string) => void;
}

// Simple in-memory cache for artifacts
const artifactCache: ArtifactCache = {};
const CACHE_TTL = 30000; // 30 seconds

export function useArtifacts(): UseArtifactsReturn {
  const [content, setContent] = useState<ArtifactContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const activeSpec = useProjectStore((state) => state.activeSpec);
  const mountedRef = useRef(true);

  // Track mounted state for async operations
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  /**
   * Load an artifact from file system
   * Uses cache if available and not stale
   */
  const loadArtifact = useCallback(async (filePath: string): Promise<ArtifactContent | null> => {
    // Check cache first
    const cached = artifactCache[filePath];
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      if (mountedRef.current) {
        setContent(cached.content);
        setError(null);
      }
      return cached.content;
    }

    if (mountedRef.current) {
      setIsLoading(true);
      setError(null);
    }

    try {
      const result = await readArtifact(filePath);

      // Cache the result
      artifactCache[filePath] = {
        content: result,
        timestamp: Date.now(),
      };

      if (mountedRef.current) {
        setContent(result);
        setIsLoading(false);
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load artifact';
      if (mountedRef.current) {
        setError(errorMessage);
        setIsLoading(false);
      }
      return null;
    }
  }, []);

  /**
   * Save artifact content to file
   * Invalidates cache after save
   */
  const saveArtifact = useCallback(async (filePath: string, newContent: string): Promise<boolean> => {
    try {
      const result = await writeArtifact(filePath, newContent);
      
      if (result.success) {
        // Invalidate cache for this file
        delete artifactCache[filePath];
        
        // Reload to get fresh content
        await loadArtifact(filePath);
      }
      
      return result.success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save artifact';
      if (mountedRef.current) {
        setError(errorMessage);
      }
      return false;
    }
  }, [loadArtifact]);

  /**
   * Toggle a checkbox in a markdown file
   * Uses optimistic update for better UX
   */
  const toggleCheckbox = useCallback(async (params: UpdateCheckboxParams): Promise<boolean> => {
    const { filePath, lineNumber, checked } = params;

    // Optimistic update: update local state immediately
    if (content) {
      const lines = content.content.split('\n');
      if (lineNumber > 0 && lineNumber <= lines.length) {
        const line = lines[lineNumber - 1];
        const newLine = checked
          ? line.replace(/- \[ \]/, '- [X]')
          : line.replace(/- \[[Xx]\]/, '- [ ]');
        lines[lineNumber - 1] = newLine;

        if (mountedRef.current) {
          setContent({
            ...content,
            content: lines.join('\n'),
          });
        }
      }
    }

    try {
      const result = await updateCheckbox(params);

      if (result.success) {
        // Invalidate cache
        delete artifactCache[filePath];

        // Update with server response
        if (mountedRef.current && content) {
          setContent({
            ...content,
            content: result.newContent,
          });
        }
      } else {
        // Revert optimistic update on failure
        await loadArtifact(filePath);
      }

      return result.success;
    } catch (err) {
      // Revert optimistic update on error
      await loadArtifact(filePath);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update checkbox';
      if (mountedRef.current) {
        setError(errorMessage);
      }
      return false;
    }
  }, [content, loadArtifact]);

  /**
   * List files in a directory
   */
  const listFiles = useCallback(async (dirPath: string): Promise<FileEntry[]> => {
    try {
      const result = await listDirectory(dirPath);
      return result.entries;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to list directory';
      if (mountedRef.current) {
        setError(errorMessage);
      }
      return [];
    }
  }, []);

  /**
   * Load a source file (for Implement view)
   */
  const loadSourceFile = useCallback(async (filePath: string): Promise<SourceFileContent | null> => {
    if (mountedRef.current) {
      setIsLoading(true);
      setError(null);
    }

    try {
      const result = await readSourceFile(filePath);
      if (mountedRef.current) {
        setIsLoading(false);
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load source file';
      if (mountedRef.current) {
        setError(errorMessage);
        setIsLoading(false);
      }
      return null;
    }
  }, []);

  /**
   * Invalidate cache for a specific file or all files
   */
  const invalidateCache = useCallback((filePath?: string) => {
    if (filePath) {
      delete artifactCache[filePath];
    } else {
      Object.keys(artifactCache).forEach((key) => {
        delete artifactCache[key];
      });
    }
  }, []);

  // Clear content when active spec changes
  useEffect(() => {
    setContent(null);
    setError(null);
  }, [activeSpec?.id]);

  return {
    content,
    isLoading,
    error,
    loadArtifact,
    saveArtifact,
    toggleCheckbox,
    listFiles,
    loadSourceFile,
    invalidateCache,
  };
}
