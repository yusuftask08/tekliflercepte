export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-6 h-7 w-24 animate-pulse rounded bg-surface-raised" />
      <div className="mb-6 divide-y divide-border rounded-lg border border-border bg-surface shadow-sm">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse bg-surface-raised" style={{ opacity: 0.4 + i * 0.1 }} />
        ))}
      </div>
    </div>
  );
}
