import Link from "next/link";
import { notFound } from "next/navigation";
import { EmptyState } from "@tekliflercepte/ui";
import { SiteFooter } from "../../../site-footer";
import { EmptyIcon } from "../../../empty-icons";
import { ProviderCard } from "../../../provider-card";
import { findCityBySlug, slugifyTr } from "../../../../lib/turkey-locations";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tekliflercepte.com";

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

async function getProviders(city, kategori) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  const params = new URLSearchParams({ city, kategori });
  try {
    const res = await fetch(`${apiUrl}/providers?${params.toString()}`, { cache: "no-store" });
    if (!res.ok) return { providers: [], total: 0 };
    return res.json();
  } catch {
    return { providers: [], total: 0 };
  }
}

async function resolveParams(params) {
  const { kategori: kategoriSlug, sehir: sehirSlug } = await params;
  const city = findCityBySlug(sehirSlug);
  const categories = await getCategories();
  const category = findCategoryBySlug(categories, kategoriSlug);
  return { city, category };
}

export async function generateMetadata({ params }) {
  const { city, category } = await resolveParams(params);
  if (!city || !category) return {};

  const { providers, total } = await getProviders(city.name, category.slug);
  const title = `${city.name} ${category.name} Ustaları — Ücretsiz Teklif Al`;
  const description = `${city.name}'de ${category.name.toLocaleLowerCase("tr")} hizmeti veren ${total} usta. Profilleri incele, ücretsiz teklif al, komisyon yok.`;

  return {
    title,
    description,
    alternates: { canonical: `/hizmet/${category.slug}/${slugifyTr(city.name)}` },
    robots: providers.length > 0 ? undefined : { index: false, follow: true },
  };
}

export default async function HizmetSehirPage({ params }) {
  const { city, category } = await resolveParams(params);
  if (!city || !category) notFound();

  const { providers, total } = await getProviders(city.name, category.slug);

  // Static, server-controlled fields only (category/city names come from our
  // own taxonomy + a fixed city list, never free-text user input) — safe to
  // interpolate directly.
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Kategoriler", item: `${SITE_URL}/kategoriler` },
          {
            "@type": "ListItem",
            position: 2,
            name: category.name,
            item: `${SITE_URL}/ustalar?kategori=${category.slug}`,
          },
          { "@type": "ListItem", position: 3, name: city.name },
        ],
      },
      {
        "@type": "Service",
        serviceType: category.name,
        areaServed: { "@type": "City", name: city.name },
        provider: { "@type": "Organization", name: "Teklifler Cepte" },
        url: `${SITE_URL}/hizmet/${category.slug}/${slugifyTr(city.name)}`,
      },
    ],
  };

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
        <nav className="mb-4 text-xs text-text-muted">
          <Link href="/kategoriler" className="hover:text-primary">
            Kategoriler
          </Link>
          {" / "}
          <Link href={`/ustalar?kategori=${category.slug}`} className="hover:text-primary">
            {category.name}
          </Link>
          {" / "}
          <span>{city.name}</span>
        </nav>

        <h1 className="text-3xl font-extrabold sm:text-4xl">
          {city.name} {category.name} Ustaları
        </h1>
        <p className="mt-3 max-w-2xl text-text-muted">
          {city.name} bölgesinde {category.name.toLocaleLowerCase("tr")} ihtiyacın için Teklifler
          Cepte&apos;de kayıtlı ustaları inceleyebilir, profillerini karşılaştırabilir ve tamamen
          ücretsiz teklif alabilirsin — komisyon ya da teklif ücreti yok. Aşağıda {city.name}
          &apos;de {category.name.toLocaleLowerCase("tr")} hizmeti veren {total} usta
          listeleniyor.
        </p>

        {providers.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              icon={<EmptyIcon name="offer" />}
              title={`${city.name}'de henüz ${category.name.toLocaleLowerCase("tr")} ustası yok`}
              description="Bu bölgede ilk usta sen ol, ya da doğrudan talep oluştur, yakındaki ustalar sana teklif versin."
              action={
                <div className="flex gap-3">
                  <Link href="/hizmet-ver" className="text-sm font-semibold text-primary">
                    Usta Olarak Katıl
                  </Link>
                  <Link href="/ustalar" className="text-sm font-semibold text-primary">
                    Tüm Ustalar
                  </Link>
                </div>
              }
            />
          </div>
        ) : (
          <>
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {providers.map((provider) => (
                <ProviderCard key={provider.id} provider={provider} />
              ))}
            </div>
            {total > providers.length && (
              <div className="mt-6 text-center">
                <Link
                  href={`/ustalar?kategori=${category.slug}&sehir=${city.name}`}
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  Kalan {total - providers.length} ustayı gör →
                </Link>
              </div>
            )}
          </>
        )}
      </div>
      <SiteFooter />
    </div>
  );
}
