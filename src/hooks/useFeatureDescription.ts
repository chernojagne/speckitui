/**
 * useFeatureDescription Hook
 * Manages feature description content with attachments.
 * Saves to FEATURE_DESC_FILE path from the feature environment store.
 */

import { 
  saveDescriptionFile, 
  loadDescriptionFile,
  saveAttachment,
} from '@/services/tauriCommands';
import { useDescriptionStore } from '@/stores/descriptionStore';
import { useProjectStore } from '@/stores/projectStore';
import { useFeatureEnvStore } from '@/stores/featureEnvStore';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { AttachmentReference } from '@/components/shared/DescriptionRichEditor';
import { generateReferencesSection } from '@/components/shared/DescriptionRichEditor';

// Marker for separating content from references
const REFERENCES_MARKER = '<!-- ATTACHMENT_REFERENCES -->';

/**
 * Hook for managing feature description content with attachment support.
 * Handles loading from disk and manual saving to FEATURE_DESC_FILE.
 */
export function useFeatureDescription() {
  const project = useProjectStore((s) => s.project);
  const activeSpec = useProjectStore((s) => s.activeSpec);
  const featureEnv = useFeatureEnvStore((s) => s.variables);
  
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
    markDirty,
    reset,
  } = useDescriptionStore();

  // Attachments state
  const [attachments, setAttachments] = useState<AttachmentReference[]>([]);
  const [attachmentCounter, setAttachmentCounter] = useState({ image: 0, document: 0 });
  
  const currentFilePathRef = useRef<string | null>(null);

  // Compute the description file path
  const getDescriptionFilePath = useCallback((): string | null => {
    if (!project) return null;
    
    // Use FEATURE_DESC_FILE if available, otherwise fall back to spec path
    if (featureEnv.FEATURE_DESC_FILE) {
      // FEATURE_DESC_FILE is relative, make it absolute
      return `${project.path}/${featureEnv.FEATURE_DESC_FILE.replace(/^\.\//, '')}`;
    }
    
    // Fallback: use spec directory's description.md
    if (activeSpec?.path) {
      return `${activeSpec.path}/description.md`;
    }
    
    return null;
  }, [project, featureEnv.FEATURE_DESC_FILE, activeSpec?.path]);

  // Get the base directory for attachments
  const getAttachmentsBaseDir = useCallback((): string | null => {
    const filePath = getDescriptionFilePath();
    if (!filePath) return null;
    
    // Get parent directory of the description file
    const lastSlash = filePath.lastIndexOf('/');
    if (lastSlash === -1) return null;
    
    return filePath.substring(0, lastSlash);
  }, [getDescriptionFilePath]);

  // Parse content to extract attachments from the references section
  const parseContentWithAttachments = useCallback((rawContent: string): {
    content: string;
    attachments: AttachmentReference[];
  } => {
    if (!rawContent.includes(REFERENCES_MARKER)) {
      return { content: rawContent, attachments: [] };
    }

    const parts = rawContent.split(REFERENCES_MARKER);
    const mainContent = parts[0].trimEnd();
    const referencesSection = parts[1] || '';

    // Parse attachments from the table in references section
    const parsedAttachments: AttachmentReference[] = [];
    const tableRowRegex = /\|\s*`\[([A-Z]+-\d+)\]`\s*\|\s*([^|]+)\s*\|\s*`([^`]+)`\s*\|\s*([^|]+)\s*\|/g;
    let match;

    while ((match = tableRowRegex.exec(referencesSection)) !== null) {
      const [, id, typeEmoji, filePath, displayName] = match;
      const type = typeEmoji.includes('Image') ? 'image' : 'document';
      
      parsedAttachments.push({
        id,
        type,
        fileName: filePath.split('/').pop() || filePath,
        filePath,
        displayName: displayName.trim(),
        mimeType: type === 'image' ? 'image/unknown' : 'application/octet-stream',
        size: 0,
        addedAt: new Date(),
      });
    }

    return { content: mainContent, attachments: parsedAttachments };
  }, []);

  // Load description when file path changes
  useEffect(() => {
    const filePath = getDescriptionFilePath();
    currentFilePathRef.current = filePath;

    if (!filePath) {
      reset();
      setAttachments([]);
      return;
    }

    setLoading(true);
    setError(null);

    loadDescriptionFile(filePath)
      .then((rawText) => {
        if (currentFilePathRef.current !== filePath) return;
        
        const { content: parsedContent, attachments: parsedAttachments } = parseContentWithAttachments(rawText);
        
        // Update store directly to avoid triggering dirty state
        useDescriptionStore.setState({ content: parsedContent, isDirty: false });
        setAttachments(parsedAttachments);
        
        // Update counters based on parsed attachments
        const imgCount = parsedAttachments.filter(a => a.type === 'image').length;
        const docCount = parsedAttachments.filter(a => a.type === 'document').length;
        setAttachmentCounter({ image: imgCount, document: docCount });
      })
      .catch((err) => {
        if (currentFilePathRef.current === filePath) {
          setError(String(err));
        }
      })
      .finally(() => {
        if (currentFilePathRef.current === filePath) {
          setLoading(false);
        }
      });
  }, [getDescriptionFilePath, reset, setLoading, setError, parseContentWithAttachments]);

  // Update content (no auto-save, just marks dirty)
  const updateContent = useCallback((text: string) => {
    setContent(text);
  }, [setContent]);

  // Update attachments
  const updateAttachments = useCallback((newAttachments: AttachmentReference[]) => {
    setAttachments(newAttachments);
    markDirty();
  }, [markDirty]);

  // Save attachment to disk and return reference
  const handleSaveAttachment = useCallback(async (file: File): Promise<AttachmentReference | null> => {
    const baseDir = getAttachmentsBaseDir();
    if (!baseDir) {
      setError('No description file path configured');
      return null;
    }

    try {
      // Read file as base64
      const base64 = await fileToBase64(file);
      // Remove data URL prefix (e.g., "data:image/png;base64,")
      const base64Content = base64.split(',')[1] || base64;

      // Save to disk
      const result = await saveAttachment(baseDir, file.name, base64Content);

      // Determine type and generate ID
      const isImage = file.type.startsWith('image/');
      const type = isImage ? 'image' : 'document';
      const counter = isImage ? attachmentCounter.image : attachmentCounter.document;
      const newCounter = counter + 1;
      
      // Update counter
      setAttachmentCounter(prev => ({
        ...prev,
        [type]: newCounter,
      }));

      // Create reference
      const attachment: AttachmentReference = {
        id: `${type === 'image' ? 'IMG' : 'DOC'}-${String(newCounter).padStart(3, '0')}`,
        type,
        fileName: result.fileName,
        filePath: result.relativePath,
        displayName: file.name,
        mimeType: file.type,
        size: result.size,
        addedAt: new Date(),
      };

      return attachment;
    } catch (err) {
      setError(`Failed to save attachment: ${err}`);
      return null;
    }
  }, [getAttachmentsBaseDir, attachmentCounter, setError]);

  // Build full content with references section
  const buildFullContent = useCallback((): string => {
    if (attachments.length === 0) return content;

    const referencesSection = generateReferencesSection(attachments);
    return `${content.trimEnd()}\n\n${REFERENCES_MARKER}\n${referencesSection}`;
  }, [content, attachments]);

  // Manual save function
  const save = useCallback(async (): Promise<boolean> => {
    const filePath = currentFilePathRef.current;
    if (!filePath) {
      setError('No description file path configured');
      return false;
    }

    setSaving(true);
    try {
      const fullContent = buildFullContent();
      await saveDescriptionFile(filePath, fullContent);
      setLastSaved(new Date());
      markClean();
      return true;
    } catch (err) {
      setError(String(err));
      return false;
    } finally {
      setSaving(false);
    }
  }, [buildFullContent, setSaving, setLastSaved, markClean, setError]);

  return {
    // Content
    content,
    attachments,
    
    // State
    isDirty,
    isLoading,
    isSaving,
    lastSaved,
    error,
    
    // File path info
    descriptionFilePath: getDescriptionFilePath(),
    attachmentsBaseDir: getAttachmentsBaseDir(),
    
    // Actions
    updateContent,
    updateAttachments,
    saveAttachment: handleSaveAttachment,
    save,
  };
}

// Helper: Convert file to base64 data URL
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
