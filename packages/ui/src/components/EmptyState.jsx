export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-surface px-6 py-12 text-center">
      {icon && (
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-brand-600">
          {icon}
        </div>
      )}
      <div className="font-bold">{title}</div>
      {description && <p className="max-w-xs text-sm text-text-muted">{description}</p>}
      {action}
    </div>
  );
}
