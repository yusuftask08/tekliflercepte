import Link from "next/link";
import { EmptyState } from "@tekliflercepte/ui";
import { SiteHeader } from "../site-header";
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

async function getProviders({ city, kategori, q }) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  const params = new URLSearchParams();
  if (city) params.set("city", city);
  if (kategori) params.set("kategori", kategori);
  if (q) params.set("q", q);
  try {
    const res = await fetch(`${apiUrl}/providers?${params.toString()}`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function UstalarPage({ searchParams }) {
  const search = await searchParams;
  const city = search?.sehir ?? "";
  const kategori = search?.kategori ?? "";
  const q = search?.q ?? "";

  const [categories, providers] = await Promise.all([
    getCategories(),
    getProviders({ city, kategori, q }),
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <SiteHeader />
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
        <h1 className="text-3xl font-extrabold sm:text-4xl">Usta Ara</h1>
        <p className="mt-3 max-w-2xl text-text-muted">
          Şehrine ve kategoriye göre ustaları listele, profilini incele, uygun bulduğuna talep
          oluşturup ücretsiz teklif al.
        </p>

        <div className="mt-8">
          <Filters city={city} kategori={kategori} q={q} categories={categories} />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-text-muted">
          <span>{providers.length} usta bulundu</span>
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
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {providers.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        )}
      </div>
      <SiteFooter />
    </div>
  );
}
