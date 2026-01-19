import React from 'react';
import { workflowSteps } from '@/config/workflowSteps';
import { useWorkflowStore } from '@/stores/workflowStore';
import { useProjectStore } from '@/stores/projectStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { ProjectHeader } from './ProjectHeader';
import { SpecSelector } from './SpecSelector';
import { AvatarMenu } from './AvatarMenu';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Github, ScrollText } from 'lucide-react';
import type { WorkflowStepId } from '@/types';

interface NavPaneProps {
  onOpenProject: () => void;
  onSettings: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function NavPane({ onOpenProject, onSettings, isCollapsed = false, onToggleCollapse }: NavPaneProps) {
  const { selectedStep, setSelectedStep, stepContentStatus } = useWorkflowStore();
  const { project, activeSpec } = useProjectStore();
  
  // Sidebar settings from store
  const showIcons = useSettingsStore((state) => state.sidebarShowIcons);
  const compactMode = useSettingsStore((state) => state.sidebarCompactMode);

  const handleStepClick = (stepId: WorkflowStepId) => {
    setSelectedStep(stepId);
  };

  // Collapsed icon rail mode
  if (isCollapsed) {
    const isConstitutionSelected = selectedStep === 'constitution';
    
    return (
      <nav className="flex h-full flex-col w-full bg-card border-r border-border items-center py-2">
        {/* Expand button - aligned to right */}
        <div className="w-full flex justify-end px-1 mb-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onToggleCollapse}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Expand sidebar</TooltipContent>
          </Tooltip>
        </div>

        {/* Constitution nav item */}
        {project && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isConstitutionSelected ? "secondary" : "ghost"}
                  size="icon"
                  className={cn(
                    "h-8 w-8 relative",
                    isConstitutionSelected && "bg-accent text-accent-foreground"
                  )}
                  onClick={() => handleStepClick('constitution')}
                >
                  <ScrollText className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Constitution</TooltipContent>
            </Tooltip>
            <Separator className="my-1 w-6" />
          </>
        )}

        {/* Workflow step icons */}
        <div className="flex-1 flex flex-col items-center gap-1 overflow-auto">
          {workflowSteps.map((step) => {
            const isSelected = selectedStep === step.id;
            const hasContent = stepContentStatus[step.id];
            const isDisabled = !project || !activeSpec;

            return (
              <Tooltip key={step.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant={isSelected ? "secondary" : "ghost"}
                    size="icon"
                    className={cn(
                      "h-8 w-8 relative",
                      isSelected && "bg-accent text-accent-foreground"
                    )}
                    onClick={() => handleStepClick(step.id)}
                    disabled={isDisabled}
                  >
                    <step.icon className="h-4 w-4" />
                    {hasContent && (
                      <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-success" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">{step.label}</TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        {/* Avatar at bottom */}
        <AvatarMenu
          onSettings={onSettings}
          isCollapsed={true}
        />
      </nav>
    );
  }

  return (
    <nav className="flex h-full flex-col w-full bg-card border-r border-border transition-all duration-200">
      {/* Project Header with collapse button */}
      <div className="flex items-center border-b border-border">
        {project ? (
          <div className="flex-1">
            <ProjectHeader projectName={project.name} onOpenProject={onOpenProject} />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center px-3 py-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={onOpenProject}
            >
              Open Project
            </Button>
          </div>
        )}
        {onToggleCollapse && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 mr-1 shrink-0"
                onClick={onToggleCollapse}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Collapse sidebar</TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* Spec Selector */}
      {project && project.specInstances.length > 0 && (
        <div className="px-3 py-2 border-b border-border">
          <SpecSelector />
        </div>
      )}

      {/* Constitution nav item */}
      {project && (
        <div className={cn("px-2", compactMode ? "py-0.5" : "py-1")}>
          <Button
            variant={selectedStep === 'constitution' ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start gap-2",
              compactMode ? "h-7" : "h-9",
              selectedStep === 'constitution' && "bg-accent text-accent-foreground"
            )}
            onClick={() => handleStepClick('constitution')}
          >
            {showIcons && <ScrollText className={cn("shrink-0", compactMode ? "h-3.5 w-3.5" : "h-4 w-4")} />}
            <span className={cn("flex-1 text-left", compactMode ? "text-xs" : "text-sm")}>Constitution</span>
          </Button>
          <Separator className="mt-1" />
        </div>
      )}
      
      <ScrollArea className="rounded-md flex-1 w-full">
        <div className={cn("px-2", compactMode ? "py-0.5" : "py-1")}>
            {workflowSteps.map((step) => {
            const isSelected = selectedStep === step.id;
            const hasContent = stepContentStatus[step.id];
            const isDisabled = !project || !activeSpec;
            // Add divider before PR step
            const showDivider = step.id === 'pr';

            return (
              <React.Fragment key={step.id}>
                {showDivider && (
                  <Separator className="my-2" />
                )}
                <Button
                    variant={isSelected ? "secondary" : "ghost"}
                    className={cn(
                    "w-full justify-start gap-2",
                    compactMode ? "h-7" : "h-9",
                    isSelected && "bg-accent text-accent-foreground",
                    !isSelected && hasContent && "text-foreground"
                    )}
                    onClick={() => handleStepClick(step.id)}
                    disabled={isDisabled}
                    aria-current={isSelected ? 'page' : undefined}
                >
                    {showIcons && <step.icon className={cn("shrink-0", compactMode ? "h-3.5 w-3.5" : "h-4 w-4")} />}
                    <span className={cn("flex-1 text-left", compactMode ? "text-xs" : "text-sm")}>{step.label}</span>
                    {hasContent && !step.requiresGitHub && (
                    <span className="h-2 w-2 rounded-full bg-success" title="Has content" />
                    )}
                    {step.requiresGitHub && (
                    <Github className={cn(
                      "shrink-0",
                      compactMode ? "h-3 w-3" : "h-4 w-4",
                      hasContent ? "text-success" : "text-muted-foreground"
                    )} />
                    )}
                </Button>
              </React.Fragment>
            );
        })}
        </div>
      </ScrollArea>

      {/* Avatar Menu */}
      <AvatarMenu
        onSettings={onSettings}
      />
    </nav>
  );
}
