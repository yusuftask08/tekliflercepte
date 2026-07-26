import { Spinner } from "@tekliflercepte/ui";

// Shared loading fallback for inner pages (panel, mesajlar, bildirimler,
// profil) — reuses the same spinner already used inline across the app
// (request-wizard, onboarding-form, message-thread, ustalar/filters)
// instead of introducing yet another one-off loading visual.
export function PageLoading() {
  return (
    <div className="flex min-h-[60vh] w-full flex-1 flex-col items-center justify-center gap-3">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100">
        <Spinner size="lg" />
      </div>
      <div className="text-sm font-medium text-text-muted">Yükleniyor...</div>
    </div>
  );
}
