/**
 * IssueFilters Component
 * Filter controls for GitHub issues (state, labels)
 */

import { useState } from 'react';
import './IssueFilters.css';

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
    <div className="issue-filters">
      {/* Search */}
      <div className="filter-search">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Search issues..."
          value={filters.search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="search-input"
        />
        {filters.search && (
          <button
            className="clear-search"
            onClick={() => handleSearchChange('')}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* State filter */}
      <div className="filter-state">
        <button
          className={`state-btn ${filters.state === 'all' ? 'active' : ''}`}
          onClick={() => handleStateChange('all')}
        >
          All
          {issueCount && (
            <span className="state-count">{issueCount.open + issueCount.closed}</span>
          )}
        </button>
        <button
          className={`state-btn ${filters.state === 'open' ? 'active' : ''}`}
          onClick={() => handleStateChange('open')}
        >
          🟢 Open
          {issueCount && <span className="state-count">{issueCount.open}</span>}
        </button>
        <button
          className={`state-btn ${filters.state === 'closed' ? 'active' : ''}`}
          onClick={() => handleStateChange('closed')}
        >
          🟣 Closed
          {issueCount && <span className="state-count">{issueCount.closed}</span>}
        </button>
      </div>

      {/* Labels filter */}
      {availableLabels.length > 0 && (
        <div className="filter-labels">
          <button
            className={`labels-btn ${filters.labels.length > 0 ? 'has-selection' : ''}`}
            onClick={() => setIsLabelDropdownOpen(!isLabelDropdownOpen)}
          >
            🏷️ Labels
            {filters.labels.length > 0 && (
              <span className="label-count">{filters.labels.length}</span>
            )}
          </button>

          {isLabelDropdownOpen && (
            <div className="labels-dropdown">
              {availableLabels.map((label) => (
                <button
                  key={label.name}
                  className={`label-option ${filters.labels.includes(label.name) ? 'selected' : ''}`}
                  onClick={() => toggleLabel(label.name)}
                >
                  <span
                    className="label-color"
                    style={{ backgroundColor: `#${label.color}` }}
                  />
                  <span className="label-name">{label.name}</span>
                  {filters.labels.includes(label.name) && (
                    <span className="label-check">✓</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Clear filters */}
      {hasActiveFilters && (
        <button className="clear-filters-btn" onClick={clearFilters}>
          Clear filters
        </button>
      )}
    </div>
  );
}
