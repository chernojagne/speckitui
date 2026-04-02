/**
 * ThemeSettings Component
 * Theme selection and customization options
 * 
 * @feature 006-more-themes - Expanded with palette, editor, and markdown theme selectors
 */

import { useEffect, useRef, useState } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import { cn } from '@/lib/utils';
import { Sun, Moon, Monitor, Check, type LucideIcon, Terminal, Code2, Square } from 'lucide-react';

// Theme selector components
import { AppPaletteSelector } from './AppPaletteSelector';
import { TerminalThemeSelector } from './TerminalThemeSelector';
import { EditorThemeSelector } from './EditorThemeSelector';
import { MarkdownThemeSelector } from './MarkdownThemeSelector';
import { MarkdownPreviewThemeSelector } from './MarkdownPreviewThemeSelector';

type Theme = 'light' | 'dark' | 'system';

const themes: { value: Theme; label: string; icon: LucideIcon }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

const fontSizes = [12, 13, 14, 15, 16, 18];
const terminalFontFamilies = [
  { value: 'Consolas, "Courier New", monospace', label: 'Consolas' },
  { value: 'Menlo, Monaco, "Courier New", monospace', label: 'Menlo / Monaco' },
  { value: '"Cascadia Code", Consolas, monospace', label: 'Cascadia Code' },
  { value: '"Fira Code", Consolas, monospace', label: 'Fira Code' },
  { value: '"JetBrains Mono", Consolas, monospace', label: 'JetBrains Mono' },
  { value: 'monospace', label: 'System Monospace' },
];

export function ThemeSettings() {
  const theme = useSettingsStore((state) => state.theme);
  const setTheme = useSettingsStore((state) => state.setTheme);
  
  // Editor settings
  const editorFontSize = useSettingsStore((state) => state.editorFontSize);
  const setEditorFontSize = useSettingsStore((state) => state.setEditorFontSize);
  const editorLineNumbers = useSettingsStore((state) => state.editorLineNumbers);
  const setEditorLineNumbers = useSettingsStore((state) => state.setEditorLineNumbers);
  const editorWordWrap = useSettingsStore((state) => state.editorWordWrap);
  const setEditorWordWrap = useSettingsStore((state) => state.setEditorWordWrap);

  // UI settings
  const squareCorners = useSettingsStore((state) => state.squareCorners);
  const setSquareCorners = useSettingsStore((state) => state.setSquareCorners);

  // Terminal settings (non-theme)
  const terminalFontSize = useSettingsStore((state) => state.terminalFontSize);
  const setTerminalFontSize = useSettingsStore((state) => state.setTerminalFontSize);
  const terminalFontFamily = useSettingsStore((state) => state.terminalFontFamily);
  const setTerminalFontFamily = useSettingsStore((state) => state.setTerminalFontFamily);
  const terminalPanelHeight = useSettingsStore((state) => state.terminalPanelHeight);
  const setTerminalPanelHeight = useSettingsStore((state) => state.setTerminalPanelHeight);

  const [terminalPanelHeightInput, setTerminalPanelHeightInput] = useState(
    String(terminalPanelHeight)
  );
  const isEditingPanelHeightRef = useRef(false);

  useEffect(() => {
    if (!isEditingPanelHeightRef.current) {
      setTerminalPanelHeightInput(String(terminalPanelHeight));
    }
  }, [terminalPanelHeight]);

  const commitTerminalPanelHeight = (value: string) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      setTerminalPanelHeightInput(String(terminalPanelHeight));
      return;
    }
    setTerminalPanelHeight(Math.round(parsed));
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Light/Dark/System Mode */}
      <div className="pb-6 border-b border-border last:border-b-0 last:pb-0">
        <h3 className="text-[15px] font-semibold m-0 mb-2 text-foreground flex items-center gap-2">
          <Monitor className="h-4 w-4" />
          Mode
        </h3>
        <p className="text-[13px] text-muted-foreground m-0 mb-4">
          Choose light, dark, or follow your system preference.
        </p>

        <div className="flex gap-3">
          {themes.map((option) => (
            <button
              key={option.value}
              className={cn(
                "flex flex-col items-center gap-2 px-6 py-4 bg-card border-2 border-border rounded-lg cursor-pointer transition-all relative hover:border-border hover:bg-accent",
                theme === option.value && "border-primary bg-primary/5"
              )}
              onClick={() => setTheme(option.value)}
              aria-pressed={theme === option.value}
            >
              <option.icon className="h-6 w-6 text-foreground" />
              <span className="text-[13px] font-medium text-foreground">{option.label}</span>
              {theme === option.value && (
                <Check className="absolute top-2 right-2 h-4 w-4 text-primary" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* App Palette Selection */}
      <AppPaletteSelector />

      {/* UI options */}
      <div className="pb-6 border-b border-border last:border-b-0 last:pb-0">
        <h3 className="text-[15px] font-semibold m-0 mb-2 text-foreground flex items-center gap-2">
          <Square className="h-4 w-4" />
          UI
        </h3>

        <div className="flex items-center justify-between gap-4 py-3 first:pt-0">
          <div className="flex flex-col gap-0.5">
            <label className="text-sm font-medium text-foreground">Square Corners</label>
            <span className="text-xs text-muted-foreground">
              Set UI corner radii to 0 for a squared theme
            </span>
          </div>
          <input 
            type="checkbox" 
            className="w-10 h-5.5 appearance-none bg-muted rounded-full cursor-pointer relative transition-colors checked:bg-primary before:content-[''] before:absolute before:top-0.5 before:left-0.5 before:w-4.5 before:h-4.5 before:bg-white before:rounded-full before:transition-transform before:shadow checked:before:translate-x-4.5 focus:outline-none focus:ring-2 focus:ring-primary/20"
            checked={squareCorners}
            onChange={(e) => setSquareCorners(e.target.checked)}
          />
        </div>
      </div>

      <div className="pb-6 border-b border-border last:border-b-0 last:pb-0">
        <h3 className="text-[15px] font-semibold m-0 mb-2 text-foreground flex items-center gap-2">
          <Code2 className="h-4 w-4" />
          Editor
        </h3>
        
        {/* Editor Theme Selector */}
        <EditorThemeSelector />

        <div className="flex items-center justify-between gap-4 py-3">
          <div className="flex flex-col gap-0.5">
            <label className="text-sm font-medium text-foreground">Font Size</label>
            <span className="text-xs text-muted-foreground">
              Adjust the font size in code viewers
            </span>
          </div>
          <select 
            className="px-3 py-1.5 text-[13px] border border-border rounded bg-card text-foreground cursor-pointer hover:border-border focus:outline-none focus:border-primary"
            value={editorFontSize}
            onChange={(e) => setEditorFontSize(Number(e.target.value))}
          >
            {fontSizes.map((size) => (
              <option key={size} value={size}>{size}px</option>
            ))}
          </select>
        </div>

        {/* Markdown Theme Selector */}
        <MarkdownThemeSelector />

        {/* Markdown Preview Theme Selector */}
        <MarkdownPreviewThemeSelector />

        <div className="flex items-center justify-between gap-4 py-3">
          <div className="flex flex-col gap-0.5">
            <label className="text-sm font-medium text-foreground">Line Numbers</label>
            <span className="text-xs text-muted-foreground">
              Show line numbers in source viewers
            </span>
          </div>
          <input 
            type="checkbox" 
            className="w-10 h-5.5 appearance-none bg-muted rounded-full cursor-pointer relative transition-colors checked:bg-primary before:content-[''] before:absolute before:top-0.5 before:left-0.5 before:w-4.5 before:h-4.5 before:bg-white before:rounded-full before:transition-transform before:shadow checked:before:translate-x-4.5 focus:outline-none focus:ring-2 focus:ring-primary/20"
            checked={editorLineNumbers}
            onChange={(e) => setEditorLineNumbers(e.target.checked)}
          />
        </div>

        <div className="flex items-center justify-between gap-4 py-3">
          <div className="flex flex-col gap-0.5">
            <label className="text-sm font-medium text-foreground">Word Wrap</label>
            <span className="text-xs text-muted-foreground">
              Wrap long lines in viewers
            </span>
          </div>
          <input 
            type="checkbox" 
            className="w-10 h-5.5 appearance-none bg-muted rounded-full cursor-pointer relative transition-colors checked:bg-primary before:content-[''] before:absolute before:top-0.5 before:left-0.5 before:w-4.5 before:h-4.5 before:bg-white before:rounded-full before:transition-transform before:shadow checked:before:translate-x-4.5 focus:outline-none focus:ring-2 focus:ring-primary/20"
            checked={editorWordWrap}
            onChange={(e) => setEditorWordWrap(e.target.checked)}
          />
        </div>
      </div>

      <div className="pb-6 border-b border-border last:border-b-0 last:pb-0">
        <h3 className="text-[15px] font-semibold m-0 mb-2 text-foreground flex items-center gap-2">
          <Terminal className="h-4 w-4" />
          Terminal
        </h3>
        
        {/* Terminal Theme Selector (uses the new component) */}
        <TerminalThemeSelector />

        <div className="flex items-center justify-between gap-4 py-3">
          <div className="flex flex-col gap-0.5">
            <label className="text-sm font-medium text-foreground">Font Size</label>
            <span className="text-xs text-muted-foreground">
              Adjust the terminal text size
            </span>
          </div>
          <select 
            className="px-3 py-1.5 text-[13px] border border-border rounded bg-card text-foreground cursor-pointer hover:border-border focus:outline-none focus:border-primary"
            value={terminalFontSize}
            onChange={(e) => setTerminalFontSize(Number(e.target.value))}
          >
            {fontSizes.map((size) => (
              <option key={size} value={size}>{size}px</option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between gap-4 py-3">
          <div className="flex flex-col gap-0.5">
            <label className="text-sm font-medium text-foreground">Font Family</label>
            <span className="text-xs text-muted-foreground">
              Choose the terminal font
            </span>
          </div>
          <select 
            className="px-3 py-1.5 text-[13px] border border-border rounded bg-card text-foreground cursor-pointer hover:border-border focus:outline-none focus:border-primary min-w-45"
            value={terminalFontFamily}
            onChange={(e) => setTerminalFontFamily(e.target.value)}
          >
            {terminalFontFamilies.map((font) => (
              <option key={font.value} value={font.value}>{font.label}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between gap-4 py-3">
          <div className="flex flex-col gap-0.5">
            <label className="text-sm font-medium text-foreground">Panel Height</label>
            <span className="text-xs text-muted-foreground">
              Default height of the terminal panel (100-600px). Applies on blur or Enter.
            </span>
          </div>
          <input
            type="number"
            value={terminalPanelHeightInput}
            onChange={(e) => {
              isEditingPanelHeightRef.current = true;
              setTerminalPanelHeightInput(e.target.value);
            }}
            onBlur={() => {
              isEditingPanelHeightRef.current = false;
              commitTerminalPanelHeight(terminalPanelHeightInput);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                (e.target as HTMLInputElement).blur();
              }
              if (e.key === 'Escape') {
                e.preventDefault();
                isEditingPanelHeightRef.current = false;
                setTerminalPanelHeightInput(String(terminalPanelHeight));
                (e.target as HTMLInputElement).blur();
              }
            }}
            min={100}
            max={600}
            className="w-20 px-2 py-1.5 text-[13px] border border-border rounded bg-card text-foreground focus:outline-none focus:border-primary"
          />
        </div>
      </div>
    </div>
  );
}
