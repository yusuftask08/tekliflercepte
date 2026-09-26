import Link from "next/link";
import { BrandLogo } from "./brand-logo";
import { MascotIcon } from "./mascot-icon";
import { TrustIcon } from "./trust-icon";

const HIGHLIGHTS = [
  { icon: "free", title: "Teklif almak ücretsiz", text: "Talebini anlat, ustalar sana teklif göndersin." },
  { icon: "shield", title: "Doğrulanmış ustalar", text: "Telefonu doğrulanmış, puanı ve yorumları açık profiller." },
  { icon: "lock", title: "%0 komisyon", text: "Ödemeyi doğrudan ustaya yaparsın, araya kimse girmez." },
];

// Shared shell for giriş / kayıt / şifremi-unuttum / şifremi-sifirla.
// Desktop: brand panel on the left (same gradient treatment as the
// homepage's "Hizmet veren olarak katıl" block), form on the right.
// Mobile: the panel is dropped entirely — just logo + form.
export function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-screen bg-bg">
      <aside className="relative hidden w-[44%] max-w-2xl overflow-hidden bg-gradient-to-br from-primary to-primary-strong text-text-on-brand lg:block">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10" />
        <div aria-hidden className="pointer-events-none absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-white/5" />

        <div className="sticky top-0 flex h-screen flex-col justify-between p-10 xl:p-14">
          <BrandLogo inverted size="lg" />

          <div className="relative max-w-md">
            <h2 className="text-3xl font-extrabold leading-tight xl:text-4xl">
              Ustanı bul, teklifleri karşılaştır.
            </h2>
            <p className="mt-4 text-base leading-relaxed opacity-90">
              Hizmet almak isteyenlerle hizmet verenleri ücretsiz buluşturan platform.
            </p>

            <ul className="mt-10 flex flex-col gap-6">
              {HIGHLIGHTS.map((item) => (
                <li key={item.title} className="flex gap-4">
                  <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-md bg-white/15">
                    <TrustIcon name={item.icon} size={20} />
                  </span>
                  <div>
                    <div className="font-bold">{item.title}</div>
                    <div className="mt-0.5 text-sm opacity-85">{item.text}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-end justify-between gap-4 text-sm opacity-90">
            <div>
              <div className="font-semibold">Yardım mı lazım?</div>
              <a href="mailto:destek@tekliflercepte.com" className="underline-offset-4 hover:underline">
                destek@tekliflercepte.com
              </a>
            </div>
            <span className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full bg-surface shadow-lg">
              <MascotIcon size={60} waving />
            </span>
          </div>
        </div>
      </aside>

      <main className="flex min-h-screen flex-1 flex-col">
        <div className="flex items-center justify-between px-4 py-5 sm:px-8">
          <BrandLogo className="lg:invisible" />
          <Link href="/" className="text-sm font-semibold text-text-muted hover:text-primary">
            ← Ana sayfa
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-4 pb-12 pt-4 sm:px-8">
          <div className="w-full max-w-md">
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1>
            {subtitle && <p className="mt-2 text-sm leading-relaxed text-text-muted sm:text-base">{subtitle}</p>}

            <div className="mt-5 rounded-lg border border-border bg-surface p-4 shadow-sm sm:p-5">{children}</div>

            {footer && <div className="mt-6 text-center text-sm text-text-muted">{footer}</div>}
          </div>
        </div>
      </main>
    </div>
  );
}
