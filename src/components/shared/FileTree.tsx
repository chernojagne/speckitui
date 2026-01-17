/**
 * FileTree Component
 * Displays a hierarchical file/folder structure
 */

import { useState, useCallback, memo } from 'react';
import type { FileEntry } from '@/types';

interface FileTreeProps {
  entries: FileEntry[];
  onSelect?: (entry: FileEntry) => void;
  selectedPath?: string;
  expandedPaths?: Set<string>;
  onToggleExpand?: (path: string) => void;
}

export function FileTree({
  entries,
  onSelect,
  selectedPath,
  expandedPaths: controlledExpandedPaths,
  onToggleExpand,
}: FileTreeProps) {
  const [internalExpandedPaths, setInternalExpandedPaths] = useState<Set<string>>(new Set());
  
  // Use controlled or internal state
  const expandedPaths = controlledExpandedPaths ?? internalExpandedPaths;

  const handleToggleExpand = useCallback((path: string) => {
    if (onToggleExpand) {
      onToggleExpand(path);
    } else {
      setInternalExpandedPaths((prev) => {
        const next = new Set(prev);
        if (next.has(path)) {
          next.delete(path);
        } else {
          next.add(path);
        }
        return next;
      });
    }
  }, [onToggleExpand]);

  return (
    <div className="text-sm select-none">
      {entries.map((entry) => (
        <FileTreeItem
          key={entry.path}
          entry={entry}
          depth={0}
          selectedPath={selectedPath}
          expandedPaths={expandedPaths}
          onSelect={onSelect}
          onToggleExpand={handleToggleExpand}
        />
      ))}
    </div>
  );
}

interface FileTreeItemProps {
  entry: FileEntry;
  depth: number;
  selectedPath?: string;
  expandedPaths: Set<string>;
  onSelect?: (entry: FileEntry) => void;
  onToggleExpand: (path: string) => void;
}

const FileTreeItem = memo(function FileTreeItem({
  entry,
  depth,
  selectedPath,
  expandedPaths,
  onSelect,
  onToggleExpand,
}: FileTreeItemProps) {
  const isExpanded = expandedPaths.has(entry.path);
  const isSelected = selectedPath === entry.path;
  const hasChildren = entry.isDirectory && entry.children && entry.children.length > 0;

  const handleClick = () => {
    if (entry.isDirectory) {
      onToggleExpand(entry.path);
    }
    onSelect?.(entry);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
    if (e.key === 'ArrowRight' && entry.isDirectory && !isExpanded) {
      e.preventDefault();
      onToggleExpand(entry.path);
    }
    if (e.key === 'ArrowLeft' && entry.isDirectory && isExpanded) {
      e.preventDefault();
      onToggleExpand(entry.path);
    }
  };

  const icon = getFileIcon(entry);

  return (
    <div className="flex flex-col">
      <div
        className={`flex items-center gap-1.5 py-1.5 px-2 cursor-pointer rounded-sm transition-colors hover:bg-muted focus:outline-none focus:bg-muted focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-[-2px] ${isSelected ? 'bg-primary/15 hover:bg-primary/20' : ''} ${entry.isDirectory ? 'font-medium' : ''}`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="treeitem"
        aria-expanded={entry.isDirectory ? isExpanded : undefined}
        aria-selected={isSelected}
      >
        {entry.isDirectory && (
          <span className={`text-[0.625rem] text-muted-foreground transition-transform duration-150 w-3 shrink-0 ${isExpanded ? 'rotate-90' : ''}`}>
            ▶
          </span>
        )}
        <span className="text-base leading-none shrink-0">{icon}</span>
        <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-foreground">{entry.name}</span>
      </div>
      
      {entry.isDirectory && isExpanded && hasChildren && (
        <div className="flex flex-col relative before:content-[''] before:absolute before:left-5 before:top-0 before:bottom-2 before:w-px before:bg-border before:opacity-50" role="group">
          {entry.children!.map((child) => (
            <FileTreeItem
              key={child.path}
              entry={child}
              depth={depth + 1}
              selectedPath={selectedPath}
              expandedPaths={expandedPaths}
              onSelect={onSelect}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
});

function getFileIcon(entry: FileEntry): string {
  if (entry.isDirectory) {
    return '📁';
  }

  const ext = entry.name.split('.').pop()?.toLowerCase() ?? '';
  
  const iconMap: Record<string, string> = {
    // Code files
    ts: '📘',
    tsx: '📘',
    js: '📒',
    jsx: '📒',
    rs: '🦀',
    py: '🐍',
    go: '🔵',
    java: '☕',
    rb: '💎',
    
    // Config files
    json: '📋',
    yaml: '📋',
    yml: '📋',
    toml: '📋',
    xml: '📋',
    
    // Markdown/docs
    md: '📝',
    mdx: '📝',
    txt: '📄',
    
    // Styles
    css: '🎨',
    scss: '🎨',
    less: '🎨',
    
    // Other
    html: '🌐',
    svg: '🖼️',
    png: '🖼️',
    jpg: '🖼️',
    jpeg: '🖼️',
    gif: '🖼️',
    lock: '🔒',
  };

  return iconMap[ext] ?? '📄';
}
