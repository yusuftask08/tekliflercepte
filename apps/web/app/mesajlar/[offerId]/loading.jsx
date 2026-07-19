export default function Loading() {
  return (
    <div className="flex h-dvh flex-col bg-bg">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col overflow-hidden sm:max-w-2xl sm:py-6">
        <div className="flex flex-1 flex-col overflow-hidden sm:rounded-lg sm:border sm:border-border sm:shadow-md">
          <div className="flex items-center gap-2.5 border-b border-border bg-surface px-4 py-3">
            <div className="h-9 w-9 animate-pulse rounded-full bg-surface-raised" />
            <div className="h-4 w-32 animate-pulse rounded bg-surface-raised" />
          </div>
          <div className="flex-1 space-y-2.5 px-4 py-4">
            <div className="h-10 w-2/3 animate-pulse rounded-2xl bg-surface-raised" />
            <div className="ml-auto h-10 w-1/2 animate-pulse rounded-2xl bg-surface-raised" />
            <div className="h-10 w-3/5 animate-pulse rounded-2xl bg-surface-raised" />
          </div>
        </div>
      </div>
    </div>
  );
}
