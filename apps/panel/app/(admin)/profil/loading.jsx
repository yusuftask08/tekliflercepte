export default function Loading() {
  return (
    <div className="max-w-md">
      <div className="mb-5 h-6 w-24 animate-pulse rounded bg-surface-raised" />
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-5 shadow-sm">
        <div className="h-10 animate-pulse rounded-md bg-surface-raised" />
        <div className="h-10 animate-pulse rounded-md bg-surface-raised" />
        <div className="h-9 w-24 animate-pulse rounded-md bg-surface-raised" />
      </div>
    </div>
  );
}
