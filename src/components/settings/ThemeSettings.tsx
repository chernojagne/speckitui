/**
 * ThemeSettings Component
 * Theme selection and customization options
 */

import { useSettingsStore } from '@/stores/settingsStore';
import { cn } from '@/lib/utils';

type Theme = 'light' | 'dark' | 'system';

const themes: { value: Theme; label: string; icon: string }[] = [
  { value: 'light', label: 'Light', icon: '☀️' },
  { value: 'dark', label: 'Dark', icon: '🌙' },
  { value: 'system', label: 'System', icon: '💻' },
];

export function ThemeSettings() {
  const theme = useSettingsStore((state) => state.theme);
  const setTheme = useSettingsStore((state) => state.setTheme);

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
              <span className="text-2xl">{option.icon}</span>
              <span className="text-[13px] font-medium text-foreground">{option.label}</span>
              {theme === option.value && (
                <span className="absolute top-2 right-2 text-xs text-primary">✓</span>
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
            defaultValue="14"
          >
            <option value="12">12px</option>
            <option value="13">13px</option>
            <option value="14">14px</option>
            <option value="15">15px</option>
            <option value="16">16px</option>
            <option value="18">18px</option>
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
            defaultChecked
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
            defaultChecked={false}
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
            defaultChecked
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
            defaultChecked={false}
          />
        </div>
      </div>
    </div>
  );
}
