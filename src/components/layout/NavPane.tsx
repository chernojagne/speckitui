import { workflowSteps } from '@/config/workflowSteps';
import { useWorkflowStore } from '@/stores/workflowStore';
import { useProjectStore } from '@/stores/projectStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { WorkflowStepId } from '@/types';

export function NavPane() {
  const { selectedStep, setSelectedStep, stepContentStatus } = useWorkflowStore();
  const { project, activeSpec } = useProjectStore();

  const handleStepClick = (stepId: WorkflowStepId) => {
    setSelectedStep(stepId);
  };

  return (
    <nav className="flex flex-col w-[220px] bg-card border-r border-border">
      <div className="flex items-center h-10 px-4 border-b border-border">
        <span className="text-sm font-semibold text-foreground">Workflow</span>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {workflowSteps.map((step) => {
            const isSelected = selectedStep === step.id;
            const hasContent = stepContentStatus[step.id];
            const isDisabled = !project || !activeSpec;

            return (
              <Button
                key={step.id}
                variant={isSelected ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-2 h-9",
                  isSelected && "bg-accent text-accent-foreground",
                  !isSelected && hasContent && "text-foreground"
                )}
                onClick={() => handleStepClick(step.id)}
                disabled={isDisabled}
                aria-current={isSelected ? 'page' : undefined}
              >
                <span className="text-base">{step.icon}</span>
                <span className="flex-1 text-left text-sm">{step.label}</span>
                {hasContent && (
                  <span className="h-2 w-2 rounded-full bg-success" title="Has content" />
                )}
                {step.requiresGitHub && (
                  <Badge variant="outline" className="h-4 px-1 text-[10px]">GH</Badge>
                )}
              </Button>
            );
          })}
        </div>
      </ScrollArea>
      
      {activeSpec && (
        <>
          <Separator />
          <div className="p-3">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="font-mono">
                {String(activeSpec.number).padStart(3, '0')}
              </Badge>
              <span className="text-sm text-muted-foreground truncate">
                {activeSpec.shortName}
              </span>
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
