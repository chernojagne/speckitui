import { useState } from 'react';

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
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex gap-0 bg-card border-b border-border shrink-0 overflow-x-auto" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`px-4 py-2 text-sm transition-all whitespace-nowrap
              ${activeTab === tab.id 
                ? 'text-foreground bg-background' 
                : 'text-muted-foreground bg-card hover:text-foreground hover:bg-muted'}`}
            onClick={() => handleTabClick(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-auto bg-background" role="tabpanel">
        {activeContent}
      </div>
    </div>
  );
}
