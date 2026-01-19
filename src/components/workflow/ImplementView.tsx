import { useState, useEffect } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import { listDirectory, readSourceFile } from '@/services/tauriCommands';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { EmptyState } from '../shared/EmptyState';
import { SourceViewer } from '../shared/SourceViewer';
import { Folder, FolderOpen, File, AlertTriangle } from 'lucide-react';
import type { FileEntry, SourceFileContent } from '@/types';

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
    <li className="list-none">
      <button
        className={`flex items-center gap-1 w-full py-1 px-4 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground ${isSelected ? 'bg-primary text-primary-foreground' : ''}`}
        onClick={handleClick}
      >
        {entry.isDirectory ? (
          isExpanded ? <FolderOpen className="h-4 w-4 shrink-0" /> : <Folder className="h-4 w-4 shrink-0" />
        ) : (
          <File className="h-4 w-4 shrink-0" />
        )}
        <span className="overflow-hidden text-ellipsis whitespace-nowrap">{entry.name}</span>
      </button>
      {entry.isDirectory && isExpanded && entry.children && (
        <ul className="list-none pl-4">
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
        icon={AlertTriangle}
        title="Error Loading Files"
        description={error}
      />
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex h-full overflow-hidden">
        {/* File tree */}
        <div className="w-70 flex flex-col bg-card border-r border-border shrink-0 overflow-hidden">
          <div className="py-2 px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground border-b border-border">
            <span>Files</span>
          </div>
          <ul className="flex-1 overflow-auto py-1 list-none">
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
        <div className="flex-1 flex flex-col overflow-hidden">
          {!selectedPath ? (
            <EmptyState
              icon={File}
              title="No File Selected"
              description="Select a file from the tree to view its contents."
            />
          ) : !fileContent ? (
            <LoadingSpinner message="Loading file..." />
          ) : (
            <SourceViewer
              code={fileContent.content}
              language={fileContent.language}
              fileName={selectedPath.split('/').pop()}
              showLineNumbers={true}
              maxHeight="100%"
            />
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
