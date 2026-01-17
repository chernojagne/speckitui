/**
 * SettingsPanel Component
 * Modal or slide-out panel for application settings
 */

import { useState } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import { ConstitutionView } from './ConstitutionView';
import { ThemeSettings } from './ThemeSettings';
import { RecentProjects } from './RecentProjects';
import './SettingsPanel.css';

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
    <div className="settings-panel-backdrop" onClick={handleBackdropClick}>
      <div className="settings-panel" role="dialog" aria-modal="true" aria-label="Settings">
        <div className="settings-panel-header">
          <h2 className="settings-title">Settings</h2>
          <button className="settings-close" onClick={onClose} aria-label="Close settings">
            ×
          </button>
        </div>

        <div className="settings-panel-content">
          <nav className="settings-nav">
            <button
              className={`settings-nav-item ${activeTab === 'general' ? 'active' : ''}`}
              onClick={() => setActiveTab('general')}
            >
              ⚙️ General
            </button>
            <button
              className={`settings-nav-item ${activeTab === 'appearance' ? 'active' : ''}`}
              onClick={() => setActiveTab('appearance')}
            >
              🎨 Appearance
            </button>
            <button
              className={`settings-nav-item ${activeTab === 'projects' ? 'active' : ''}`}
              onClick={() => setActiveTab('projects')}
            >
              📁 Recent Projects
            </button>
            <button
              className={`settings-nav-item ${activeTab === 'constitution' ? 'active' : ''}`}
              onClick={() => setActiveTab('constitution')}
            >
              📜 Constitution
            </button>
          </nav>

          <div className="settings-content">
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
    <div className="settings-section">
      <h3 className="settings-section-title">Terminal</h3>

      <div className="settings-row">
        <label className="settings-label" htmlFor="terminal-collapsed">
          Terminal Panel Collapsed by Default
        </label>
        <input
          type="checkbox"
          id="terminal-collapsed"
          checked={terminalPanelCollapsed}
          onChange={(e) => setTerminalPanelCollapsed(e.target.checked)}
          className="settings-checkbox"
        />
      </div>

      <div className="settings-row">
        <label className="settings-label" htmlFor="terminal-height">
          Terminal Panel Height (px)
        </label>
        <input
          type="number"
          id="terminal-height"
          value={terminalPanelHeight}
          onChange={(e) => setTerminalPanelHeight(parseInt(e.target.value, 10))}
          min={100}
          max={600}
          className="settings-input"
        />
      </div>

      <h3 className="settings-section-title">About</h3>
      <div className="settings-info">
        <p><strong>SpeckitUI</strong></p>
        <p>A visual interface for spec-kit driven development</p>
        <p className="version">Version 0.1.0</p>
      </div>
    </div>
  );
}
