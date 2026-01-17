interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  hint?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, hint, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      {icon && <div className="text-6xl mb-6 opacity-60">{icon}</div>}
      <h2 className="text-xl font-semibold text-foreground mb-2">{title}</h2>
      {description && <p className="text-sm text-muted-foreground max-w-[400px] leading-relaxed">{description}</p>}
      {hint && <p className="text-sm text-muted-foreground mt-4 font-mono bg-muted px-4 py-2 rounded-md">{hint}</p>}
      {action && (
        <button 
          className="mt-6 px-6 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors"
          onClick={action.onClick}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
