/**
 * RichComposer Component
 * Rich text editor supporting text, code, images, links, and file uploads
 * Part of 005-ui-enhancements feature
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
  Image, 
  Link, 
  Upload, 
  Loader2,
  Check,
  AlertCircle,
} from 'lucide-react';

interface RichComposerProps {
  /** Current content */
  content: string;
  /** Called when content changes */
  onChange: (content: string) => void;
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

export function RichComposer({
  content,
  onChange,
  isSaving = false,
  isDirty = false,
  isLoading = false,
  error,
  placeholder = 'Describe the feature you want to build...',
  className = '',
  heightClass = 'min-h-[300px]',
}: RichComposerProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [insertStatus, setInsertStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Handle paste event for code and images
  const handlePaste = useCallback(async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    
    for (const item of items) {
      // Handle image paste
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          try {
            const base64 = await fileToBase64(file);
            const markdown = `![Pasted image](${base64})\n`;
            insertAtCursor(markdown);
            setInsertStatus('success');
          } catch (err) {
            console.error('Failed to convert image:', err);
            setInsertStatus('error');
          }
        }
        return;
      }
    }
    
    // For text, check if it looks like code
    const text = e.clipboardData.getData('text/plain');
    if (text && looksLikeCode(text)) {
      e.preventDefault();
      const language = detectLanguage(text);
      const codeBlock = `\n\`\`\`${language}\n${text}\n\`\`\`\n`;
      insertAtCursor(codeBlock);
      setInsertStatus('success');
    }
    // Otherwise let normal paste happen
  }, [insertAtCursor]);

  // Handle file upload
  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (const file of files) {
      if (file.type.startsWith('image/')) {
        // Convert image to base64 inline
        try {
          const base64 = await fileToBase64(file);
          const markdown = `![${file.name}](${base64})\n`;
          insertAtCursor(markdown);
          setInsertStatus('success');
        } catch (err) {
          console.error('Failed to convert image:', err);
          setInsertStatus('error');
        }
      } else {
        // For other files, just insert a reference
        const markdown = `📎 [${file.name}](file://${file.name})\n`;
        insertAtCursor(markdown);
        setInsertStatus('success');
      }
    }

    // Clear the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [insertAtCursor]);

  // Insert code block
  const handleInsertCode = useCallback(() => {
    insertAtCursor('\n```\n// Your code here\n```\n');
  }, [insertAtCursor]);

  // Insert image placeholder
  const handleInsertImage = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

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
                onClick={handleInsertImage}
                disabled={showPreview}
                className="h-7 w-7 p-0"
              >
                <Image className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Insert image</TooltipContent>
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
                <Link className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Insert link</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleInsertImage}
                disabled={showPreview}
                className="h-7 w-7 p-0"
              >
                <Upload className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Upload file</TooltipContent>
          </Tooltip>
        </div>

        {/* Status indicators */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {insertStatus === 'success' && (
            <span className="flex items-center gap-1 text-success">
              <Check className="h-3 w-3" /> Inserted
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

      {/* Content area */}
      <div className={cn("flex-1 overflow-hidden", heightClass)}>
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

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,text/*,.pdf,.md,.txt,.js,.ts,.jsx,.tsx,.py,.rs,.go,.java,.c,.cpp,.h,.hpp,.json,.yaml,.yml,.xml,.html,.css,.scss"
        onChange={handleFileChange}
        className="hidden"
        multiple
      />
    </div>
  );
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

// Helper: Detect if text looks like code
function looksLikeCode(text: string): boolean {
  const lines = text.split('\n');
  if (lines.length < 2) return false;
  
  // Check for common code patterns
  const codePatterns = [
    /^(import|export|const|let|var|function|class|interface|type|def|fn|pub|async|await)\s/m,
    /^\s*(if|else|for|while|return|switch|case|try|catch)\s*[\(\{]/m,
    /^(package|use|from|import)\s+/m,
    /[;{}]$/m,
    /=>/,
    /\bfunction\s*\(/,
    /^\s*@\w+/m, // Decorators
    /^\s*#\s*(include|define|pragma)/m, // C/C++ preprocessor
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
    [/^\s*@\w+\s*$/m, 'java'], // Annotations
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

  return ''; // No language hint
}
