import { workflowSteps } from '@/config/workflowSteps';
import { useWorkflowStore } from '@/stores/workflowStore';
import { useProjectStore } from '@/stores/projectStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { WorkflowStepId } from '@/types';

export function NavPane() {
  const { selectedStep, setSelectedStep, stepContentStatus } = useWorkflowStore();
  const { project, activeSpec } = useProjectStore();
  
  // Sidebar settings from store
  const showIcons = useSettingsStore((state) => state.sidebarShowIcons);
  const compactMode = useSettingsStore((state) => state.sidebarCompactMode);

  const handleStepClick = (stepId: WorkflowStepId) => {
    setSelectedStep(stepId);
  };

  return (
    <nav className="flex h-full flex-col w-[220px] bg-card border-r border-border">
      <div className={cn("flex items-center w-full px-4 border-b border-border", compactMode ? "h-8" : "h-10")}>
        <span className={cn("text-muted-foreground uppercase", compactMode ? "text-xs" : "text-sm")}>Workflow</span>
      </div>
      
      <ScrollArea className="rounded-md flex-1 w-full">
        <div className={cn("px-2", compactMode ? "py-0.5" : "py-1")}>
            {workflowSteps.map((step) => {
            const isSelected = selectedStep === step.id;
            const hasContent = stepContentStatus[step.id];
            const isDisabled = !project || !activeSpec;

            return (
                    <Button
                        key={step.id}
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
                        {hasContent && (
                        <span className="h-2 w-2 rounded-full bg-success" title="Has content" />
                        )}
                        {step.requiresGitHub && (
                        <Badge variant="outline" className={cn("px-1", compactMode ? "h-3 text-[8px]" : "h-4 text-[10px]")}>GH</Badge>
                        )}
                    </Button>
            );
        })}
        </div>
      </ScrollArea>
    </nav>
  );
}
