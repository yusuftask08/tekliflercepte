import Link from "next/link";

const PANEL_POINTS = [
  "Teklif almak ve vermek tamamen ücretsiz",
  "Talepler onaydan geçmeden yayınlanmaz",
  "Sadece tamamlanan işler değerlendirilir",
  "Telefonu doğrulanmış ustalar",
];

function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="mt-0.5 flex-shrink-0">
      <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.18" />
      <path d="M8 12.5l2.5 2.5L16 9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Shared shell for giriş / kayıt / şifremi-unuttum / şifremi-sifirla so the
// four auth-adjacent pages read as one cohesive flow instead of four
// independently-styled forms. Brand panel only shows on lg+ — on mobile it'd
// just push the actual form below the fold for no benefit.
export function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-screen bg-bg">
      <div className="relative hidden w-[38%] max-w-md flex-col justify-between overflow-hidden bg-gradient-to-br from-primary to-primary-strong px-10 py-12 text-text-on-brand lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-black/10 blur-3xl"
        />

        <Link href="/" className="relative text-xl font-extrabold">
          Teklifler Cepte
        </Link>

        <div className="relative">
          <h2 className="text-3xl font-extrabold leading-tight">
            Ustanı bul,
            <br />
            ücretsiz teklif al
          </h2>
          <ul className="mt-8 flex flex-col gap-4">
            {PANEL_POINTS.map((point) => (
              <li key={point} className="flex items-start gap-3 text-sm">
                <CheckIcon />
                <span className="text-text-on-brand/90">{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-text-on-brand/60">
          © {new Date().getFullYear()} Teklifler Cepte
        </p>
      </div>

      <div className="flex w-full flex-1 flex-col justify-center px-4 py-10 sm:px-6 sm:py-16 lg:px-12 xl:px-20">
        <div className="mx-auto w-full max-w-md">
          <Link href="/" className="mb-8 inline-block text-lg font-extrabold lg:hidden">
            Teklifler Cepte
          </Link>

          <div className="rounded-lg border border-border bg-surface p-6 shadow-md sm:p-8">
            <h1 className={subtitle ? "mb-2 text-2xl font-bold" : "mb-6 text-2xl font-bold"}>{title}</h1>
            {subtitle && <p className="mb-6 text-sm text-text-muted">{subtitle}</p>}
            {children}
          </div>

          {footer && <div className="mt-5 text-center text-sm text-text-muted">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
