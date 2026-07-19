export default function Loading() {
  return (
    <div>
      <div className="mb-5">
        <div className="h-6 w-40 animate-pulse rounded bg-surface-raised" />
        <div className="mt-2 h-4 w-24 animate-pulse rounded bg-surface-raised" />
      </div>
      <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border-b border-border px-5 py-4 last:border-0">
            <div className="h-4 w-2/3 animate-pulse rounded bg-surface-raised" />
          </div>
        ))}
      </div>
    </div>
  );
}
