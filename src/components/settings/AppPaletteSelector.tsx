/**
 * AppPaletteSelector Component
 * Allows users to select from 8 app theme palettes
 * 
 * @feature 006-more-themes
 */

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppTheme, useThemeMode } from '@/hooks/useTheme';
import { appPalettes, type AppPaletteConfig } from '@/config/appThemes';

interface ColorSwatchProps {
  palette: AppPaletteConfig;
  mode: 'light' | 'dark';
}

/**
 * Shows a preview of the palette's key colors
 */
function ColorSwatch({ palette, mode }: ColorSwatchProps) {
  const colors = mode === 'dark' ? palette.dark : palette.light;
  
  // Convert HSL string to CSS format
  const toHsl = (value: string) => `hsl(${value})`;
  
  return (
    <div className="flex gap-0.5 mb-2">
      <div 
        className="w-4 h-4 rounded-sm" 
        style={{ backgroundColor: toHsl(colors.primary) }}
        title="Primary"
      />
      <div 
        className="w-4 h-4 rounded-sm" 
        style={{ backgroundColor: toHsl(colors.background) }}
        title="Background"
      />
      <div 
        className="w-4 h-4 rounded-sm" 
        style={{ backgroundColor: toHsl(colors.accent) }}
        title="Accent"
      />
      <div 
        className="w-4 h-4 rounded-sm" 
        style={{ backgroundColor: toHsl(colors.muted) }}
        title="Muted"
      />
    </div>
  );
}

export function AppPaletteSelector() {
  const { paletteId, setPalette } = useAppTheme();
  const mode = useThemeMode();

  return (
    <div className="pb-6 border-b border-border last:border-b-0 last:pb-0">
      <h3 className="text-[15px] font-semibold m-0 mb-2 text-foreground">App Palette</h3>
      <p className="text-[13px] text-muted-foreground m-0 mb-4">
        Choose a color palette for the app interface. Affects buttons, cards, sidebar, and more.
      </p>

      <div className="grid grid-cols-4 gap-3">
        {appPalettes.map((palette) => (
          <button
            key={palette.id}
            className={cn(
              "flex flex-col items-center px-3 py-3 bg-card border-2 border-border rounded-lg cursor-pointer transition-all relative hover:border-border hover:bg-accent",
              paletteId === palette.id && "border-primary bg-primary/5"
            )}
            onClick={() => setPalette(palette.id)}
            aria-pressed={paletteId === palette.id}
            title={palette.description}
          >
            <ColorSwatch palette={palette} mode={mode} />
            <span className="text-[12px] font-medium text-foreground">{palette.name}</span>
            {paletteId === palette.id && (
              <Check className="absolute top-1.5 right-1.5 h-3.5 w-3.5 text-primary" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
