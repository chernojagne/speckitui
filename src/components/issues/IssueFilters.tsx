/**
 * IssueFilters Component
 * Filter controls for GitHub issues (state, labels)
 */

import { useState } from 'react';
import { cn } from '@/lib/utils';

export interface IssueFilterState {
  state: 'all' | 'open' | 'closed';
  labels: string[];
  search: string;
}

interface IssueFiltersProps {
  filters: IssueFilterState;
  onFiltersChange: (filters: IssueFilterState) => void;
  availableLabels?: Array<{ name: string; color: string }>;
  issueCount?: { open: number; closed: number };
}

export function IssueFilters({
  filters,
  onFiltersChange,
  availableLabels = [],
  issueCount,
}: IssueFiltersProps) {
  const [isLabelDropdownOpen, setIsLabelDropdownOpen] = useState(false);

  const handleStateChange = (state: IssueFilterState['state']) => {
    onFiltersChange({ ...filters, state });
  };

  const handleSearchChange = (search: string) => {
    onFiltersChange({ ...filters, search });
  };

  const toggleLabel = (labelName: string) => {
    const labels = filters.labels.includes(labelName)
      ? filters.labels.filter((l) => l !== labelName)
      : [...filters.labels, labelName];
    onFiltersChange({ ...filters, labels });
  };

  const clearFilters = () => {
    onFiltersChange({ state: 'all', labels: [], search: '' });
  };

  const hasActiveFilters = filters.state !== 'all' || filters.labels.length > 0 || filters.search;

  return (
    <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-border bg-card">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-[300px]">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm opacity-60 pointer-events-none">🔍</span>
        <input
          type="text"
          placeholder="Search issues..."
          value={filters.search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full py-2 pl-9 pr-8 text-[13px] border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
        />
        {filters.search && (
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-sm leading-none text-muted-foreground bg-transparent border-none cursor-pointer rounded hover:text-foreground hover:bg-muted"
            onClick={() => handleSearchChange('')}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* State filter */}
      <div className="flex gap-1 bg-background border border-border rounded-md p-0.5">
        <button
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 text-[13px] text-muted-foreground bg-transparent border-none rounded cursor-pointer transition-all hover:text-foreground hover:bg-accent",
            filters.state === 'all' && "text-foreground bg-card shadow-sm"
          )}
          onClick={() => handleStateChange('all')}
        >
          All
          {issueCount && (
            <span className={cn(
              "px-1.5 py-0.5 text-[11px] text-muted-foreground bg-card rounded-full",
              filters.state === 'all' && "bg-background"
            )}>
              {issueCount.open + issueCount.closed}
            </span>
          )}
        </button>
        <button
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 text-[13px] text-muted-foreground bg-transparent border-none rounded cursor-pointer transition-all hover:text-foreground hover:bg-accent",
            filters.state === 'open' && "text-foreground bg-card shadow-sm"
          )}
          onClick={() => handleStateChange('open')}
        >
          🟢 Open
          {issueCount && <span className={cn(
            "px-1.5 py-0.5 text-[11px] text-muted-foreground bg-card rounded-full",
            filters.state === 'open' && "bg-background"
          )}>{issueCount.open}</span>}
        </button>
        <button
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 text-[13px] text-muted-foreground bg-transparent border-none rounded cursor-pointer transition-all hover:text-foreground hover:bg-accent",
            filters.state === 'closed' && "text-foreground bg-card shadow-sm"
          )}
          onClick={() => handleStateChange('closed')}
        >
          🟣 Closed
          {issueCount && <span className={cn(
            "px-1.5 py-0.5 text-[11px] text-muted-foreground bg-card rounded-full",
            filters.state === 'closed' && "bg-background"
          )}>{issueCount.closed}</span>}
        </button>
      </div>

      {/* Labels filter */}
      {availableLabels.length > 0 && (
        <div className="relative">
          <button
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 text-[13px] text-foreground bg-background border border-border rounded-md cursor-pointer transition-all hover:border-border",
              filters.labels.length > 0 && "border-primary bg-primary/5"
            )}
            onClick={() => setIsLabelDropdownOpen(!isLabelDropdownOpen)}
          >
            🏷️ Labels
            {filters.labels.length > 0 && (
              <span className="px-1.5 py-0.5 text-[11px] font-medium text-primary-foreground bg-primary rounded-full">
                {filters.labels.length}
              </span>
            )}
          </button>

          {isLabelDropdownOpen && (
            <div className="absolute top-full left-0 z-[100] min-w-[200px] max-h-[300px] mt-1 p-1.5 bg-card border border-border rounded-lg shadow-lg overflow-y-auto">
              {availableLabels.map((label) => (
                <button
                  key={label.name}
                  className={cn(
                    "flex items-center gap-2 w-full px-2.5 py-2 text-[13px] text-left bg-transparent border-none rounded cursor-pointer transition-colors hover:bg-accent",
                    filters.labels.includes(label.name) && "bg-primary/5"
                  )}
                  onClick={() => toggleLabel(label.name)}
                >
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: `#${label.color}` }}
                  />
                  <span className="flex-1 text-foreground">{label.name}</span>
                  {filters.labels.includes(label.name) && (
                    <span className="text-primary text-sm">✓</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Clear filters */}
      {hasActiveFilters && (
        <button 
          className="px-3 py-1.5 text-xs text-muted-foreground bg-transparent border border-dashed border-border rounded-md cursor-pointer transition-all hover:text-foreground hover:border-muted-foreground"
          onClick={clearFilters}
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
