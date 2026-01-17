import { useState } from 'react';
import './TabContainer.css';

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface TabContainerProps {
  tabs: Tab[];
  defaultTab?: string;
  onTabChange?: (tabId: string) => void;
}

export function TabContainer({ tabs, defaultTab, onTabChange }: TabContainerProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    onTabChange?.(tabId);
  };

  const activeContent = tabs.find((tab) => tab.id === activeTab)?.content;

  return (
    <div className="tab-container">
      <div className="tab-header" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => handleTabClick(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="tab-content" role="tabpanel">
        {activeContent}
      </div>
    </div>
  );
}
