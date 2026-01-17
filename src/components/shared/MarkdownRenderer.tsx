import { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { createHighlighter, type Highlighter, type BundledLanguage, type BundledTheme } from 'shiki';
import { updateCheckbox as updateCheckboxIpc } from '@/services/tauriCommands';
import './MarkdownRenderer.css';

interface MarkdownRendererProps {
  content: string;
  filePath?: string;
  onCheckboxToggle?: (lineNumber: number, checked: boolean) => void;
}

interface CheckboxState {
  [line: number]: boolean;
}

// Singleton highlighter instance
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

// Themes
const LIGHT_THEME: BundledTheme = 'github-light';
const DARK_THEME: BundledTheme = 'github-dark';

async function getHighlighter(): Promise<Highlighter> {
  if (highlighterInstance) {
    return highlighterInstance;
  }

  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: [LIGHT_THEME, DARK_THEME],
      langs: COMMON_LANGUAGES,
    });
  }

  highlighterInstance = await highlighterPromise;
  return highlighterInstance;
}

// Language alias mapping
const LANGUAGE_ALIASES: Record<string, BundledLanguage> = {
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
  if (!lang) return 'text' as BundledLanguage;
  const normalized = lang.toLowerCase();
  return (LANGUAGE_ALIASES[normalized] || normalized) as BundledLanguage;
}

export function MarkdownRenderer({ content, filePath, onCheckboxToggle }: MarkdownRendererProps) {
  const [localContent, setLocalContent] = useState(content);
  const [checkboxStates, setCheckboxStates] = useState<CheckboxState>({});
  const [highlighter, setHighlighter] = useState<Highlighter | null>(null);

  // Initialize highlighter
  useEffect(() => {
    getHighlighter()
      .then(setHighlighter)
      .catch((err) => console.error('Failed to load highlighter:', err));
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

  // Detect if user prefers dark mode
  const prefersDarkMode = useRef(
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  );

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

        const theme = prefersDarkMode.current ? DARK_THEME : LIGHT_THEME;

        try {
          const html = highlighter.codeToHtml(codeString, {
            lang,
            theme,
          });
          setHighlightedHtml(html);
        } catch (err) {
          // Language not loaded, try to load it dynamically
          console.warn(`Language ${lang} not loaded, falling back to plain text`);
          setHighlightedHtml(null);
        }
      }, [codeString, lang]);

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
    [highlighter]
  );

  // Custom components for ReactMarkdown
  const components = {
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
            className="md-checkbox"
            disabled={!filePath}
          />
        );
      }
      return <input {...props} />;
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
  };

  return (
    <div className="markdown-renderer">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {localContent}
      </ReactMarkdown>
    </div>
  );
}
