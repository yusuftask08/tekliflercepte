import Link from "next/link";
import { Button } from "@tekliflercepte/ui";
import { CategoryIcon } from "./category-icon";
import { categoryTone } from "./category-theme";
import { HowItWorksIcon } from "./how-it-works-icon";
import { TrustIcon } from "./trust-icon";
import { HomeFab } from "./home-fab";
import { HeroSearch } from "./hero-search";
import { SiteFooter } from "./site-footer";
import { getSessionUser } from "@/lib/session";

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

const VALUE_PROPS = [
  {
    icon: "free",
    title: "Teklif Almak Ücretsiz",
    body: "İhtiyacını paylaş, ustalardan gelen teklifleri karşılaştır. Cebinden bir kuruş çıkmaz.",
  },
  {
    icon: "clock",
    title: "Zaman Kazan",
    body: "Dükkan dükkan gezmek yerine teklifler sana gelsin, zamanın sevdiklerinle kalsın.",
  },
  {
    icon: "shield",
    title: "Doğrulanmış Ustalar",
    body: "Telefonu doğrulanmış, puanı ve geçmiş işleri görünür ustalarla çalış.",
  },
  {
    icon: "spark",
    title: "Kolayca Kullan",
    body: "Birkaç soruyu cevapla, talebini bir dakikada oluştur.",
  },
];

const HOW_IT_WORKS = [
  {
    icon: "request",
    title: "Talebini anlat",
    body: "Ne tür bir hizmete ihtiyacın olduğunu, konumunu ve detayları birkaç adımda gir.",
  },
  {
    icon: "compare",
    title: "Ücretsiz teklifleri karşılaştır",
    body: "Ustalar sana teklif gönderir — bu tamamen ücretsiz, komisyon yok.",
  },
  {
    icon: "choose",
    title: "Ustanı seç, işini yaptır",
    body: "Beğendiğin teklifi seç, ustayla doğrudan anlaş, ödemeyi ona doğrudan yap.",
  },
];

const TRUST_SIGNALS = [
  {
    icon: "phone",
    title: "Telefon Doğrulama",
    body: "Ustalar platforma katılmadan önce telefon numarasını doğrular, kimliğini teyit eder.",
  },
  {
    icon: "checklist",
    title: "İçerik Moderasyonu",
    body: "Her talep, ustalara görünmeden önce ekibimiz tarafından incelenir ve onaylanır.",
  },
  {
    icon: "star",
    title: "Gerçek Değerlendirmeler",
    body: "Sadece işi tamamlanan müşteriler değerlendirme yapabilir — sahte yorum yok.",
  },
  {
    icon: "shield",
    title: "Güvenli Mesajlaşma",
    body: "Şüpheli kullanıcıları engelleyebilir, raporlayabilirsin; spam ve kötüye kullanıma karşı sınırlarımız var.",
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
  const [categories, stats, user] = await Promise.all([
    getCategories(),
    getPublicStats(),
    getSessionUser(),
  ]);
  const showProviderCta = !user || user.role !== "PROVIDER";

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <script
        type="application/ld+json"
        // Static, server-controlled JSON only — no user input is ever
        // interpolated here, so this dangerouslySetInnerHTML is safe.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />

      {/* Hero */}
      <section className="py-10 sm:py-16 lg:py-20">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-10 px-4 text-center sm:px-6 lg:flex-row lg:items-center lg:gap-14 lg:px-8 lg:text-left">
          <div className="lg:max-w-xl lg:py-4">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-brand-100 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide text-brand-700">
              Türkiye&apos;nin ücretsiz teklif pazaryeri
            </div>
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              Ustanı bul, <span className="text-primary">teklif iste</span>
            </h1>
            <p className="mt-4 text-base leading-relaxed text-text-muted sm:text-lg">
              Teklif vermek ücretsiz, komisyon yok. Ödemeyi doğrudan ustaya yaparsın — aracı olarak
              cebinden bir kuruş almayız.
            </p>
            <div className="mt-7 flex justify-center lg:justify-start">
              <HeroSearch categories={categories} />
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Link href="/talep-olustur">
                <Button size="lg" className="w-full shadow-md sm:w-auto">
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

          <div className="w-full max-w-md rounded-lg border border-border bg-surface p-6 shadow-lg sm:p-8 lg:flex-1">
            {/* Below a real-traction threshold, raw counters (1 tamamlanan iş,
                "—" ortalama puan) undersell a brand-new platform — qualitative
                promises read better than a low number. Once there's enough
                completed work to be genuinely impressive, this flips itself
                over to the real stats automatically. */}
            {stats?.completedJobsCount >= 20 ? (
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-extrabold text-primary sm:text-3xl">
                    {stats.completedJobsCount}+
                  </div>
                  <div className="mt-1 text-xs text-text-muted sm:text-sm">tamamlanan iş</div>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1 text-2xl font-extrabold text-primary sm:text-3xl">
                    {stats.avgRating ? stats.avgRating.toFixed(1) : "—"}
                    {stats.avgRating && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="sm:h-6 sm:w-6">
                        <path d="M12 2.5l2.9 6.2 6.6.7-5 4.6 1.4 6.6L12 17.4l-5.9 3.2 1.4-6.6-5-4.6 6.6-.7L12 2.5Z" />
                      </svg>
                    )}
                  </div>
                  <div className="mt-1 text-xs text-text-muted sm:text-sm">ortalama puan</div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-primary sm:text-3xl">%100</div>
                  <div className="mt-1 text-xs text-text-muted sm:text-sm">ücretsiz teklif</div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-xl font-extrabold text-primary sm:text-2xl">Ücretsiz</div>
                  <div className="mt-1 text-xs text-text-muted sm:text-sm">teklif almak</div>
                </div>
                <div>
                  <div className="text-xl font-extrabold text-primary sm:text-2xl">%0</div>
                  <div className="mt-1 text-xs text-text-muted sm:text-sm">komisyon</div>
                </div>
                <div>
                  <div className="text-xl font-extrabold text-primary sm:text-2xl">Dakikalar</div>
                  <div className="mt-1 text-xs text-text-muted sm:text-sm">içinde teklif al</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Değer önerileri */}
      <section className="border-y border-border bg-surface py-10">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          {VALUE_PROPS.map((item) => (
            <div key={item.title} className="text-center sm:text-left">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-600 sm:mx-0">
                <TrustIcon name={item.icon} />
              </div>
              <div className="mt-3 text-base font-bold">{item.title}</div>
              <p className="mt-1.5 text-sm leading-relaxed text-text-muted">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Nasıl Çalışır */}
      <section id="nasil-calisir" className="py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">Nasıl Çalışır?</h2>
          <div className="relative mt-12 grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-8">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-6 hidden border-t border-dashed border-border sm:block"
            />
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.title} className="relative text-center sm:text-left">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary bg-surface text-sm font-extrabold text-primary sm:mx-0">
                  {i + 1}
                </div>
                <div className="mt-4 flex items-center justify-center gap-2.5 sm:justify-start">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-100 text-brand-600">
                    <HowItWorksIcon name={step.icon} />
                  </span>
                  <div className="text-lg font-bold">{step.title}</div>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Kategoriler */}
      <section id="kategoriler" className="border-t border-border bg-surface py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => {
                const tone = categoryTone(category.slug);
                const shown = category.children.slice(0, 6);
                const remaining = category.children.length - shown.length;
                return (
                  <div
                    key={category.id}
                    className="rounded-lg border border-border bg-bg p-5 shadow-sm transition-shadow hover:shadow-md"
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
                          className="rounded-full bg-surface px-2.5 py-1 text-xs text-text-muted hover:bg-brand-50 hover:text-brand-700"
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

      {/* Hizmet veren olarak katıl */}
      {showProviderCta && (
        <section className="py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center gap-8 overflow-hidden rounded-lg bg-gradient-to-br from-primary to-primary-strong p-8 text-center text-text-on-brand sm:p-12 lg:flex-row lg:justify-between lg:text-left">
              <div className="lg:max-w-lg">
                <h2 className="text-2xl font-extrabold sm:text-3xl">Hizmet veren olarak katıl</h2>
                <p className="mt-3 text-sm leading-relaxed opacity-90 sm:text-base">
                  Bölgende açılan taleplere ücretsiz teklif ver, komisyon ödemeden iş kazan. Kayıt
                  olmak bir dakika sürer.
                </p>
              </div>
              <Link href="/hizmet-ver" className="flex-shrink-0">
                <Button size="lg" className="w-full bg-surface !text-primary shadow-md hover:opacity-90 sm:w-auto">
                  Ücretsiz üye ol →
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Güven & Şeffaflık */}
      <section className="border-t border-border bg-surface py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">Güven & Şeffaflık</h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-text-muted sm:text-base">
              Aracı hizmet sağlayıcı olarak, ödeme veya sözleşmeye taraf olmadan güvenli bir buluşma
              noktası olmayı hedefliyoruz.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TRUST_SIGNALS.map((item) => (
              <div
                key={item.title}
                className="rounded-lg border border-border bg-bg p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-100 text-brand-600">
                  <TrustIcon name={item.icon} />
                </div>
                <div className="mt-4 text-base font-bold">{item.title}</div>
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
