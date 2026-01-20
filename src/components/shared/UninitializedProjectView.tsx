/**
 * UninitializedProjectView Component
 * Displays guidance when a project folder hasn't been initialized with speckit
 */

import { AlertTriangle, Terminal, GitBranch, FolderOpen, CheckCircle2, RefreshCw, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface UninitializedProjectViewProps {
  projectPath: string;
  projectName: string;
  hasGitDir: boolean;
  hasSpecifyDir: boolean;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export function UninitializedProjectView({
  projectPath,
  projectName,
  hasGitDir,
  hasSpecifyDir,
  onRefresh,
  isRefreshing = false,
}: UninitializedProjectViewProps) {
  const needsGit = !hasGitDir;
  const needsSpecify = !hasSpecifyDir;

  return (
    <div className="flex-1 flex items-center justify-center p-8 bg-background">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-warning/10">
              <AlertTriangle className="h-6 w-6 text-warning" />
            </div>
            <div>
              <CardTitle className="text-xl">Project Not Initialized</CardTitle>
              <CardDescription className="mt-1">
                <span className="font-medium">{projectName}</span> needs to be set up before you can use SpeckitUI
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status indicators */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              {hasGitDir ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span className="text-muted-foreground">Git repository initialized</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  <span className="text-muted-foreground">Git repository not found</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm">
              {hasSpecifyDir ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span className="text-muted-foreground">Speckit environment initialized</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  <span className="text-muted-foreground">Speckit environment not found</span>
                </>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="rounded-lg border border-border p-4 bg-muted/30">
            <div className="flex items-center gap-2 mb-3">
              <Terminal className="h-4 w-4" />
              <span className="font-medium text-sm">Initialize via Terminal</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Open a terminal in your project folder and run the following commands:
            </p>
            
            <div className="space-y-4">
              {/* Git init */}
              {needsGit && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <GitBranch className="h-3.5 w-3.5" />
                    Step 1: Initialize Git
                  </div>
                  <code className="block p-3 rounded bg-background border border-border text-sm font-mono">
                    git init
                  </code>
                </div>
              )}

              {/* Speckit init */}
              {needsSpecify && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <FolderOpen className="h-3.5 w-3.5" />
                    {needsGit ? 'Step 2' : 'Step 1'}: Initialize Speckit
                  </div>
                  <code className="block p-3 rounded bg-background border border-border text-sm font-mono">
                    npx specify init .
                  </code>
                  <p className="text-xs text-muted-foreground mt-1">
                    Or if you have specify installed globally: <code className="text-xs bg-muted px-1 rounded">specify init .</code>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Refresh button and path reference */}
          <div className="pt-4 border-t border-border flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Project path: <code className="text-xs bg-muted px-1 rounded">{projectPath}</code>
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="gap-2"
            >
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {isRefreshing ? 'Checking...' : 'Check Again'}
            </Button>
          </div>

          {/* Auto-monitoring note */}
          <p className="text-xs text-muted-foreground text-center">
            SpeckitUI is monitoring for changes and will automatically refresh when initialized.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
