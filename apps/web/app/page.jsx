import Link from "next/link";
import { Button } from "@tekliflercepte/ui";
import { CategoryIcon } from "./category-icon";
import { categoryTone } from "./category-theme";
import { HowItWorksIcon } from "./how-it-works-icon";
import { HomeFab } from "./home-fab";
import { HeroSearch } from "./hero-search";
import { SiteFooter } from "./site-footer";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tekliflercepte.com";

export const metadata = {
  title: "Teklifler Cepte — Ustanı Bul, Ücretsiz Teklif Al",
  description:
    "Temizlik, tadilat, nakliyat, tamir, özel ders ve daha fazlası için ustalardan ücretsiz teklif al. Teklif vermek ücretsiz, komisyon yok — ödemeyi doğrudan ustaya yaparsın.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Teklifler Cepte — Ustanı Bul, Ücretsiz Teklif Al",
    description:
      "Temizlik, tadilat, nakliyat, tamir, özel ders ve daha fazlası için ustalardan ücretsiz teklif al. Komisyon yok.",
    url: "/",
  },
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "Teklifler Cepte",
      url: SITE_URL,
      description: "Hizmet almak isteyenleri, hizmet verenlerle ücretsiz buluşturan platform.",
    },
    {
      "@type": "WebSite",
      name: "Teklifler Cepte",
      url: SITE_URL,
      inLanguage: "tr-TR",
    },
  ],
};

const HOW_IT_WORKS = [
  {
    icon: "request",
    tone: "bg-brand-100 text-brand-600",
    title: "Talebini anlat",
    body: "Ne tür bir hizmete ihtiyacın olduğunu, konumunu ve detayları birkaç adımda gir.",
  },
  {
    icon: "compare",
    tone: "bg-info/10 text-info",
    title: "Ücretsiz teklifleri karşılaştır",
    body: "Ustalar sana teklif gönderir — bu tamamen ücretsiz, komisyon yok.",
  },
  {
    icon: "choose",
    tone: "bg-success/10 text-success",
    title: "Ustanı seç, işini yaptır",
    body: "Beğendiğin teklifi seç, ustayla doğrudan anlaş, ödemeyi ona doğrudan yap.",
  },
];

const DIFFERENTIATORS = [
  {
    title: "Teklif vermek ücretsiz",
    body: "Diğer platformların aksine ustalardan teklif ücreti almıyoruz.",
    tone: "bg-brand-100 text-brand-600",
  },
  {
    title: "Komisyon yok",
    body: "İş gerçekleştiğinde de bir kesinti yok — ödeme tamamen sizin aranızda.",
    tone: "bg-info/10 text-info",
  },
  {
    title: "Doğrulanmış ustalar",
    body: "Telefonu doğrulanmış, geçmiş işleri ve puanı görünür ustalarla çalış.",
    tone: "bg-success/10 text-success",
  },
];

async function getCategories() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  try {
    const res = await fetch(`${apiUrl}/categories`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

async function getPublicStats() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  try {
    const res = await fetch(`${apiUrl}/stats/public`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const [categories, stats] = await Promise.all([getCategories(), getPublicStats()]);

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <script
        type="application/ld+json"
        // Static, server-controlled JSON only — no user input is ever
        // interpolated here, so this dangerouslySetInnerHTML is safe.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />

      {/* Hero */}
      <section className="px-4 py-10 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 text-center lg:flex-row lg:text-left">
          <div className="lg:max-w-xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand-100 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide text-brand-700">
              Türkiye&apos;nin ücretsiz teklif pazaryeri
            </div>
            <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
              Ustanı bul, <span className="text-primary">teklif iste</span>
            </h1>
            <p className="mt-4 text-base text-text-muted sm:text-lg">
              Teklif vermek ücretsiz, komisyon yok. Ödemeyi doğrudan ustaya yaparsın — aracı olarak
              cebinden bir kuruş almayız.
            </p>
            <div className="mt-6 flex justify-center lg:justify-start">
              <HeroSearch categories={categories} />
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Link href="/talep-olustur">
                <Button size="lg" className="w-full shadow-lg sm:w-auto">
                  Talep Oluştur
                </Button>
              </Link>
              <a href="#nasil-calisir">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  Nasıl Çalışır?
                </Button>
              </a>
            </div>
          </div>

          <div className="relative w-full max-w-md overflow-hidden rounded-lg bg-gradient-to-br from-primary to-primary-strong p-6 shadow-lg sm:p-10 lg:flex-1">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-white/10"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-14 -left-10 h-40 w-40 rounded-full bg-white/10"
            />
            <div className="relative grid grid-cols-3 gap-4 text-center text-text-on-brand">
              <div>
                <div className="text-2xl font-extrabold sm:text-3xl">{stats?.completedJobsCount ?? 0}</div>
                <div className="mt-1 text-xs opacity-85 sm:text-sm">tamamlanan iş</div>
              </div>
              <div>
                <div className="text-2xl font-extrabold sm:text-3xl">
                  {stats?.avgRating ? `${stats.avgRating.toFixed(1)} ★` : "—"}
                </div>
                <div className="mt-1 text-xs opacity-85 sm:text-sm">ortalama puan</div>
              </div>
              <div>
                <div className="text-2xl font-extrabold sm:text-3xl">%100</div>
                <div className="mt-1 text-xs opacity-85 sm:text-sm">ücretsiz teklif</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nasıl Çalışır */}
      <section id="nasil-calisir" className="border-t border-border bg-surface px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">Nasıl Çalışır?</h2>
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {HOW_IT_WORKS.map((step) => (
              <div key={step.title} className="text-center sm:text-left">
                <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-lg sm:mx-0 ${step.tone}`}>
                  <HowItWorksIcon name={step.icon} />
                </div>
                <div className="mt-4 text-lg font-bold">{step.title}</div>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Kategoriler */}
      <section id="kategoriler" className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">Popüler Kategoriler</h2>
              <p className="mt-2 text-sm text-text-muted sm:text-base">
                İhtiyacına en yakın kategoriyi seç, talebini birkaç adımda oluştur.
              </p>
            </div>
            <Link href="/kategoriler" className="text-sm font-semibold text-primary hover:underline">
              Tüm kategorileri gör →
            </Link>
          </div>
          {categories.length === 0 ? (
            <p className="mt-4 text-sm text-text-muted">
              Kategori bulunamadı — API çalışıyor mu ve <code>pnpm db:seed</code> çalıştırıldı mı kontrol
              et.
            </p>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => {
                const tone = categoryTone(category.slug);
                const shown = category.children.slice(0, 6);
                const remaining = category.children.length - shown.length;
                return (
                  <div
                    key={category.id}
                    className="rounded-lg border border-border bg-surface p-5 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <Link
                      href={`/talep-olustur?kategori=${category.slug}`}
                      className="flex items-center gap-3"
                    >
                      <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg ${tone.bg} ${tone.fg}`}>
                        <CategoryIcon slug={category.slug} size={20} />
                      </div>
                      <div>
                        <div className="font-semibold">{category.name}</div>
                        <div className="text-xs text-text-muted">{category.children.length} hizmet</div>
                      </div>
                    </Link>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {shown.map((sub) => (
                        <Link
                          key={sub.id}
                          href={`/talep-olustur?kategori=${category.slug}&hizmet=${sub.slug}`}
                          className="rounded-full bg-bg px-2.5 py-1 text-xs text-text-muted hover:bg-brand-50 hover:text-brand-700"
                        >
                          {sub.name}
                        </Link>
                      ))}
                      {remaining > 0 && (
                        <Link
                          href="/kategoriler"
                          className="rounded-full px-2.5 py-1 text-xs font-semibold text-primary"
                        >
                          +{remaining} tane daha
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Neden Teklifler Cepte */}
      <section className="border-t border-border bg-surface px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">Neden Teklifler Cepte?</h2>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {DIFFERENTIATORS.map((item) => (
              <div
                key={item.title}
                className="rounded-lg border border-border bg-bg p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-lg ${item.tone}`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="text-lg font-bold">{item.title}</div>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
      <HomeFab categories={categories} />
    </div>
  );
}
