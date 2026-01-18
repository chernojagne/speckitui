/**
 * ThemeSettings Component
 * Theme selection and customization options
 */

import { useSettingsStore, type TerminalThemeSetting } from '@/stores/settingsStore';
import { terminalThemes } from '@/config/terminalThemes';
import { cn } from '@/lib/utils';
import { Sun, Moon, Monitor, Check, type LucideIcon, Terminal } from 'lucide-react';

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

const terminalThemeOptions: { value: TerminalThemeSetting; label: string }[] = [
  { value: 'auto', label: 'Auto (follow app theme)' },
  ...terminalThemes.map((t) => ({ value: t.id as TerminalThemeSetting, label: t.name })),
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
  
  // Sidebar settings
  const sidebarShowIcons = useSettingsStore((state) => state.sidebarShowIcons);
  const setSidebarShowIcons = useSettingsStore((state) => state.setSidebarShowIcons);
  const sidebarCompactMode = useSettingsStore((state) => state.sidebarCompactMode);
  const setSidebarCompactMode = useSettingsStore((state) => state.setSidebarCompactMode);

  // Terminal settings
  const terminalFontSize = useSettingsStore((state) => state.terminalFontSize);
  const setTerminalFontSize = useSettingsStore((state) => state.setTerminalFontSize);
  const terminalFontFamily = useSettingsStore((state) => state.terminalFontFamily);
  const setTerminalFontFamily = useSettingsStore((state) => state.setTerminalFontFamily);
  const terminalTheme = useSettingsStore((state) => state.terminalTheme);
  const setTerminalTheme = useSettingsStore((state) => state.setTerminalTheme);
  const terminalCursorBlink = useSettingsStore((state) => state.terminalCursorBlink);
  const setTerminalCursorBlink = useSettingsStore((state) => state.setTerminalCursorBlink);

  return (
    <div className="flex flex-col gap-6">
      <div className="pb-6 border-b border-border last:border-b-0 last:pb-0">
        <h3 className="text-[15px] font-semibold m-0 mb-2 text-foreground">Theme</h3>
        <p className="text-[13px] text-muted-foreground m-0 mb-4">
          Choose how SpeckitUI looks to you. Select a theme preference.
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

      <div className="pb-6 border-b border-border last:border-b-0 last:pb-0">
        <h3 className="text-[15px] font-semibold m-0 mb-2 text-foreground">Editor</h3>
        
        <div className="flex items-center justify-between gap-4 py-3 first:pt-0">
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

        <div className="flex items-center justify-between gap-4 py-3">
          <div className="flex flex-col gap-0.5">
            <label className="text-sm font-medium text-foreground">Line Numbers</label>
            <span className="text-xs text-muted-foreground">
              Show line numbers in source viewers
            </span>
          </div>
          <input 
            type="checkbox" 
            className="w-10 h-[22px] appearance-none bg-muted rounded-full cursor-pointer relative transition-colors checked:bg-primary before:content-[''] before:absolute before:top-0.5 before:left-0.5 before:w-[18px] before:h-[18px] before:bg-white before:rounded-full before:transition-transform before:shadow checked:before:translate-x-[18px] focus:outline-none focus:ring-2 focus:ring-primary/20"
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
            className="w-10 h-[22px] appearance-none bg-muted rounded-full cursor-pointer relative transition-colors checked:bg-primary before:content-[''] before:absolute before:top-0.5 before:left-0.5 before:w-[18px] before:h-[18px] before:bg-white before:rounded-full before:transition-transform before:shadow checked:before:translate-x-[18px] focus:outline-none focus:ring-2 focus:ring-primary/20"
            checked={editorWordWrap}
            onChange={(e) => setEditorWordWrap(e.target.checked)}
          />
        </div>
      </div>

      <div className="pb-6 border-b border-border last:border-b-0 last:pb-0">
        <h3 className="text-[15px] font-semibold m-0 mb-2 text-foreground">Sidebar</h3>
        
        <div className="flex items-center justify-between gap-4 py-3 first:pt-0">
          <div className="flex flex-col gap-0.5">
            <label className="text-sm font-medium text-foreground">Show Icons</label>
            <span className="text-xs text-muted-foreground">
              Display icons next to navigation items
            </span>
          </div>
          <input 
            type="checkbox" 
            className="w-10 h-[22px] appearance-none bg-muted rounded-full cursor-pointer relative transition-colors checked:bg-primary before:content-[''] before:absolute before:top-0.5 before:left-0.5 before:w-[18px] before:h-[18px] before:bg-white before:rounded-full before:transition-transform before:shadow checked:before:translate-x-[18px] focus:outline-none focus:ring-2 focus:ring-primary/20"
            checked={sidebarShowIcons}
            onChange={(e) => setSidebarShowIcons(e.target.checked)}
          />
        </div>

        <div className="flex items-center justify-between gap-4 py-3">
          <div className="flex flex-col gap-0.5">
            <label className="text-sm font-medium text-foreground">Compact Mode</label>
            <span className="text-xs text-muted-foreground">
              Reduce spacing in the navigation panel
            </span>
          </div>
          <input 
            type="checkbox" 
            className="w-10 h-[22px] appearance-none bg-muted rounded-full cursor-pointer relative transition-colors checked:bg-primary before:content-[''] before:absolute before:top-0.5 before:left-0.5 before:w-[18px] before:h-[18px] before:bg-white before:rounded-full before:transition-transform before:shadow checked:before:translate-x-[18px] focus:outline-none focus:ring-2 focus:ring-primary/20"
            checked={sidebarCompactMode}
            onChange={(e) => setSidebarCompactMode(e.target.checked)}
          />
        </div>
      </div>

      <div className="pb-6 border-b border-border last:border-b-0 last:pb-0">
        <h3 className="text-[15px] font-semibold m-0 mb-2 text-foreground flex items-center gap-2">
          <Terminal className="h-4 w-4" />
          Terminal
        </h3>
        
        <div className="flex items-center justify-between gap-4 py-3 first:pt-0">
          <div className="flex flex-col gap-0.5">
            <label className="text-sm font-medium text-foreground">Color Theme</label>
            <span className="text-xs text-muted-foreground">
              Choose the terminal color scheme
            </span>
          </div>
          <select 
            className="px-3 py-1.5 text-[13px] border border-border rounded bg-card text-foreground cursor-pointer hover:border-border focus:outline-none focus:border-primary min-w-[180px]"
            value={terminalTheme}
            onChange={(e) => setTerminalTheme(e.target.value as TerminalThemeSetting)}
          >
            {terminalThemeOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

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
            className="px-3 py-1.5 text-[13px] border border-border rounded bg-card text-foreground cursor-pointer hover:border-border focus:outline-none focus:border-primary min-w-[180px]"
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
            <label className="text-sm font-medium text-foreground">Cursor Blink</label>
            <span className="text-xs text-muted-foreground">
              Enable blinking cursor in terminal
            </span>
          </div>
          <input 
            type="checkbox" 
            className="w-10 h-[22px] appearance-none bg-muted rounded-full cursor-pointer relative transition-colors checked:bg-primary before:content-[''] before:absolute before:top-0.5 before:left-0.5 before:w-[18px] before:h-[18px] before:bg-white before:rounded-full before:transition-transform before:shadow checked:before:translate-x-[18px] focus:outline-none focus:ring-2 focus:ring-primary/20"
            checked={terminalCursorBlink}
            onChange={(e) => setTerminalCursorBlink(e.target.checked)}
          />
        </div>
      </div>
    </div>
  );
}
