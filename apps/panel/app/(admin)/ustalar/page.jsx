import { redirect } from "next/navigation";
import Link from "next/link";
import { Badge } from "@tekliflercepte/ui";
import { apiUrl } from "@/lib/api";
import { getSessionUser, getSessionToken } from "@/lib/session";
import { ResetPasswordButton } from "../../reset-password-button";
import { VerifyIdentityButton } from "../../verify-identity-button";
import { TogglePremiumButton } from "../../toggle-premium-button";

async function getProviders(q, page) {
  const token = await getSessionToken();
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (page > 1) params.set("page", page);
  try {
    const res = await fetch(`${apiUrl("/admin/providers")}?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return { providers: [], total: 0, hasMore: false, error: true };
    return { ...(await res.json()), error: false };
  } catch {
    return { providers: [], total: 0, hasMore: false, error: true };
  }
}

export default async function UstalarPage({ searchParams }) {
  const user = await getSessionUser();
  if (user.role !== "ADMIN") redirect("/");

  const params = await searchParams;
  const q = params?.q ?? "";
  const page = Math.max(1, Number(params?.sayfa) || 1);
  const { providers, total, hasMore, error } = await getProviders(q, page);

  return (
    <div>
      <div className="mb-5">
        <div className="text-xl font-bold">Ustalar</div>
        <div className="text-sm text-text-muted">{total} usta</div>
      </div>

      <form className="mb-4" action="/ustalar">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="İsim veya telefon ara..."
          className="w-full max-w-sm rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm"
        />
      </form>

      {error ? (
        <div className="rounded-lg border border-danger/30 bg-danger/10 px-5 py-4 text-sm text-danger">
          Veriler yüklenemedi, tekrar dene.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-surface shadow-sm">
          <div className="grid min-w-[1020px] grid-cols-[1.2fr_0.9fr_0.7fr_0.6fr_1.3fr_0.9fr_0.9fr_0.9fr] border-b border-border px-5 py-3 text-xs font-bold uppercase tracking-wide text-text-muted">
            <div>Ad Soyad</div>
            <div>Şehir</div>
            <div>Puan</div>
            <div>Teklif</div>
            <div>Kategoriler</div>
            <div>Kimlik</div>
            <div>Premium</div>
            <div></div>
          </div>
          {providers.length === 0 ? (
            <div className="px-5 py-6 text-sm text-text-muted">Usta bulunamadı.</div>
          ) : (
            providers.map((provider) => (
              <div
                key={provider.id}
                className="grid min-w-[1020px] grid-cols-[1.2fr_0.9fr_0.7fr_0.6fr_1.3fr_0.9fr_0.9fr_0.9fr] items-center border-b border-border px-5 py-3.5 text-sm last:border-0"
              >
                <div>
                  {provider.firstName} {provider.lastName}
                </div>
                <div className="text-text-muted">
                  {provider.providerProfile
                    ? `${provider.providerProfile.city}${provider.providerProfile.district ? " / " + provider.providerProfile.district : ""}`
                    : "—"}
                </div>
                <div className="flex items-center gap-1">
                  {provider.providerProfile ? (
                    <>
                      {Number(provider.providerProfile.avgRating)}
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-warning">
                        <path d="M12 2.5l2.9 6.2 6.6.7-5 4.6 1.4 6.6L12 17.4l-5.9 3.2 1.4-6.6-5-4.6 6.6-.7L12 2.5Z" />
                      </svg>
                    </>
                  ) : (
                    "—"
                  )}
                </div>
                <div>{provider._count.offers}</div>
                <div className="flex flex-wrap gap-1">
                  {provider.providerProfile?.categories.length ? (
                    provider.providerProfile.categories.map(({ category }) => (
                      <Badge key={category.id} tone="brand">
                        {category.name}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-text-muted">Profil tamamlanmamış</span>
                  )}
                </div>
                <div>
                  {provider.providerProfile ? (
                    <VerifyIdentityButton
                      providerId={provider.id}
                      verified={Boolean(provider.providerProfile.identityVerifiedAt)}
                    />
                  ) : (
                    "—"
                  )}
                </div>
                <div>
                  {provider.providerProfile ? (
                    <TogglePremiumButton
                      providerId={provider.id}
                      isPremium={Boolean(provider.providerProfile.isPremium)}
                    />
                  ) : (
                    "—"
                  )}
                </div>
                <div>
                  <ResetPasswordButton userId={provider.id} />
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {(page > 1 || hasMore) && (
        <div className="mt-4 flex items-center justify-center gap-3">
          {page > 1 && (
            <Link
              href={`/ustalar?${new URLSearchParams({ ...(q ? { q } : {}), sayfa: String(page - 1) })}`}
              className="rounded-md border border-border bg-surface px-4 py-2 text-sm font-semibold shadow-sm"
            >
              ‹ Önceki
            </Link>
          )}
          {hasMore && (
            <Link
              href={`/ustalar?${new URLSearchParams({ ...(q ? { q } : {}), sayfa: String(page + 1) })}`}
              className="rounded-md border border-border bg-surface px-4 py-2 text-sm font-semibold shadow-sm"
            >
              Sonraki ›
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
