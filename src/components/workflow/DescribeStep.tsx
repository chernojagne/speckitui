import { useState } from 'react';
import { DescribeEditor } from './DescribeEditor';
import { useDescription } from '@/hooks/useDescription';
import { useProjectStore } from '@/stores/projectStore';
import { useTerminalStore } from '@/stores/terminalStore';
import { writeTerminal } from '@/services/tauriCommands';
import { Loader2, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function DescribeStep() {
  const { project, activeSpec } = useProjectStore();
  const { activeSessionId } = useTerminalStore();
  const [sendStatus, setSendStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const {
    content,
    isDirty,
    isLoading,
    isSaving,
    error,
    updateContent,
  } = useDescription();

  const handleSendToTerminal = async () => {
    if (!activeSessionId || !content.trim()) return;

    try {
      // Send the description text to the terminal
      await writeTerminal(activeSessionId, content);
      setSendStatus('success');
      // Reset status after 2 seconds
      setTimeout(() => setSendStatus('idle'), 2000);
    } catch (err) {
      console.error('Failed to send to terminal:', err);
      setSendStatus('error');
      setTimeout(() => setSendStatus('idle'), 3000);
    }
  };

  // Show placeholder when no project/spec is loaded
  if (!project || !activeSpec) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
        <p>No spec selected</p>
        <p className="text-sm">Open a project and select a spec to start describing your feature.</p>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
        <Loader2 className="h-6 w-6 animate-spin" />
        <p>Loading description...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-destructive gap-2">
        <p>Error loading description</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 bg-card border-b border-border">
        <h3 className="text-sm font-semibold m-0">Describe</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSendToTerminal}
          disabled={!activeSessionId || isLoading || !content.trim()}
          className={cn(
            "gap-1.5 ml-auto",
            sendStatus === 'success' && "border-success text-success",
            sendStatus === 'error' && "border-destructive text-destructive"
          )}
        >
          {sendStatus === 'success' ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5" />
              Sent!
            </>
          ) : sendStatus === 'error' ? (
            <>
              <AlertCircle className="h-3.5 w-3.5" />
              Failed
            </>
          ) : (
            <>
              <Send className="h-3.5 w-3.5" />
              Send to Terminal
            </>
          )}
        </Button>
      </div>

      <div className="flex-1 min-h-0 p-4">
        <DescribeEditor
          content={content}
          onChange={updateContent}
          isSaving={isSaving}
          isDirty={isDirty}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
