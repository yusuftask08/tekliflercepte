export default function ProviderProfileLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <div className="h-[110px] w-full bg-brand-100 lg:h-[160px]" />
      <div className="mx-auto -mt-8 w-full max-w-5xl flex-1 px-4 pb-10 sm:px-6 lg:mt-0 lg:grid lg:grid-cols-[320px_1fr] lg:gap-10 lg:px-8 lg:py-10">
        <div>
          <div className="h-20 w-20 animate-pulse rounded-full bg-surface-raised" />
          <div className="mt-3 h-6 w-2/3 animate-pulse rounded bg-surface-raised" />
          <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-surface-raised" />
          <div className="mt-4 h-24 animate-pulse rounded-md bg-surface-raised" />
          <div className="mt-3 h-16 animate-pulse rounded-md bg-surface-raised" />
        </div>
        <div className="mt-8 lg:mt-0">
          <div className="h-5 w-40 animate-pulse rounded bg-surface-raised" />
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-md bg-surface-raised" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
