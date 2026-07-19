export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-md flex-1 px-4 py-8 sm:max-w-2xl sm:py-12 lg:max-w-5xl lg:py-16">
      <div className="h-4 w-20 animate-pulse rounded bg-surface-raised" />
      <div className="mt-6 lg:grid lg:grid-cols-[1.3fr_1fr] lg:gap-10">
        <div className="flex flex-col gap-3">
          <div className="h-12 w-12 animate-pulse rounded-full bg-surface-raised" />
          <div className="h-10 animate-pulse rounded-md bg-surface-raised" />
          <div className="h-10 animate-pulse rounded-md bg-surface-raised" />
        </div>
        <div className="mt-8 h-32 animate-pulse rounded-lg border border-border bg-surface-raised lg:mt-0" />
      </div>
    </div>
  );
}
