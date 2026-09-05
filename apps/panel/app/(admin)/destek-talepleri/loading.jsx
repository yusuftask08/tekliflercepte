export default function Loading() {
  return (
    <div>
      <div className="mb-5">
        <div className="h-6 w-40 animate-pulse rounded bg-surface-raised" />
        <div className="mt-2 h-4 w-24 animate-pulse rounded bg-surface-raised" />
      </div>
      <div className="flex flex-col gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg border border-border bg-surface" />
        ))}
      </div>
    </div>
  );
}
