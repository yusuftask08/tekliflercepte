import Link from "next/link";
import { redirect } from "next/navigation";
import { EmptyState } from "@tekliflercepte/ui";
import { SiteHeader } from "../site-header";
import { EmptyIcon } from "../empty-icons";
import { ProviderCard } from "../provider-card";
import { getSessionToken, getSessionUser } from "@/lib/session";
import { apiUrl } from "@/lib/api";

async function getFavorites(token) {
  const res = await fetch(apiUrl("/me/favorites"), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function FavorilerimPage() {
  const user = await getSessionUser();
  if (!user) redirect("/giris?next=/favorilerim");

  const token = await getSessionToken();
  const favorites = await getFavorites(token);

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <SiteHeader />
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
        <h1 className="text-3xl font-extrabold sm:text-4xl">Favori Ustalarım</h1>
        <p className="mt-3 max-w-2xl text-text-muted">
          Beğendiğin ustaları buradan takip et, ihtiyaç olduğunda kolayca ulaş.
        </p>

        {favorites.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              icon={<EmptyIcon name="offer" />}
              title="Henüz favori usta yok"
              description="Usta ara sayfasından beğendiğin ustaları favorilerine ekleyebilirsin."
              action={
                <Link href="/ustalar" className="text-sm font-semibold text-primary">
                  Usta Ara
                </Link>
              }
            />
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
