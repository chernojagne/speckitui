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
import { Settings, LogIn, User, Github } from 'lucide-react';

interface AvatarMenuProps {
  isLoggedIn?: boolean;
  githubUsername?: string;
  onLogin?: () => void;
  onSettings: () => void;
  isCollapsed?: boolean;
}

export function AvatarMenu({
  isLoggedIn = false,
  githubUsername,
  onLogin,
  onSettings,
  isCollapsed = false,
}: AvatarMenuProps) {
  // Common avatar button
  const AvatarButton = (
    <Button variant="ghost" size="icon" className="h-8 w-8">
      <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center">
        <User className="h-4 w-4 text-muted-foreground" />
      </div>
    </Button>
  );

  // Common dropdown content
  const MenuContent = ({ align, side }: { align: 'center' | 'start'; side: 'right' | 'top' }) => (
    <DropdownMenuContent align={align} side={side} className="w-56">
      <DropdownMenuLabel>Account</DropdownMenuLabel>
      <DropdownMenuSeparator />
      
      {isLoggedIn && githubUsername && (
        <>
          <DropdownMenuItem disabled>
            <Github className="mr-2 h-4 w-4" />
            {githubUsername}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
        </>
      )}
      
      {!isLoggedIn && onLogin && (
        <DropdownMenuItem onClick={onLogin}>
          <LogIn className="mr-2 h-4 w-4" />
          Log in to GitHub
        </DropdownMenuItem>
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
        <DropdownMenu>
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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {AvatarButton}
        </DropdownMenuTrigger>
        <MenuContent align="start" side="top" />
      </DropdownMenu>
    </div>
  );
}
