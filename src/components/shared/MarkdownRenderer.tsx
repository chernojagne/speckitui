import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { createHighlighter, type Highlighter, type BundledLanguage, type BundledTheme } from 'shiki';
import { updateCheckbox as updateCheckboxIpc } from '@/services/tauriCommands';
import { useMarkdownTheme } from '@/hooks/useTheme';
import { editorThemes } from '@/config/editorThemes';

interface MarkdownRendererProps {
  content: string;
  filePath?: string;
  onCheckboxToggle?: (lineNumber: number, checked: boolean) => void;
}

interface CheckboxState {
  [line: number]: boolean;
}

// Single highlighter instance loaded with all markdown themes
let highlighterPromise: Promise<Highlighter> | null = null;
let highlighterInstance: Highlighter | null = null;

// Common languages to pre-load
const COMMON_LANGUAGES: BundledLanguage[] = [
  'javascript',
  'typescript',
  'tsx',
  'jsx',
  'json',
  'markdown',
  'html',
  'css',
  'bash',
  'shell',
  'python',
  'rust',
  'yaml',
  'toml',
];

/**
 * Get or create a highlighter loaded with all supported themes
 * @feature 006-more-themes - Dynamic theme support
 */
export async function getHighlighter(): Promise<Highlighter> {
  if (highlighterInstance) {
    return highlighterInstance;
  }

  if (!highlighterPromise) {
    const themes = editorThemes.map((theme) => theme.shikiName) as BundledTheme[];
    highlighterPromise = createHighlighter({
      themes,
      langs: COMMON_LANGUAGES,
    });
  }

  highlighterInstance = await highlighterPromise;
  return highlighterInstance;
}

// Language alias mapping
const LANGUAGE_ALIASES: Record<string, BundledLanguage> = {
  text: 'markdown',
  plaintext: 'markdown',
  txt: 'markdown',
  js: 'javascript',
  ts: 'typescript',
  sh: 'bash',
  zsh: 'bash',
  yml: 'yaml',
  py: 'python',
  rs: 'rust',
  md: 'markdown',
};

function normalizeLanguage(lang: string | undefined): BundledLanguage {
  if (!lang) return 'markdown' as BundledLanguage;
  const normalized = lang.toLowerCase();
  return (LANGUAGE_ALIASES[normalized] || normalized) as BundledLanguage;
}

export function MarkdownRenderer({ content, filePath, onCheckboxToggle }: MarkdownRendererProps) {
  const [localContent, setLocalContent] = useState(content);
  const [checkboxStates, setCheckboxStates] = useState<CheckboxState>({});
  const [highlighter, setHighlighter] = useState<Highlighter | null>(null);

  // Get the current markdown theme from settings (006-more-themes)
  const { shikiTheme } = useMarkdownTheme();
  const currentTheme = shikiTheme as BundledTheme;

  // Initialize highlighter once (supports all themes)
  useEffect(() => {
    getHighlighter()
      .then((h) => {
        setHighlighter(h);
      })
      .catch((err) => {
        console.error('Failed to load highlighter:', err);
      });
  }, []);

  useEffect(() => {
    setLocalContent(content);
    // Parse checkbox states from content
    const states: CheckboxState = {};
    content.split('\n').forEach((line, idx) => {
      const match = line.match(/^(\s*)-\s*\[([ xX])\]/);
      if (match) {
        states[idx + 1] = match[2].toLowerCase() === 'x';
      }
    });
    setCheckboxStates(states);
  }, [content]);

  const handleCheckboxChange = async (lineNumber: number, checked: boolean) => {
    if (!filePath) return;

    try {
      // Optimistic update
      setCheckboxStates((prev) => ({ ...prev, [lineNumber]: checked }));

      // Update via IPC
      await updateCheckboxIpc({
        filePath,
        lineNumber,
        checked,
      });

      // Notify parent
      onCheckboxToggle?.(lineNumber, checked);
    } catch (err) {
      // Revert on error
      setCheckboxStates((prev) => ({ ...prev, [lineNumber]: !checked }));
      console.error('Failed to update checkbox:', err);
    }
  };

  // Code block component with Shiki syntax highlighting
  const CodeBlock = useCallback(
    ({ className, children, ...props }: React.HTMLAttributes<HTMLElement> & { children?: React.ReactNode }) => {
      const [highlightedHtml, setHighlightedHtml] = useState<string | null>(null);
      const codeRef = useRef<HTMLPreElement>(null);

      // Extract language from className (e.g., "language-typescript")
      const match = /language-(\w+)/.exec(className || '');
      const lang = normalizeLanguage(match?.[1]);
      const codeString = String(children).replace(/\n$/, '');

      useEffect(() => {
        if (!highlighter) return;

        // Use the current theme from settings (006-more-themes)
        try {
          const html = highlighter.codeToHtml(codeString, {
            lang,
            theme: currentTheme,
          });
          setHighlightedHtml(html);
        } catch (err) {
          // Language not loaded, try to load it dynamically
          console.warn(`Language ${lang} not loaded, falling back to plain text`);
          setHighlightedHtml(null);
        }
      }, [codeString, lang, highlighter, currentTheme]);

      // If we have highlighted HTML, render it
      if (highlightedHtml) {
        return (
          <div
            className="shiki-wrapper"
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        );
      }

      // Fallback to plain code block
      return (
        <pre ref={codeRef} className={className}>
          <code {...props}>{children}</code>
        </pre>
      );
    },
    [highlighter, currentTheme]
  );

  // Custom components for ReactMarkdown
  // useMemo to ensure ReactMarkdown re-renders when CodeBlock changes (theme updates)
  const components = useMemo(() => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    img: (props: any) => {
      const { src, alt, node, ...rest } = props;
      // Handle base64 data URLs properly
      const imageSrc = src || '';
      
      // Log for debugging if src is empty or malformed
      if (!imageSrc || (!imageSrc.startsWith('data:') && !imageSrc.startsWith('http'))) {
        console.warn('MarkdownRenderer: Invalid image src', { src, alt });
      }
      
      return (
        <img 
          src={imageSrc} 
          alt={alt || 'Image'} 
          loading="lazy"
          className="max-w-full h-auto rounded-md my-2"
          onError={(e) => {
            console.error('Image failed to load:', { src: imageSrc?.substring(0, 100), alt });
            // Hide broken image icon by setting to transparent placeholder
            (e.target as HTMLImageElement).style.display = 'none';
          }}
          {...rest}
        />
      );
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    input: (props: any) => {
      if (props.type === 'checkbox') {
        // Find the line number for this checkbox
        // This is a simplified approach - in production we'd need proper line mapping
        const lineNumber = props['data-line'] || 0;
        const isChecked = checkboxStates[lineNumber] ?? props.checked;

        return (
          <input
            type="checkbox"
            checked={isChecked}
            onChange={(e) => handleCheckboxChange(lineNumber, e.target.checked)}
            className="w-4 h-4 mt-1 cursor-pointer accent-primary disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!filePath}
          />
        );
      }
      return <input {...props} />;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pre: ({ children, ...props }: any) => {
      // Use a wrapper div instead of pre to avoid nesting pre inside pre,
      // which causes styling issues and invalid HTML. The inner CodeBlock 
      // component will handle rendering the actual pre tag.
      return <div className="code-wrapper" {...props}>{children}</div>;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    code: (props: any) => {
      const { className, children, node, ...rest } = props;
      // Check if this is a code block (inside pre) or inline code
      const isBlock = node?.position && 
        node.position.start.line !== node.position.end.line;
      
      if (isBlock || className?.includes('language-')) {
        return <CodeBlock className={className} {...rest}>{children}</CodeBlock>;
      }
      
      // Inline code
      return <code className={className} {...rest}>{children}</code>;
    },
  }), [CodeBlock, checkboxStates, filePath, handleCheckboxChange]);

  return (
    <div className="markdown-preview prose prose-sm max-w-none leading-relaxed font-extralight
      [&_h1]:text-3xl [&_h1]:font-semibold [&_h1]:mt-6 [&_h1]:mb-4 [&_h1]:pb-2 [&_h1]:border-b [&_h1]:border-border
      [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mt-5 [&_h2]:mb-3
      [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2
      [&_h4]:text-base [&_h4]:font-semibold [&_h4]:mt-3 [&_h4]:mb-2
      [&_p]:my-3
      [&_a]:no-underline hover:[&_a]:underline
      [&_ul]:my-2 [&_ul]:pl-8 [&_ol]:my-2 [&_ol]:pl-8
      [&_li]:my-1
      [&_code]:font-mono [&_code]:text-[0.9em] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-sm
      [&_pre:not(.shiki)]:p-4 [&_pre:not(.shiki)]:rounded-md [&_pre:not(.shiki)]:overflow-x-auto [&_pre:not(.shiki)]:my-4
      [&_pre:not(.shiki)_code]:bg-transparent [&_pre:not(.shiki)_code]:p-0 [&_pre:not(.shiki)_code]:text-sm [&_pre:not(.shiki)_code]:leading-relaxed
      [&_blockquote]:border-l-4 [&_blockquote]:my-4 [&_blockquote]:py-2 [&_blockquote]:px-4 [&_blockquote]:rounded-r-md
      [&_blockquote_p]:m-0
      [&_table]:w-full [&_table]:border-collapse [&_table]:my-4
      [&_th]:border [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold
      [&_td]:border [&_td]:px-3 [&_td]:py-2 [&_td]:text-left
      [&_hr]:border-none [&_hr]:border-t [&_hr]:border-border [&_hr]:my-8
      [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-md
      [&_strong]:font-bold
      [&_em]:italic
      [&_.shiki-wrapper]:my-4
      [&_.shiki-wrapper_pre]:p-4 [&_.shiki-wrapper_pre]:rounded-md [&_.shiki-wrapper_pre]:overflow-x-auto [&_.shiki-wrapper_pre]:m-0
      [&_.shiki-wrapper_code]:bg-transparent [&_.shiki-wrapper_code]:p-0 [&_.shiki-wrapper_code]:font-mono [&_.shiki-wrapper_code]:text-sm [&_.shiki-wrapper_code]:leading-relaxed
      [&_.shiki]:rounded-md
    ">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]} 
        components={components}
        urlTransform={(url) => url}
      >
        {localContent}
      </ReactMarkdown>
    </div>
  );
}
