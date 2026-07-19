export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col sm:max-w-xl sm:py-8 lg:max-w-3xl lg:py-14">
      <div className="flex flex-1 flex-col gap-4 p-4 sm:rounded-lg sm:border sm:border-border sm:bg-surface sm:p-6 sm:shadow-md">
        <div className="h-1.5 w-full animate-pulse rounded-full bg-surface-raised" />
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-md border border-border bg-surface-raised" />
          ))}
        </div>
      </div>
    </div>
  );
}
