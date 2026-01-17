import { useState, useEffect } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import { listDirectory, readSourceFile } from '@/services/tauriCommands';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { EmptyState } from '../shared/EmptyState';
import { SourceViewer } from '../shared/SourceViewer';
import type { FileEntry, SourceFileContent } from '@/types';
import './WorkflowView.css';
import './ImplementView.css';

interface TreeNodeProps {
  entry: FileEntry;
  basePath: string;
  selectedPath: string | null;
  onSelect: (path: string, isDir: boolean) => void;
  expandedPaths: Set<string>;
  onToggleExpand: (path: string) => void;
}

function TreeNode({
  entry,
  basePath,
  selectedPath,
  onSelect,
  expandedPaths,
  onToggleExpand,
}: TreeNodeProps) {
  const fullPath = `${basePath}/${entry.name}`;
  const isExpanded = expandedPaths.has(fullPath);
  const isSelected = selectedPath === fullPath;

  const handleClick = () => {
    if (entry.isDirectory) {
      onToggleExpand(fullPath);
    } else {
      onSelect(fullPath, false);
    }
  };

  return (
    <li className="tree-node">
      <button
        className={`tree-item ${isSelected ? 'selected' : ''}`}
        onClick={handleClick}
      >
        <span className="tree-icon">
          {entry.isDirectory ? (isExpanded ? '📂' : '📁') : '📄'}
        </span>
        <span className="tree-name">{entry.name}</span>
      </button>
      {entry.isDirectory && isExpanded && entry.children && (
        <ul className="tree-children">
          {entry.children.map((child) => (
            <TreeNode
              key={child.name}
              entry={child}
              basePath={fullPath}
              selectedPath={selectedPath}
              onSelect={onSelect}
              expandedPaths={expandedPaths}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export function ImplementView() {
  const { project } = useProjectStore();
  const [rootEntries, setRootEntries] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<SourceFileContent | null>(null);
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());

  // Load root directory entries
  useEffect(() => {
    if (!project) return;

    const loadDirectory = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await listDirectory(project.path);
        // Filter out common directories to ignore
        const filtered = result.entries.filter((e) => {
          const name = e.name.toLowerCase();
          return (
            !name.startsWith('.') &&
            name !== 'node_modules' &&
            name !== 'target' &&
            name !== 'dist' &&
            name !== 'build'
          );
        });
        setRootEntries(filtered);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    loadDirectory();
  }, [project]);

  // Load file content when selected
  useEffect(() => {
    if (!selectedPath) {
      setFileContent(null);
      return;
    }

    const loadFile = async () => {
      try {
        const result = await readSourceFile(selectedPath);
        setFileContent(result);
      } catch (err) {
        console.error('Failed to load file:', err);
        setFileContent(null);
      }
    };

    loadFile();
  }, [selectedPath]);

  const handleToggleExpand = async (path: string) => {
    const newExpanded = new Set(expandedPaths);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
      // Load directory contents if not already loaded
      try {
        const result = await listDirectory(path);
        // Update the tree with new children
        // This is simplified - in production we'd update the tree structure properly
        setRootEntries((prev) => updateTreeWithChildren(prev, project?.path ?? '', path, result.entries));
      } catch (err) {
        console.error('Failed to load directory:', err);
      }
    }
    setExpandedPaths(newExpanded);
  };

  const handleSelect = (path: string, isDir: boolean) => {
    if (!isDir) {
      setSelectedPath(path);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading project files..." />;
  }

  if (error) {
    return (
      <EmptyState
        icon="⚠️"
        title="Error Loading Files"
        description={error}
      />
    );
  }

  return (
    <div className="workflow-view implement-view">
      <div className="implement-layout">
        {/* File tree */}
        <div className="file-tree-pane">
          <div className="file-tree-header">
            <span>Files</span>
          </div>
          <ul className="file-tree">
            {rootEntries.map((entry) => (
              <TreeNode
                key={entry.name}
                entry={entry}
                basePath={project?.path ?? ''}
                selectedPath={selectedPath}
                onSelect={handleSelect}
                expandedPaths={expandedPaths}
                onToggleExpand={handleToggleExpand}
              />
            ))}
          </ul>
        </div>

        {/* File content */}
        <div className="file-content-pane">
          {!selectedPath ? (
            <EmptyState
              icon="📄"
              title="No File Selected"
              description="Select a file from the tree to view its contents."
            />
          ) : !fileContent ? (
            <LoadingSpinner message="Loading file..." />
          ) : (
            <div className="file-viewer">
              <SourceViewer
                code={fileContent.content}
                language={fileContent.language}
                fileName={selectedPath.split('/').pop()}
                showLineNumbers={true}
                maxHeight="100%"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper to update tree structure with loaded children
function updateTreeWithChildren(
  entries: FileEntry[],
  basePath: string,
  targetPath: string,
  children: FileEntry[]
): FileEntry[] {
  return entries.map((entry) => {
    const fullPath = `${basePath}/${entry.name}`;
    if (fullPath === targetPath) {
      return { ...entry, children };
    }
    if (entry.children && targetPath.startsWith(fullPath + '/')) {
      return {
        ...entry,
        children: updateTreeWithChildren(entry.children, fullPath, targetPath, children),
      };
    }
    return entry;
  });
}
