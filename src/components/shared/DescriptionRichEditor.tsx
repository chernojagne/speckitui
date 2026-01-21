/**
 * DescriptionRichEditor Component
 * Rich text editor for feature descriptions with attachment support
 * Supports text, links, images, and document attachments
 * 
 * Attachments are:
 * - Saved to the same directory as FEATURE_DESC_FILE
 * - Referenced in a table at the bottom of the document
 * - Formatted for AI agent consumption
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MarkdownRenderer } from '@/components/shared/MarkdownRenderer';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { 
  Pencil, 
  Eye, 
  Code, 
  ImageIcon, 
  Link as LinkIcon, 
  Upload, 
  Loader2,
  Check,
  AlertCircle,
  FileText,
  Trash2,
  Copy,
} from 'lucide-react';

export interface AttachmentReference {
  id: string;
  type: 'image' | 'document';
  fileName: string;
  filePath: string;      // Relative path from description file
  displayName: string;   // User-friendly name
  mimeType: string;
  size: number;
  thumbnailBase64?: string;  // For images, a small thumbnail
  addedAt: Date;
}

interface DescriptionRichEditorProps {
  /** Current content */
  content: string;
  /** Called when content changes */
  onChange: (content: string) => void;
  /** Current attachments */
  attachments: AttachmentReference[];
  /** Called when attachments change */
  onAttachmentsChange: (attachments: AttachmentReference[]) => void;
  /** Called when a file needs to be saved to disk */
  onSaveAttachment: (file: File) => Promise<AttachmentReference | null>;
  /** Whether currently saving */
  isSaving?: boolean;
  /** Whether there are unsaved changes */
  isDirty?: boolean;
  /** Whether loading initial content */
  isLoading?: boolean;
  /** Error message */
  error?: string | null;
  /** Placeholder text */
  placeholder?: string;
  /** Class name for container */
  className?: string;
  /** Height class */
  heightClass?: string;
}

export function DescriptionRichEditor({
  content,
  onChange,
  attachments,
  onAttachmentsChange,
  onSaveAttachment,
  isSaving = false,
  isDirty = false,
  isLoading = false,
  error,
  placeholder = 'Describe the feature you want to build...',
  className = '',
  heightClass = 'min-h-[300px]',
}: DescriptionRichEditorProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [insertStatus, setInsertStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isDragging, setIsDragging] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Reset insert status after timeout
  useEffect(() => {
    if (insertStatus !== 'idle') {
      const timer = setTimeout(() => setInsertStatus('idle'), 2000);
      return () => clearTimeout(timer);
    }
  }, [insertStatus]);

  // Insert text at cursor position
  const insertAtCursor = useCallback((text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      onChange(content + text);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = content.substring(0, start);
    const after = content.substring(end);
    
    const newContent = before + text + after;
    onChange(newContent);
    
    // Restore cursor position after the inserted text
    requestAnimationFrame(() => {
      textarea.selectionStart = textarea.selectionEnd = start + text.length;
      textarea.focus();
    });
  }, [content, onChange]);

  // Handle file upload (both images and documents)
  const handleFileUpload = useCallback(async (file: File) => {
    
    try {
      // Save the file and get the reference
      const attachment = await onSaveAttachment(file);
      if (attachment) {
        // Add to attachments list
        const newAttachments = [...attachments, attachment];
        onAttachmentsChange(newAttachments);
        setInsertStatus('success');
      }
    } catch (err) {
      console.error('Failed to save attachment:', err);
      setInsertStatus('error');
    }
  }, [attachments, onAttachmentsChange, onSaveAttachment]);

  // Handle paste event
  const handlePaste = useCallback(async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    
    for (const item of items) {
      // Handle image paste
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          await handleFileUpload(file);
        }
        return;
      }
    }
    
    // For text, check if it's a URL
    const text = e.clipboardData.getData('text/plain');
    if (text && isValidUrl(text)) {
      e.preventDefault();
      insertAtCursor(`[Link](${text})`);
      setInsertStatus('success');
      return;
    }
    
    // Check if it looks like code
    if (text && looksLikeCode(text)) {
      e.preventDefault();
      const language = detectLanguage(text);
      const codeBlock = `\n\`\`\`${language}\n${text}\n\`\`\`\n`;
      insertAtCursor(codeBlock);
      setInsertStatus('success');
    }
    // Otherwise let normal paste happen
  }, [insertAtCursor, handleFileUpload]);

  // Handle drag events
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    // Handle files
    if (e.dataTransfer.files.length > 0) {
      for (const file of e.dataTransfer.files) {
        await handleFileUpload(file);
      }
      return;
    }

    // Handle text/URL drops
    const text = e.dataTransfer.getData('text/plain');
    if (text) {
      if (isValidUrl(text)) {
        insertAtCursor(`[Link](${text})`);
      } else {
        insertAtCursor(text);
      }
    }
  }, [handleFileUpload, insertAtCursor]);

  // Handle file input change
  const handleFileInputChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (const file of files) {
      await handleFileUpload(file);
    }

    // Clear the input
    e.target.value = '';
  }, [handleFileUpload]);

  // Remove an attachment
  const handleRemoveAttachment = useCallback((id: string) => {
    const newAttachments = attachments.filter(a => a.id !== id);
    onAttachmentsChange(newAttachments);
  }, [attachments, onAttachmentsChange]);

  // Copy reference to clipboard
  const handleCopyReference = useCallback((attachment: AttachmentReference) => {
    const refText = `[${attachment.id}]`;
    navigator.clipboard.writeText(refText);
    setInsertStatus('success');
  }, []);

  // Insert reference at cursor
  const handleInsertReference = useCallback((attachment: AttachmentReference) => {
    const refText = `[${attachment.id}]`;
    insertAtCursor(refText);
  }, [insertAtCursor]);

  // Insert code block
  const handleInsertCode = useCallback(() => {
    insertAtCursor('\n```\n// Your code here\n```\n');
  }, [insertAtCursor]);

  // Insert link
  const handleInsertLink = useCallback(() => {
    insertAtCursor('[Link text](url)');
  }, [insertAtCursor]);

  // Loading state
  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center", heightClass, className)}>
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-border bg-card/50 px-2 py-1">
        <div className="flex items-center gap-1">
          {/* Edit/Preview toggle */}
          <Button
            variant={showPreview ? 'outline' : 'secondary'}
            size="sm"
            onClick={() => setShowPreview(false)}
            className="h-7 px-2"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant={showPreview ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setShowPreview(true)}
            className="h-7 px-2"
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>

          <div className="w-px h-5 bg-border mx-1" />

          {/* Insert tools */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleInsertCode}
                disabled={showPreview}
                className="h-7 w-7 p-0"
              >
                <Code className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Insert code block</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => imageInputRef.current?.click()}
                disabled={showPreview}
                className="h-7 w-7 p-0"
              >
                <ImageIcon className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Attach image</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleInsertLink}
                disabled={showPreview}
                className="h-7 w-7 p-0"
              >
                <LinkIcon className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Insert link</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={showPreview}
                className="h-7 w-7 p-0"
              >
                <Upload className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Attach document</TooltipContent>
          </Tooltip>
        </div>

        {/* Status indicators */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {insertStatus === 'success' && (
            <span className="flex items-center gap-1 text-success">
              <Check className="h-3 w-3" /> Added
            </span>
          )}
          {insertStatus === 'error' && (
            <span className="flex items-center gap-1 text-destructive">
              <AlertCircle className="h-3 w-3" /> Failed
            </span>
          )}
          {isSaving && (
            <span className="flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" /> Saving...
            </span>
          )}
          {isDirty && !isSaving && (
            <span className="text-warning">Unsaved</span>
          )}
          {!isDirty && !isSaving && content && (
            <span className="text-success">Saved</span>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="px-3 py-1.5 bg-destructive/10 text-destructive text-xs">
          {error}
        </div>
      )}

      {/* Content area with drag and drop */}
      <div 
        className={cn(
          "flex-1 overflow-hidden relative",
          heightClass,
          isDragging && "ring-2 ring-primary ring-inset bg-primary/5"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDragging && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <div className="flex flex-col items-center gap-2 text-primary">
              <Upload className="h-8 w-8" />
              <span className="font-medium">Drop to attach</span>
            </div>
          </div>
        )}
        
        {showPreview ? (
          <div className="h-full overflow-y-auto p-4">
            {content ? (
              <MarkdownRenderer content={content} />
            ) : (
              <p className="text-muted-foreground text-sm italic">{placeholder}</p>
            )}
          </div>
        ) : (
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => onChange(e.target.value)}
            onPaste={handlePaste}
            placeholder={placeholder}
            className="h-full w-full resize-none border-0 rounded-none focus-visible:ring-0 font-mono text-sm p-4"
          />
        )}
      </div>

      {/* Attachments panel */}
      {attachments.length > 0 && (
        <div className="border-t border-border bg-muted/30">
          <div className="px-3 py-2 text-xs font-medium text-muted-foreground border-b border-border">
            Attachments ({attachments.length})
          </div>
          <div className="max-h-[200px] overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/50 sticky top-0">
                <tr>
                  <th className="text-left px-3 py-1.5 font-medium">Reference</th>
                  <th className="text-left px-3 py-1.5 font-medium">Type</th>
                  <th className="text-left px-3 py-1.5 font-medium">Name</th>
                  <th className="text-right px-3 py-1.5 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {attachments.map((attachment) => (
                  <tr key={attachment.id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="px-3 py-1.5">
                      <code className="bg-muted px-1 py-0.5 rounded text-primary font-mono">
                        [{attachment.id}]
                      </code>
                    </td>
                    <td className="px-3 py-1.5">
                      <span className="flex items-center gap-1">
                        {attachment.type === 'image' ? (
                          <ImageIcon className="h-3 w-3" />
                        ) : (
                          <FileText className="h-3 w-3" />
                        )}
                        {attachment.type}
                      </span>
                    </td>
                    <td className="px-3 py-1.5 truncate max-w-[200px]" title={attachment.fileName}>
                      {attachment.displayName}
                    </td>
                    <td className="px-3 py-1.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleInsertReference(attachment)}
                              className="h-6 w-6 p-0"
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Insert reference at cursor</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyReference(attachment)}
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Copy reference</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveAttachment(attachment.id)}
                              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Remove attachment</TooltipContent>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
        multiple
      />
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.md,.txt,.doc,.docx,.xls,.xlsx,.json,.yaml,.yml,.xml,.csv"
        onChange={handleFileInputChange}
        className="hidden"
        multiple
      />
    </div>
  );
}

// Helper: Generate references section markdown
function generateReferencesSection(attachments: AttachmentReference[]): string {
  if (attachments.length === 0) return '';

  let section = '## Attachment References\n\n';
  section += '> **Note for AI Agent**: The following attachments are referenced in the description above.\n';
  section += '> Use the reference ID (e.g., [IMG-001]) to locate where the attachment is mentioned.\n';
  section += '> Load the file from the relative path provided.\n\n';

  section += '| Reference | Type | File | Description |\n';
  section += '|-----------|------|------|-------------|\n';

  for (const attachment of attachments) {
    const type = attachment.type === 'image' ? '🖼️ Image' : '📄 Document';
    section += `| \`[${attachment.id}]\` | ${type} | \`${attachment.filePath}\` | ${attachment.displayName} |\n`;
  }

  return section;
}

// Helper: Check if string is a valid URL
function isValidUrl(str: string): boolean {
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

// Helper: Detect if text looks like code
function looksLikeCode(text: string): boolean {
  const lines = text.split('\n');
  if (lines.length < 2) return false;
  
  const codePatterns = [
    /^(import|export|const|let|var|function|class|interface|type|def|fn|pub|async|await)\s/m,
    /^\s*(if|else|for|while|return|switch|case|try|catch)\s*[\(\{]/m,
    /^(package|use|from|import)\s+/m,
    /[;{}]$/m,
    /=>/,
    /\bfunction\s*\(/,
    /^\s*@\w+/m,
    /^\s*#\s*(include|define|pragma)/m,
  ];

  return codePatterns.some(pattern => pattern.test(text));
}

// Helper: Detect programming language from code
function detectLanguage(code: string): string {
  const patterns: [RegExp, string][] = [
    [/^\s*(import\s+React|from\s+['"]react['"])/m, 'tsx'],
    [/^\s*import\s+.*from\s+['"]/m, 'typescript'],
    [/^\s*const\s+\w+\s*:\s*\w+/m, 'typescript'],
    [/^\s*(def|class|import|from)\s+\w/m, 'python'],
    [/^\s*(fn|pub|use|mod|struct|impl)\s+/m, 'rust'],
    [/^\s*(func|package|import)\s+/m, 'go'],
    [/^\s*(public|private|protected)\s+(class|interface|static)/m, 'java'],
    [/^\s*#include\s+[<"]/m, 'cpp'],
    [/^\s*@\w+\s*$/m, 'java'],
    [/^\s*<\?php/m, 'php'],
    [/^\s*<(html|div|span|p|a)\b/m, 'html'],
    [/^\s*\.([\w-]+)\s*\{/m, 'css'],
    [/^\s*\{[\s\S]*"[\w]+":/m, 'json'],
    [/^\s*[\w-]+:\s*$/m, 'yaml'],
  ];

  for (const [pattern, lang] of patterns) {
    if (pattern.test(code)) {
      return lang;
    }
  }

  return '';
}

// Export helper for getting content with references (for parent components)
export { generateReferencesSection };
