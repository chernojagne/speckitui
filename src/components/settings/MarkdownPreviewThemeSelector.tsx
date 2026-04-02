/**
 * MarkdownPreviewThemeSelector Component
 * Allows users to select markdown preview theme tokens
 */

import { useSettingsStore } from '@/stores/settingsStore';
import { markdownPreviewThemes } from '@/config/markdownPreviewThemes';

export function MarkdownPreviewThemeSelector() {
  const markdownPreviewTheme = useSettingsStore((state) => state.markdownPreviewTheme);
  const setMarkdownPreviewTheme = useSettingsStore((state) => state.setMarkdownPreviewTheme);

  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex flex-col gap-0.5">
        <label className="text-sm font-medium text-foreground">Preview Theme</label>
        <span className="text-xs text-muted-foreground">
          Color tokens for markdown preview elements
        </span>
      </div>
      <select
        className="px-3 py-1.5 text-[13px] border border-border rounded bg-card text-foreground cursor-pointer hover:border-border focus:outline-none focus:border-primary min-w-45"
        value={markdownPreviewTheme}
        onChange={(e) => setMarkdownPreviewTheme(e.target.value as typeof markdownPreviewTheme)}
      >
        {markdownPreviewThemes.map((theme) => (
          <option key={theme.id} value={theme.id}>
            {theme.name}
          </option>
        ))}
      </select>
    </div>
  );
}
