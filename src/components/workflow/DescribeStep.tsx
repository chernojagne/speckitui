import { useState } from 'react';
import { DescriptionRichEditor } from '@/components/shared/DescriptionRichEditor';
import { useFeatureDescription } from '@/hooks/useFeatureDescription';
import { useProjectStore } from '@/stores/projectStore';
import { Loader2, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function DescribeStep() {
  const { project, activeSpec } = useProjectStore();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  const {
    content,
    attachments,
    isDirty,
    isLoading,
    isSaving,
    error,
    descriptionFilePath,
    updateContent,
    updateAttachments,
    saveAttachment,
    save,
  } = useFeatureDescription();

  const handleSave = async () => {
    const success = await save();
    if (success) {
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } else {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
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
        
        {descriptionFilePath && (
          <span className="text-xs text-muted-foreground truncate max-w-[300px]" title={descriptionFilePath}>
            {descriptionFilePath.split('/').slice(-2).join('/')}
          </span>
        )}
        
        <div className="flex items-center gap-2 ml-auto">
          <Button
            variant={isDirty ? 'default' : 'outline'}
            size="sm"
            onClick={handleSave}
            disabled={isLoading || isSaving || (!isDirty && saveStatus === 'idle')}
            className={cn(
              "gap-1.5",
              saveStatus === 'success' && "border-success text-success bg-success/10",
              saveStatus === 'error' && "border-destructive text-destructive bg-destructive/10"
            )}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Saving...
              </>
            ) : saveStatus === 'success' ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" />
                Saved!
              </>
            ) : saveStatus === 'error' ? (
              <>
                <AlertCircle className="h-3.5 w-3.5" />
                Failed
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                Save
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <DescriptionRichEditor
          content={content}
          onChange={updateContent}
          attachments={attachments}
          onAttachmentsChange={updateAttachments}
          onSaveAttachment={saveAttachment}
          isSaving={isSaving}
          isDirty={isDirty}
          isLoading={isLoading}
          placeholder="Describe the feature you want to build. Add text, links, images, and documents. Attachments will be saved alongside the description file..."
          heightClass="h-full"
        />
      </div>
    </div>
  );
}
