function CardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-surface p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="h-11 w-11 flex-shrink-0 animate-pulse rounded-full bg-surface-raised" />
        <div className="flex-1">
          <div className="h-4 w-2/3 animate-pulse rounded bg-surface-raised" />
          <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-surface-raised" />
          <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-surface-raised" />
        </div>
      </div>
      <div className="mt-3 flex gap-1.5">
        <div className="h-5 w-16 animate-pulse rounded-full bg-surface-raised" />
        <div className="h-5 w-16 animate-pulse rounded-full bg-surface-raised" />
      </div>
    </div>
  );
}

export default function UstalarLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
        <div className="h-9 w-48 animate-pulse rounded bg-surface-raised" />
        <div className="mt-3 h-4 w-72 animate-pulse rounded bg-surface-raised" />

        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-md bg-surface-raised" />
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
