export default function Loading() {
  return (
    <div>
      <div className="mb-5 h-6 w-32 animate-pulse rounded bg-surface-raised" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg border border-border bg-surface-raised" />
        ))}
      </div>
      <div className="mt-8 flex flex-col gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-6 animate-pulse rounded bg-surface-raised" />
        ))}
      </div>
    </div>
  );
}
