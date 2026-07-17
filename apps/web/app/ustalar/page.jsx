import Link from "next/link";
import { EmptyState } from "@tekliflercepte/ui";
import { SiteFooter } from "../site-footer";
import { EmptyIcon } from "../empty-icons";
import { ProviderCard } from "../provider-card";
import { Filters } from "./filters";
import { slugifyTr } from "../../lib/turkey-locations";

export const metadata = {
  title: "Usta Ara — Teklifler Cepte",
  description:
    "Şehrine ve ihtiyacına göre ustaları listele, profillerini incele. Teklifler Cepte'de teklif almak ücretsiz.",
};

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

function findCategoryBySlug(categories, slug) {
  for (const group of categories) {
    if (group.slug === slug) return group;
    const child = group.children.find((c) => c.slug === slug);
    if (child) return child;
  }
  return null;
}

// "0-500" / "500-1500" / "1500-" → { minPrice, maxPrice }
function parsePriceBand(fiyat) {
  if (!fiyat) return {};
  const [min, max] = fiyat.split("-");
  return { minPrice: min || undefined, maxPrice: max || undefined };
}

function buildPageHref({ city, kategori, q, sirala, minPuan, fiyat, sayfa }) {
  const params = new URLSearchParams();
  if (city) params.set("sehir", city);
  if (kategori) params.set("kategori", kategori);
  if (q) params.set("q", q);
  if (sirala) params.set("sirala", sirala);
  if (minPuan) params.set("minPuan", minPuan);
  if (fiyat) params.set("fiyat", fiyat);
  if (sayfa > 1) params.set("sayfa", String(sayfa));
  return `/ustalar${params.toString() ? `?${params.toString()}` : ""}`;
}

async function getProviders({ city, kategori, q, sirala, minPuan, fiyat, sayfa }) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  const { minPrice, maxPrice } = parsePriceBand(fiyat);
  const params = new URLSearchParams();
  if (city) params.set("city", city);
  if (kategori) params.set("kategori", kategori);
  if (q) params.set("q", q);
  if (sirala) params.set("sort", sirala);
  if (minPuan) params.set("minRating", minPuan);
  if (minPrice) params.set("minPrice", minPrice);
  if (maxPrice) params.set("maxPrice", maxPrice);
  if (sayfa) params.set("page", sayfa);
  try {
    const res = await fetch(`${apiUrl}/providers?${params.toString()}`, { cache: "no-store" });
    if (!res.ok) return { providers: [], total: 0, hasMore: false };
    return res.json();
  } catch {
    return { providers: [], total: 0, hasMore: false };
  }
}

export default async function UstalarPage({ searchParams }) {
  const search = await searchParams;
  const city = search?.sehir ?? "";
  const kategori = search?.kategori ?? "";
  const q = search?.q ?? "";
  const sirala = search?.sirala ?? "";
  const minPuan = search?.minPuan ?? "";
  const fiyat = search?.fiyat ?? "";
  const sayfa = Number(search?.sayfa) || 1;

  const [categories, { providers, total, hasMore }] = await Promise.all([
    getCategories(),
    getProviders({ city, kategori, q, sirala, minPuan, fiyat, sayfa }),
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
        <h1 className="text-3xl font-extrabold sm:text-4xl">Usta Ara</h1>
        <p className="mt-3 max-w-2xl text-text-muted">
          Şehrine ve kategoriye göre ustaları listele, profilini incele, uygun bulduğuna talep
          oluşturup ücretsiz teklif al.
        </p>

        <div className="mt-8">
          <Filters
            city={city}
            kategori={kategori}
            q={q}
            sirala={sirala}
            minPuan={minPuan}
            fiyat={fiyat}
            categories={categories}
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-text-muted">
          <span>{total} usta bulundu</span>
          {city && kategori && providers.length > 0 && (
            <>
              ·
              <Link
                href={`/hizmet/${kategori}/${slugifyTr(city)}`}
                className="font-semibold text-primary hover:underline"
              >
                {city} {findCategoryBySlug(categories, kategori)?.name} Ustaları sayfasını gör
              </Link>
            </>
          )}
        </div>

        {providers.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              icon={<EmptyIcon name="offer" />}
              title="Usta bulunamadı"
              description="Filtreleri değiştirip tekrar dene, ya da doğrudan talep oluştur, uygun ustalar sana teklif versin."
            />
          </div>
        ) : (
          <>
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {providers.map((provider) => (
                <ProviderCard key={provider.id} provider={provider} />
              ))}
            </div>

            {(sayfa > 1 || hasMore) && (
              <div className="mt-8 flex items-center justify-center gap-3">
                {sayfa > 1 && (
                  <Link
                    href={buildPageHref({ city, kategori, q, sirala, minPuan, fiyat, sayfa: sayfa - 1 })}
                    className="rounded-md border border-border bg-surface px-4 py-2 text-sm font-semibold shadow-sm hover:border-primary"
                  >
                    ‹ Önceki
                  </Link>
                )}
                {hasMore && (
                  <Link
                    href={buildPageHref({ city, kategori, q, sirala, minPuan, fiyat, sayfa: sayfa + 1 })}
                    className="rounded-md border border-border bg-surface px-4 py-2 text-sm font-semibold shadow-sm hover:border-primary"
                  >
                    Sonraki ›
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </div>
      <SiteFooter />
    </div>
  );
}
