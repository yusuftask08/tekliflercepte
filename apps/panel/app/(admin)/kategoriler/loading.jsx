export default function Loading() {
  return (
    <div>
      <div className="mb-5">
        <div className="h-6 w-32 animate-pulse rounded bg-surface-raised" />
        <div className="mt-2 h-4 w-48 animate-pulse rounded bg-surface-raised" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-lg border border-border bg-surface-raised" />
        ))}
      </div>
    </div>
  );
}
