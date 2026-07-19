export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="h-7 w-56 animate-pulse rounded bg-surface-raised" />
          <div className="mt-2 h-4 w-40 animate-pulse rounded bg-surface-raised" />
        </div>
        <div className="h-9 w-28 animate-pulse rounded-md bg-surface-raised" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-40 animate-pulse rounded-lg border border-border bg-surface-raised" />
        ))}
      </div>
    </div>
  );
}
