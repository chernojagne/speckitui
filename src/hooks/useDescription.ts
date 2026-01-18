import { saveDescription, loadDescription } from '@/services/tauriCommands';
import { useDescriptionStore } from '@/stores/descriptionStore';
import { useProjectStore } from '@/stores/projectStore';
import { useCallback, useEffect, useRef } from 'react';

/**
 * Hook for managing feature description content.
 * Handles loading from disk on spec change and debounced saving on content change.
 */
export function useDescription() {
  const activeSpec = useProjectStore((s) => s.activeSpec);
  const {
    content,
    isDirty,
    isLoading,
    isSaving,
    lastSaved,
    error,
    setContent,
    setLoading,
    setSaving,
    setLastSaved,
    setError,
    markClean,
    reset,
  } = useDescriptionStore();

  const saveTimeoutRef = useRef<number | null>(null);
  const activeSpecPathRef = useRef<string | undefined>(undefined);

  // Load description when spec changes
  useEffect(() => {
    const specPath = activeSpec?.path;

    // Track the current spec path for save operations
    activeSpecPathRef.current = specPath;

    if (!specPath) {
      reset();
      return;
    }

    setLoading(true);
    setError(null);

    loadDescription(specPath)
      .then((text) => {
        // Only update if this is still the active spec
        if (activeSpecPathRef.current === specPath) {
          // Use direct store method to avoid triggering dirty state
          useDescriptionStore.setState({ content: text, isDirty: false });
        }
      })
      .catch((err) => {
        if (activeSpecPathRef.current === specPath) {
          setError(String(err));
        }
      })
      .finally(() => {
        if (activeSpecPathRef.current === specPath) {
          setLoading(false);
        }
      });

    // Cleanup: cancel pending saves when spec changes
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
    };
  }, [activeSpec?.path, reset, setLoading, setError]);

  // Debounced save function
  const save = useCallback(
    async (text: string) => {
      const specPath = activeSpecPathRef.current;
      if (!specPath) return;

      // Clear pending save
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Schedule save after 500ms
      saveTimeoutRef.current = window.setTimeout(async () => {
        setSaving(true);
        try {
          await saveDescription(specPath, text);
          // Only update if still the same spec
          if (activeSpecPathRef.current === specPath) {
            setLastSaved(new Date());
            markClean();
          }
        } catch (err) {
          if (activeSpecPathRef.current === specPath) {
            setError(String(err));
          }
        } finally {
          if (activeSpecPathRef.current === specPath) {
            setSaving(false);
          }
        }
      }, 500);
    },
    [setSaving, setLastSaved, markClean, setError]
  );

  // Update content and trigger save
  const updateContent = useCallback(
    (text: string) => {
      setContent(text);
      save(text);
    },
    [setContent, save]
  );

  // Force immediate save (for send to terminal, etc.)
  const forceSave = useCallback(async () => {
    const specPath = activeSpecPathRef.current;
    if (!specPath || !isDirty) return;

    // Cancel pending debounced save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }

    setSaving(true);
    try {
      await saveDescription(specPath, content);
      if (activeSpecPathRef.current === specPath) {
        setLastSaved(new Date());
        markClean();
      }
    } catch (err) {
      if (activeSpecPathRef.current === specPath) {
        setError(String(err));
      }
    } finally {
      if (activeSpecPathRef.current === specPath) {
        setSaving(false);
      }
    }
  }, [content, isDirty, setSaving, setLastSaved, markClean, setError]);

  return {
    content,
    isDirty,
    isLoading,
    isSaving,
    lastSaved,
    error,
    updateContent,
    forceSave,
  };
}
