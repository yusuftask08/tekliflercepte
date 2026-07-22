import Link from "next/link";
import { TrustIcon } from "./trust-icon";

// Shared shell for giriş / kayıt / şifremi-unuttum / şifremi-sifirla. Stays
// close to the rest of the site's light, minimal look (white card, small
// teal accents) instead of a heavy solid-color panel — a big gradient block
// would be the first place on the whole site with that treatment.
export function AuthShell({ icon = "lock", title, subtitle, children, footer }) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-bg">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-brand-100 opacity-60 blur-3xl"
      />

      <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10 sm:py-16">
        <Link href="/" className="mb-6 text-center text-lg font-extrabold">
          Teklifler Cepte
        </Link>

        <div className="rounded-lg border border-border bg-surface p-6 shadow-md sm:p-8">
          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-brand-100 text-brand-600">
            <TrustIcon name={icon} size={20} />
          </div>
          <h1 className={subtitle ? "mb-2 text-2xl font-bold" : "mb-6 text-2xl font-bold"}>{title}</h1>
          {subtitle && <p className="mb-6 text-sm text-text-muted">{subtitle}</p>}
          {children}
        </div>

        {footer && <div className="mt-5 text-center text-sm text-text-muted">{footer}</div>}
      </div>
    </div>
  );
}
