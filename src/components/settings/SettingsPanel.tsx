/**
 * SettingsPanel Component
 * Modal or slide-out panel for application settings
 */

import { useState, useEffect } from 'react';
import { ThemeSettings } from './ThemeSettings';
import { cn } from '@/lib/utils';
import { Settings, Palette } from 'lucide-react';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsTab = 'general' | 'appearance';

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] animate-in fade-in duration-150"
      onClick={handleBackdropClick}
    >
      <div 
        className="w-[90%] max-w-[700px] h-[80vh] bg-background rounded-lg shadow-xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200"
        role="dialog" 
        aria-modal="true" 
        aria-label="Settings"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-lg font-semibold m-0 text-foreground">Settings</h2>
          <button 
            className="w-8 h-8 flex items-center justify-center bg-transparent border-none text-2xl text-muted-foreground cursor-pointer rounded-sm transition-all hover:bg-muted hover:text-foreground"
            onClick={onClose} 
            aria-label="Close settings"
          >
            ×
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <nav className="flex flex-col w-[180px] p-2 border-r border-border bg-card">
            <button
              className={cn(
                "flex items-center gap-2 py-2.5 px-3 bg-transparent border-none text-left text-sm text-foreground cursor-pointer rounded-md transition-colors hover:bg-muted",
                activeTab === 'general' && "bg-primary/15 text-primary font-medium"
              )}
              onClick={() => setActiveTab('general')}
            >
              <Settings className="h-4 w-4" /> General
            </button>
            <button
              className={cn(
                "flex items-center gap-2 py-2.5 px-3 bg-transparent border-none text-left text-sm text-foreground cursor-pointer rounded-md transition-colors hover:bg-muted",
                activeTab === 'appearance' && "bg-primary/15 text-primary font-medium"
              )}
              onClick={() => setActiveTab('appearance')}
            >
              <Palette className="h-4 w-4" /> Appearance
            </button>
          </nav>

          <div className="flex-1 p-5 overflow-y-auto">
            {activeTab === 'general' && <GeneralSettings />}
            {activeTab === 'appearance' && <ThemeSettings />}
          </div>
        </div>
      </div>
    </div>
  );
}

function GeneralSettings() {
  return (
    <div className="max-w-[400px]">
      <h3 className="text-[15px] font-semibold m-0 mb-4 text-foreground">About</h3>
      <div className="text-sm text-foreground leading-relaxed">
        <p className="my-1"><strong>SpeckitUI</strong></p>
        <p className="my-1">A visual interface for spec-kit driven development</p>
        <p className="mt-3 text-[13px] text-muted-foreground">Version 0.1.0</p>
      </div>
    </div>
  );
}
