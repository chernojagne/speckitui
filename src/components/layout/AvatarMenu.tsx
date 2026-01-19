import { useState, useEffect, useCallback } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Settings, LogOut, User, Github, Loader2 } from 'lucide-react';
import { checkGitHubAuth, githubLogout } from '@/services/tauriCommands';

interface AvatarMenuProps {
  onSettings: () => void;
  isCollapsed?: boolean;
}

export function AvatarMenu({
  onSettings,
  isCollapsed = false,
}: AvatarMenuProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [githubUsername, setGithubUsername] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  // Check auth status
  const checkAuth = useCallback(async () => {
    try {
      const status = await checkGitHubAuth();
      setIsLoggedIn(status.isAuthenticated);
      setGithubUsername(status.login);
    } catch (err) {
      console.error('Failed to check GitHub auth:', err);
    }
  }, []);

  // Check auth status on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Re-check auth when dropdown opens
  const handleOpenChange = useCallback((open: boolean) => {
    if (open) {
      checkAuth();
    }
  }, [checkAuth]);

  const handleLogout = useCallback(async () => {
    setIsLoading(true);
    try {
      await githubLogout();
      setIsLoggedIn(false);
      setGithubUsername(undefined);
    } catch (err) {
      console.error('GitHub logout failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Common avatar button
  const AvatarButton = (
    <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isLoading}>
      <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center">
        {isLoading ? (
          <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
        ) : (
          <User className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
    </Button>
  );

  // Common dropdown content
  const MenuContent = ({ align, side }: { align: 'center' | 'start'; side: 'right' | 'top' }) => (
    <DropdownMenuContent align={align} side={side} className="w-64">
      <DropdownMenuLabel>Account</DropdownMenuLabel>
      <DropdownMenuSeparator />
      
      {isLoggedIn && githubUsername ? (
        <>
          <DropdownMenuItem disabled>
            <Github className="mr-2 h-4 w-4" />
            {githubUsername}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout} disabled={isLoading}>
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </DropdownMenuItem>
          <DropdownMenuSeparator />
        </>
      ) : (
        <>
          <div className="px-2 py-2 text-xs text-muted-foreground">
            <p className="mb-2">To log in, run in the terminal:</p>
            <code className="block bg-muted px-2 py-1 rounded text-xs font-mono">
              gh auth login
            </code>
          </div>
          <DropdownMenuSeparator />
        </>
      )}
      
      <DropdownMenuItem onClick={onSettings}>
        <Settings className="mr-2 h-4 w-4" />
        Settings
      </DropdownMenuItem>
    </DropdownMenuContent>
  );

  // Collapsed state: just show icon
  if (isCollapsed) {
    return (
      <div className="mt-auto flex justify-center pb-2">
        <DropdownMenu onOpenChange={handleOpenChange}>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                {AvatarButton}
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="right">
              {isLoggedIn ? githubUsername || 'Account' : 'Not logged in'}
            </TooltipContent>
          </Tooltip>
          <MenuContent align="center" side="right" />
        </DropdownMenu>
      </div>
    );
  }

  // Expanded state: show icon only (no text beside it)
  return (
    <div className="px-3 py-2 border-t border-border mt-auto flex justify-start">
      <DropdownMenu onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger asChild>
          {AvatarButton}
        </DropdownMenuTrigger>
        <MenuContent align="start" side="top" />
      </DropdownMenu>
    </div>
  );
}
