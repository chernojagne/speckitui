import { Minus, Square, X, Maximize2 } from 'lucide-react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { useState, useEffect } from 'react';

export function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false);
  const appWindow = getCurrentWindow();

  useEffect(() => {
    // Check initial maximized state
    const checkMaximized = async () => {
      const maximized = await appWindow.isMaximized();
      setIsMaximized(maximized);
    };
    checkMaximized();

    // Listen for resize events to update maximized state
    const unlisten = appWindow.onResized(async () => {
      const maximized = await appWindow.isMaximized();
      setIsMaximized(maximized);
    });

    return () => {
      unlisten.then((fn: () => void) => fn());
    };
  }, [appWindow]);

  const handleMinimize = () => appWindow.minimize();
  const handleMaximize = () => appWindow.toggleMaximize();
  const handleClose = () => appWindow.close();

  return (
    <header className="title-bar flex items-center h-9 bg-card border-b border-border shrink-0 select-none">
      {/* Drag region - the main area users can drag */}
      <div
        className="flex-1 flex items-center h-full px-3 gap-2"
        data-tauri-drag-region
      >
        <span className="font-semibold text-foreground text-sm pointer-events-none">
          SpeckitUI
        </span>
      </div>

      {/* Window controls */}
      <div className="flex items-center h-full">
        <button
          onClick={handleMinimize}
          className="h-full w-11 flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          title="Minimize"
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          onClick={handleMaximize}
          className="h-full w-11 flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          title={isMaximized ? 'Restore' : 'Maximize'}
        >
          {isMaximized ? (
            <Square className="h-3.5 w-3.5" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </button>
        <button
          onClick={handleClose}
          className="h-full w-11 flex items-center justify-center text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
          title="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
