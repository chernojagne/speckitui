/**
 * TerminalThemeSelector Component
 * Allows users to select from 15 terminal themes or Auto mode
 * 
 * @feature 006-more-themes
 */

import { useTerminalTheme } from '@/hooks/useTheme';
import { terminalThemes } from '@/config/terminalThemes';
import type { TerminalThemeId } from '@/types';

interface TerminalThemeOption {
  value: TerminalThemeId | 'auto';
  label: string;
}

const terminalThemeOptions: TerminalThemeOption[] = [
  { value: 'auto', label: 'Auto (follows app palette)' },
  ...terminalThemes.map((t) => ({ value: t.id, label: t.name })),
];

export function TerminalThemeSelector() {
  const { themeSetting, isAuto, setTheme } = useTerminalTheme();

  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex flex-col gap-0.5">
        <label className="text-sm font-medium text-foreground">Terminal Theme</label>
        <span className="text-xs text-muted-foreground">
          {isAuto 
            ? 'Automatically matches your app palette' 
            : 'Choose the terminal color scheme'}
        </span>
      </div>
      <select 
        className="px-3 py-1.5 text-[13px] border border-border rounded bg-card text-foreground cursor-pointer hover:border-border focus:outline-none focus:border-primary min-w-[180px]"
        value={themeSetting}
        onChange={(e) => setTheme(e.target.value as TerminalThemeId | 'auto')}
      >
        {terminalThemeOptions.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  );
}
