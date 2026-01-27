/**
 * EditorThemeSelector Component
 * Allows users to select from 12 Shiki themes for code editing
 * 
 * @feature 006-more-themes
 */

import { useEditorTheme } from '@/hooks/useTheme';
import { editorThemes } from '@/config/editorThemes';
import type { ShikiThemeId } from '@/types';

export function EditorThemeSelector() {
  const { themeId, setTheme } = useEditorTheme();

  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex flex-col gap-0.5">
        <label className="text-sm font-medium text-foreground">Editor Theme</label>
        <span className="text-xs text-muted-foreground">
          Syntax highlighting theme for code editing
        </span>
      </div>
      <select 
        className="px-3 py-1.5 text-[13px] border border-border rounded bg-card text-foreground cursor-pointer hover:border-border focus:outline-none focus:border-primary min-w-[180px]"
        value={themeId}
        onChange={(e) => setTheme(e.target.value as ShikiThemeId)}
      >
        <optgroup label="Dark Themes">
          {editorThemes
            .filter((t) => t.type === 'dark')
            .map((theme) => (
              <option key={theme.id} value={theme.id}>{theme.name}</option>
            ))}
        </optgroup>
        <optgroup label="Light Themes">
          {editorThemes
            .filter((t) => t.type === 'light')
            .map((theme) => (
              <option key={theme.id} value={theme.id}>{theme.name}</option>
            ))}
        </optgroup>
      </select>
    </div>
  );
}
