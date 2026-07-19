export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="h-8 w-40 animate-pulse rounded bg-surface-raised" />
        <div className="h-9 w-24 animate-pulse rounded-full bg-surface-raised" />
      </div>
      <div className="mt-8 flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-lg border border-border bg-surface-raised" />
        ))}
      </div>
    </div>
  );
}
