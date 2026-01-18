import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DescribeEditorProps {
  content: string;
  onChange: (content: string) => void;
  isSaving?: boolean;
  isDirty?: boolean;
  isLoading?: boolean;
}

export function DescribeEditor({
  content,
  onChange,
  isSaving = false,
  isDirty = false,
  isLoading = false,
}: DescribeEditorProps) {
  return (
    <div className="flex flex-col h-full gap-3">
      {/* Editor */}
      <Textarea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Describe the feature you want to build. This description will be used to generate the specification..."
        className={cn(
          "flex-1 min-h-[200px] resize-none font-mono text-sm",
          isLoading && "opacity-50"
        )}
        disabled={isLoading}
      />

      {/* Status indicator */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
        {isSaving && (
          <span className="flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            Saving...
          </span>
        )}
        {isDirty && !isSaving && (
          <span className="text-warning">Unsaved changes</span>
        )}
        {!isDirty && !isSaving && !isLoading && content && (
          <span className="text-success">Saved</span>
        )}
      </div>
    </div>
  );
}
