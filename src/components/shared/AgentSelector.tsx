/**
 * AgentSelector Component
 * Dialog for selecting AI agent to update with context
 * Part of 005-ui-enhancements feature
 */

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useProjectStore } from '@/stores/projectStore';
import { updateAgentContext } from '@/services/tauriCommands';
import { cn } from '@/lib/utils';
import type { AgentType } from '@/types';
import { Bot, Loader2, Check, AlertCircle } from 'lucide-react';

interface AgentSelectorProps {
  /** Whether dialog is open */
  open: boolean;
  /** Called when dialog should close */
  onOpenChange: (open: boolean) => void;
  /** Content to add to agent context */
  content: string;
  /** Feature name for the content header */
  featureName?: string;
  /** Callback after successful update */
  onSuccess?: (agentId: AgentType) => void;
  /** Callback after error */
  onError?: (error: string) => void;
}

// Simplified agent options matching backend support
const agentOptions: Array<{ id: AgentType; name: string; description: string }> = [
  { id: 'claude', name: 'Claude', description: 'Anthropic Claude AI assistant (CLAUDE.md)' },
  { id: 'copilot', name: 'GitHub Copilot', description: 'GitHub Copilot instructions' },
];

export function AgentSelector({
  open,
  onOpenChange,
  content,
  featureName = 'Feature Description',
  onSuccess,
  onError,
}: AgentSelectorProps) {
  const [selectedAgent, setSelectedAgent] = useState<AgentType | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  
  const project = useProjectStore((state) => state.project);

  const handleAgentSelect = useCallback((agentId: AgentType) => {
    setSelectedAgent(agentId);
    setResult(null);
  }, []);

  const handleUpdate = useCallback(async () => {
    if (!selectedAgent || !project) return;

    const agent = agentOptions.find(a => a.id === selectedAgent);
    if (!agent) return;

    setIsUpdating(true);
    setResult(null);

    try {
      // Call the backend command which handles file creation and marker-based insertion
      await updateAgentContext(
        selectedAgent,
        content,
        featureName,
        project.path
      );

      setResult({
        success: true,
        message: `Updated ${agent.name} context successfully`,
      });
      
      onSuccess?.(selectedAgent);
      
      // Auto-close after success
      setTimeout(() => {
        onOpenChange(false);
        setResult(null);
        setSelectedAgent(null);
      }, 1500);
      
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setResult({
        success: false,
        message: `Failed to update: ${message}`,
      });
      onError?.(message);
    } finally {
      setIsUpdating(false);
    }
  }, [selectedAgent, project, content, featureName, onSuccess, onError, onOpenChange]);

  const handleClose = useCallback(() => {
    if (!isUpdating) {
      onOpenChange(false);
      setResult(null);
      setSelectedAgent(null);
    }
  }, [isUpdating, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Add to Agent Context
          </DialogTitle>
          <DialogDescription>
            Select an AI agent to add the current description to its context file.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2 py-4">
          {agentOptions.map((agent) => (
            <AgentOption
              key={agent.id}
              id={agent.id}
              name={agent.name}
              description={agent.description}
              isSelected={selectedAgent === agent.id}
              onClick={() => handleAgentSelect(agent.id)}
              disabled={isUpdating}
            />
          ))}
        </div>

        {/* Result message */}
        {result && (
          <div
            className={cn(
              "flex items-center gap-2 text-sm p-2 rounded",
              result.success
                ? "bg-success/10 text-success"
                : "bg-destructive/10 text-destructive"
            )}
          >
            {result.success ? (
              <Check className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            {result.message}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isUpdating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdate}
            disabled={!selectedAgent || isUpdating || !content.trim()}
          >
            {isUpdating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              'Add Context'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Individual agent option component
interface AgentOptionProps {
  id: AgentType;
  name: string;
  description: string;
  isSelected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

function AgentOption({ name, description, isSelected, onClick, disabled }: AgentOptionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg border text-left transition-colors",
        "hover:bg-accent hover:border-accent-foreground/20",
        isSelected && "border-primary bg-primary/5",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <div className={cn(
        "h-4 w-4 rounded-full border-2 mt-0.5 shrink-0",
        isSelected ? "border-primary bg-primary" : "border-muted-foreground"
      )}>
        {isSelected && (
          <Check className="h-2.5 w-2.5 text-primary-foreground m-auto mt-0.5" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm">{name}</div>
        <div className="text-xs text-muted-foreground truncate">
          {description}
        </div>
      </div>
    </button>
  );
}
