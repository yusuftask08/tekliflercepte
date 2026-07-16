export function Textarea({ className = "", ...props }) {
  return (
    <textarea
      className={`w-full rounded-md border border-border bg-surface px-3.5 py-3 text-sm ${className}`}
      {...props}
    />
  );
}
