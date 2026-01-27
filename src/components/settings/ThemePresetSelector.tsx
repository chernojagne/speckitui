/**
 * ThemePresetSelector Component
 * Allows users to apply pre-configured theme presets
 * 
 * @feature 006-more-themes
 */

import { Check, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useThemePreset } from '@/hooks/useTheme';
import { themePresets } from '@/config/themePresets';

export function ThemePresetSelector() {
  const { currentPresetId, applyPreset } = useThemePreset();

  return (
    <div className="pb-6 border-b border-border">
      <h3 className="text-[15px] font-semibold m-0 mb-2 text-foreground flex items-center gap-2">
        <Palette className="h-4 w-4" />
        Quick Presets
      </h3>
      <p className="text-[13px] text-muted-foreground m-0 mb-4">
        Apply a coordinated theme across all components at once.
      </p>

      <div className="flex flex-wrap gap-2">
        {themePresets.map((preset) => (
          <button
            key={preset.id}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium border rounded-md cursor-pointer transition-all",
              currentPresetId === preset.id
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-foreground hover:bg-accent hover:border-border"
            )}
            onClick={() => applyPreset(preset.id)}
            title={`Apply ${preset.name} theme to all components`}
          >
            {currentPresetId === preset.id && (
              <Check className="h-3.5 w-3.5" />
            )}
            {preset.name}
          </button>
        ))}
      </div>
      
      {currentPresetId && (
        <p className="text-xs text-muted-foreground mt-2">
          Currently using the <span className="font-medium">{themePresets.find(p => p.id === currentPresetId)?.name}</span> preset
        </p>
      )}
      {!currentPresetId && (
        <p className="text-xs text-muted-foreground mt-2">
          Custom theme configuration (no preset selected)
        </p>
      )}
    </div>
  );
}
