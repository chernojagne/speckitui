/**
 * SettingsPanel Component
 * Modal or slide-out panel for application settings
 */

import { useState } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import { ConstitutionView } from './ConstitutionView';
import { ThemeSettings } from './ThemeSettings';
import { RecentProjects } from './RecentProjects';
import { cn } from '@/lib/utils';
import { Settings, Palette, FolderOpen, ScrollText } from 'lucide-react';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsTab = 'general' | 'appearance' | 'projects' | 'constitution';

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

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
            <button
              className={cn(
                "flex items-center gap-2 py-2.5 px-3 bg-transparent border-none text-left text-sm text-foreground cursor-pointer rounded-md transition-colors hover:bg-muted",
                activeTab === 'projects' && "bg-primary/15 text-primary font-medium"
              )}
              onClick={() => setActiveTab('projects')}
            >
              <FolderOpen className="h-4 w-4" /> Recent Projects
            </button>
            <button
              className={cn(
                "flex items-center gap-2 py-2.5 px-3 bg-transparent border-none text-left text-sm text-foreground cursor-pointer rounded-md transition-colors hover:bg-muted",
                activeTab === 'constitution' && "bg-primary/15 text-primary font-medium"
              )}
              onClick={() => setActiveTab('constitution')}
            >
              <ScrollText className="h-4 w-4" /> Constitution
            </button>
          </nav>

          <div className="flex-1 p-5 overflow-y-auto">
            {activeTab === 'general' && <GeneralSettings />}
            {activeTab === 'appearance' && <ThemeSettings />}
            {activeTab === 'projects' && <RecentProjects />}
            {activeTab === 'constitution' && <ConstitutionView />}
          </div>
        </div>
      </div>
    </div>
  );
}

function GeneralSettings() {
  const { terminalPanelHeight, terminalPanelCollapsed, setTerminalPanelHeight, setTerminalPanelCollapsed } =
    useSettingsStore();

  return (
    <div className="max-w-[400px]">
      <h3 className="text-[15px] font-semibold m-0 mb-4 text-foreground">Terminal</h3>

      <div className="flex items-center justify-between py-3 border-b border-border">
        <label className="text-sm text-foreground" htmlFor="terminal-collapsed">
          Terminal Panel Collapsed by Default
        </label>
        <input
          type="checkbox"
          id="terminal-collapsed"
          checked={terminalPanelCollapsed}
          onChange={(e) => setTerminalPanelCollapsed(e.target.checked)}
          className="w-[18px] h-[18px] accent-primary cursor-pointer"
        />
      </div>

      <div className="flex items-center justify-between py-3 border-b border-border">
        <label className="text-sm text-foreground" htmlFor="terminal-height">
          Terminal Panel Height (px)
        </label>
        <input
          type="number"
          id="terminal-height"
          value={terminalPanelHeight}
          onChange={(e) => setTerminalPanelHeight(parseInt(e.target.value, 10))}
          min={100}
          max={600}
          className="w-20 px-2 py-1.5 border border-border rounded-sm text-sm bg-background text-foreground focus:outline-none focus:border-primary"
        />
      </div>

      <h3 className="text-[15px] font-semibold mt-8 mb-4 text-foreground">About</h3>
      <div className="text-sm text-foreground leading-relaxed">
        <p className="my-1"><strong>SpeckitUI</strong></p>
        <p className="my-1">A visual interface for spec-kit driven development</p>
        <p className="mt-3 text-[13px] text-muted-foreground">Version 0.1.0</p>
      </div>
    </div>
  );
}
