import { SiteHeader } from "./site-header";

export function LegalPage({ title, children }) {
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <SiteHeader />
      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 sm:py-16">
        <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
        <div className="mt-4 rounded-md bg-warning/10 px-4 py-3 text-sm text-warning">
          Bu sayfa taslak aşamasındadır ve henüz hukuki inceleme ve onaydan geçmemiştir.
        </div>
        <div className="mt-6 flex flex-col gap-4 text-sm leading-relaxed text-text-muted">
          {children}
        </div>
      </div>
    </div>
  );
}
