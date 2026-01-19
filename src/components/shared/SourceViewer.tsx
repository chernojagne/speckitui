/**
 * SourceViewer Component
 * Read-only source code viewer with syntax highlighting
 */

import { useState, useEffect, useMemo } from 'react';
import { createHighlighter, type Highlighter, type BundledLanguage, type BundledTheme } from 'shiki';
import { useSettingsStore } from '@/stores/settingsStore';

interface SourceViewerProps {
  code: string;
  language?: string;
  fileName?: string;
  showLineNumbers?: boolean;
  highlightLines?: number[];
  maxHeight?: string;
  /** Override font size from settings */
  fontSize?: number;
  /** Override word wrap from settings */
  wordWrap?: boolean;
}

// Reuse the highlighter from MarkdownRenderer
let highlighterPromise: Promise<Highlighter> | null = null;
let highlighterInstance: Highlighter | null = null;

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

const LANGUAGE_MAP: Record<string, BundledLanguage> = {
  js: 'javascript',
  ts: 'typescript',
  sh: 'bash',
  zsh: 'bash',
  yml: 'yaml',
  py: 'python',
  rs: 'rust',
  md: 'markdown',
  txt: 'markdown',
};

function getLanguageFromFileName(fileName?: string): BundledLanguage {
  if (!fileName) return 'markdown';
  
  const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
  const mapped = LANGUAGE_MAP[ext];
  if (mapped) return mapped;
  
  // Try direct match
  if (COMMON_LANGUAGES.includes(ext as BundledLanguage)) {
    return ext as BundledLanguage;
  }
  
  return 'markdown';
}

export function SourceViewer({
  code,
  language,
  fileName,
  showLineNumbers,
  highlightLines = [],
  maxHeight = '600px',
  fontSize,
  wordWrap,
}: SourceViewerProps) {
  // Get settings from store (props override settings)
  const settingsLineNumbers = useSettingsStore((state) => state.editorLineNumbers);
  const settingsFontSize = useSettingsStore((state) => state.editorFontSize);
  const settingsWordWrap = useSettingsStore((state) => state.editorWordWrap);

  const resolvedShowLineNumbers = showLineNumbers ?? settingsLineNumbers;
  const resolvedFontSize = fontSize ?? settingsFontSize;
  const resolvedWordWrap = wordWrap ?? settingsWordWrap;

  const [highlighter, setHighlighter] = useState<Highlighter | null>(null);
  const [highlightedHtml, setHighlightedHtml] = useState<string | null>(null);

  // Determine language
  const resolvedLanguage = useMemo(() => {
    if (language) {
      return (LANGUAGE_MAP[language] || language) as BundledLanguage;
    }
    return getLanguageFromFileName(fileName);
  }, [language, fileName]);

  // Initialize highlighter
  useEffect(() => {
    getHighlighter()
      .then(setHighlighter)
      .catch((err) => console.error('Failed to load highlighter:', err));
  }, []);

  // Highlight code
  useEffect(() => {
    if (!highlighter || !code) {
      setHighlightedHtml(null);
      return;
    }

    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    const theme = prefersDark ? DARK_THEME : LIGHT_THEME;

    try {
      const html = highlighter.codeToHtml(code, {
        lang: resolvedLanguage,
        theme,
      });
      setHighlightedHtml(html);
    } catch {
      // Language not supported, fallback
      setHighlightedHtml(null);
    }
  }, [highlighter, code, resolvedLanguage]);

  const lines = code.split('\n');
  const highlightSet = useMemo(() => new Set(highlightLines), [highlightLines]);

  return (
    <div 
      className="flex flex-col border border-border rounded-md overflow-hidden bg-card h-full" 
      style={{ maxHeight: maxHeight === '100%' ? undefined : maxHeight }}
    >
      {fileName && (
        <div className="flex items-center justify-between px-3 py-2 bg-muted border-b border-border text-[0.8125rem] shrink-0">
          <span className="font-mono font-medium text-foreground">{fileName}</span>
          <span className="text-muted-foreground uppercase text-[0.6875rem] font-semibold">{resolvedLanguage}</span>
        </div>
      )}
      
      <div className="flex flex-1 overflow-auto min-h-0">
        {resolvedShowLineNumbers && (
          <div className="shrink-0 py-3 bg-muted border-r border-border text-right select-none">
            {lines.map((_, idx) => (
              <div
                key={idx + 1}
                className={`px-3 font-mono leading-relaxed text-muted-foreground min-w-10 ${highlightSet.has(idx + 1) ? 'bg-warning/20 text-warning' : ''}`}
                style={{ fontSize: `${resolvedFontSize}px` }}
              >
                {idx + 1}
              </div>
            ))}
          </div>
        )}
        
        <div className="flex-1 overflow-x-auto">
          {highlightedHtml ? (
            <div
              className={`m-0 px-4 py-3 font-mono leading-relaxed [&_.shiki]:bg-transparent! [&_.shiki]:p-0! [&_.shiki]:m-0! [&_.shiki_code]:bg-transparent! ${resolvedWordWrap ? 'whitespace-pre-wrap wrap-break-word' : ''}`}
              style={{ fontSize: `${resolvedFontSize}px` }}
              dangerouslySetInnerHTML={{ __html: highlightedHtml }}
            />
          ) : (
            <pre 
              className={`m-0 px-4 py-3 font-mono leading-relaxed bg-transparent ${resolvedWordWrap ? 'whitespace-pre-wrap wrap-break-word' : 'whitespace-pre'}`}
              style={{ fontSize: `${resolvedFontSize}px` }}
            >
              <code>
                {lines.map((line, idx) => (
                  <div
                    key={idx}
                    className={`min-h-[1.5em] ${highlightSet.has(idx + 1) ? 'bg-warning/15 -mx-4 px-4' : ''}`}
                  >
                    {line || ' '}
                  </div>
                ))}
              </code>
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
