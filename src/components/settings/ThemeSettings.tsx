/**
 * ThemeSettings Component
 * Theme selection and customization options
 */

import { useSettingsStore } from '@/stores/settingsStore';
import './ThemeSettings.css';

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
    <div className="theme-settings">
      <div className="settings-section">
        <h3 className="settings-section-title">Theme</h3>
        <p className="settings-section-description">
          Choose how SpeckitUI looks to you. Select a theme preference.
        </p>

        <div className="theme-options">
          {themes.map((option) => (
            <button
              key={option.value}
              className={`theme-option ${theme === option.value ? 'active' : ''}`}
              onClick={() => setTheme(option.value)}
              aria-pressed={theme === option.value}
            >
              <span className="theme-icon">{option.icon}</span>
              <span className="theme-label">{option.label}</span>
              {theme === option.value && (
                <span className="theme-check">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="settings-section">
        <h3 className="settings-section-title">Editor</h3>
        
        <div className="setting-item">
          <div className="setting-info">
            <label className="setting-label">Font Size</label>
            <span className="setting-description">
              Adjust the font size in code viewers
            </span>
          </div>
          <select 
            className="setting-select"
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

        <div className="setting-item">
          <div className="setting-info">
            <label className="setting-label">Line Numbers</label>
            <span className="setting-description">
              Show line numbers in source viewers
            </span>
          </div>
          <input 
            type="checkbox" 
            className="setting-toggle"
            defaultChecked
          />
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <label className="setting-label">Word Wrap</label>
            <span className="setting-description">
              Wrap long lines in viewers
            </span>
          </div>
          <input 
            type="checkbox" 
            className="setting-toggle"
            defaultChecked={false}
          />
        </div>
      </div>

      <div className="settings-section">
        <h3 className="settings-section-title">Sidebar</h3>
        
        <div className="setting-item">
          <div className="setting-info">
            <label className="setting-label">Show Icons</label>
            <span className="setting-description">
              Display icons next to navigation items
            </span>
          </div>
          <input 
            type="checkbox" 
            className="setting-toggle"
            defaultChecked
          />
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <label className="setting-label">Compact Mode</label>
            <span className="setting-description">
              Reduce spacing in the navigation panel
            </span>
          </div>
          <input 
            type="checkbox" 
            className="setting-toggle"
            defaultChecked={false}
          />
        </div>
      </div>
    </div>
  );
}
