import Link from "next/link";
import { redirect } from "next/navigation";
import { EmptyState } from "@tekliflercepte/ui";
import { EmptyIcon } from "../empty-icons";
import { ProviderCard } from "../provider-card";
import { getSessionToken, getSessionUser } from "@/lib/session";
import { apiUrl } from "@/lib/api";
import { AccountShell } from "../account-shell";

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
    <AccountShell
      user={user}
      title="Favori Ustalarım"
      description="Beğendiğin ustaları buradan takip et, ihtiyaç olduğunda kolayca ulaş."
    >

        {favorites.length === 0 ? (
          <div>
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        )}
    </AccountShell>
  );
}
