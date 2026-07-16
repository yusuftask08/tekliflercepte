import Link from "next/link";
import { notFound } from "next/navigation";
import { EmptyState } from "@tekliflercepte/ui";
import { SiteHeader } from "../../../site-header";
import { SiteFooter } from "../../../site-footer";
import { EmptyIcon } from "../../../empty-icons";
import { ProviderCard } from "../../../provider-card";
import { findCityBySlug } from "../../../../lib/turkey-locations";

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
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
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

  const providers = await getProviders(city.name, category.slug);
  const title = `${city.name} ${category.name} Ustaları — Ücretsiz Teklif Al | Teklifler Cepte`;
  const description = `${city.name}'de ${category.name.toLocaleLowerCase("tr")} hizmeti veren ${providers.length} usta. Profilleri incele, ücretsiz teklif al, komisyon yok.`;

  return {
    title,
    description,
    robots: providers.length > 0 ? undefined : { index: false, follow: true },
  };
}

export default async function HizmetSehirPage({ params }) {
  const { city, category } = await resolveParams(params);
  if (!city || !category) notFound();

  const providers = await getProviders(city.name, category.slug);

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <SiteHeader />
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
          &apos;de {category.name.toLocaleLowerCase("tr")} hizmeti veren {providers.length} usta
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
