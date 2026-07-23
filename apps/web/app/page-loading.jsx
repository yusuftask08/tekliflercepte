// Shared loading fallback for inner pages (panel, mesajlar, bildirimler,
// profil) — a branded spinner badge instead of gray skeleton blocks, lighter
// than the homepage's cycling-category-icon loading.jsx since these pages
// aren't about browsing categories.
export function PageLoading() {
  return (
    <div className="flex min-h-[60vh] w-full flex-1 flex-col items-center justify-center gap-3">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-brand-600">
        <svg className="animate-spin" width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.25" />
          <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>
      <div className="text-sm font-medium text-text-muted">Yükleniyor...</div>
    </div>
  );
}
