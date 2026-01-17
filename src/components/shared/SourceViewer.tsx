/**
 * SourceViewer Component
 * Read-only source code viewer with syntax highlighting
 */

import { useState, useEffect, useMemo } from 'react';
import { createHighlighter, type Highlighter, type BundledLanguage, type BundledTheme } from 'shiki';
import './SourceViewer.css';

interface SourceViewerProps {
  code: string;
  language?: string;
  fileName?: string;
  showLineNumbers?: boolean;
  highlightLines?: number[];
  maxHeight?: string;
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
  showLineNumbers = true,
  highlightLines = [],
  maxHeight = '600px',
}: SourceViewerProps) {
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
    <div className="source-viewer" style={{ maxHeight }}>
      {fileName && (
        <div className="source-viewer-header">
          <span className="source-viewer-filename">{fileName}</span>
          <span className="source-viewer-language">{resolvedLanguage}</span>
        </div>
      )}
      
      <div className="source-viewer-content">
        {showLineNumbers && (
          <div className="line-numbers">
            {lines.map((_, idx) => (
              <div
                key={idx + 1}
                className={`line-number ${highlightSet.has(idx + 1) ? 'highlighted' : ''}`}
              >
                {idx + 1}
              </div>
            ))}
          </div>
        )}
        
        <div className="source-code-container">
          {highlightedHtml ? (
            <div
              className="source-code highlighted"
              dangerouslySetInnerHTML={{ __html: highlightedHtml }}
            />
          ) : (
            <pre className="source-code plain">
              <code>
                {lines.map((line, idx) => (
                  <div
                    key={idx}
                    className={`code-line ${highlightSet.has(idx + 1) ? 'highlighted' : ''}`}
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
