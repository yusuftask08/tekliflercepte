import Link from "next/link";
import { Avatar, Badge, Button, StarRating } from "@tekliflercepte/ui";
import { SiteHeader } from "../../site-header";
import { getSessionToken, getSessionUser } from "@/lib/session";
import { apiUrl } from "@/lib/api";
import { FavoriteButton } from "./favorite-button";
import { formatResponseTime } from "@/lib/trust";

async function getProvider(id) {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  const res = await fetch(`${base}/providers/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

async function getIsFavorited(id) {
  const token = await getSessionToken();
  if (!token) return false;
  const res = await fetch(apiUrl("/me/favorites"), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return false;
  const favorites = await res.json();
  return favorites.some((p) => p.id === id);
}

export default async function ProviderProfilePage({ params }) {
  const { id } = await params;
  const [provider, sessionUser] = await Promise.all([getProvider(id), getSessionUser()]);
  const isFavorited = sessionUser && sessionUser.id !== id ? await getIsFavorited(id) : false;

  if (!provider) {
    return (
      <div className="flex min-h-screen flex-col bg-bg">
        <SiteHeader />
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <p className="text-sm text-text-muted">Usta bulunamadı.</p>
          <Link href="/" className="mt-3 text-sm font-semibold text-primary">
            Ana sayfaya dön
          </Link>
        </div>
      </div>
    );
  }

  const profile = provider.providerProfile;
  const name = `${provider.firstName} ${provider.lastName}`;
  const memberSinceYear = profile ? new Date(profile.createdAt).getFullYear() : null;
  // "Mesaj Gönder" doesn't actually message this provider — there's no
  // cold-messaging path (Message is scoped to an Offer, which doesn't exist
  // yet). Best honest behavior: send them into the wizard pre-filled with
  // this provider's own category, so the request they create is one this
  // provider can actually respond to.
  const primaryCategorySlug = profile?.categories?.[0]?.category?.slug;
  const requestHref = primaryCategorySlug
    ? `/talep-olustur?kategori=${primaryCategorySlug}`
    : "/talep-olustur";

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <SiteHeader />
      <div className="h-[110px] w-full bg-brand-100 lg:h-[160px]" />

      <div className="mx-auto -mt-8 w-full max-w-5xl flex-1 px-4 pb-24 sm:px-6 lg:mt-0 lg:grid lg:grid-cols-[320px_1fr] lg:gap-10 lg:px-8 lg:py-10">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Avatar
            name={name}
            src={provider.avatarUrl ? `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}${provider.avatarUrl}` : null}
            size="lg"
          />
          <div className="mt-2.5 text-xl font-bold">{name}</div>
          {profile?.businessName && (
            <div className="text-sm text-text-muted">{profile.businessName}</div>
          )}
          {profile && !profile.isAvailable && (
            <div className="mb-2 mt-1">
              <Badge tone="warning">Molada — şu an yeni talep almıyor</Badge>
            </div>
          )}
          {profile?.city && (
            <div className="mb-2 flex items-center gap-1 text-xs text-text-muted">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 22s7-6.2 7-12A7 7 0 1 0 5 10c0 5.8 7 12 7 12Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
              {[profile.neighborhood, profile.district, profile.city].filter(Boolean).join(" / ")}
              {profile.serviceCities?.length > 0 && ` + ${profile.serviceCities.length} şehir daha`}
            </div>
          )}

          <div className="mb-3 flex flex-wrap gap-1.5">
            {profile?.categories?.map(({ category }) => (
              <Badge key={category.id} tone="brand">
                {category.name}
              </Badge>
            ))}
          </div>

          <div className="mb-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-warning">
              {Number(profile?.avgRating ?? 0).toFixed(1)}
            </span>
            <StarRating rating={Number(profile?.avgRating ?? 0)} size="lg" />
            <span className="text-xs text-text-muted">({profile?.reviewCount ?? 0} değerlendirme)</span>
          </div>

          <div className="mb-3 flex justify-around rounded-md border border-border bg-surface p-3 shadow-sm">
            <div className="text-center">
              <div className="text-base font-bold">{provider.completedJobsCount}</div>
              <div className="text-[10px] text-text-muted">iş tamamlandı</div>
            </div>
            <div className="text-center">
              <div className="text-base font-bold">{profile?.experienceYears ?? "-"} yıl</div>
              <div className="text-[10px] text-text-muted">deneyim</div>
            </div>
            <div className="text-center">
              <div className="text-base font-bold">{memberSinceYear ?? "-"}</div>
              <div className="text-[10px] text-text-muted">üye</div>
            </div>
          </div>

          {provider.trust?.offerCount > 0 && (
            <div className="mb-3 flex justify-around rounded-md border border-border bg-surface p-3 shadow-sm">
              {provider.trust.avgResponseMinutes != null && (
                <div className="text-center">
                  <div className="text-sm font-bold text-success">
                    {formatResponseTime(provider.trust.avgResponseMinutes)}
                  </div>
                  <div className="text-[10px] text-text-muted">ortalama yanıt</div>
                </div>
              )}
              {provider.trust.acceptanceRate != null && (
                <div className="text-center">
                  <div className="text-sm font-bold">%{provider.trust.acceptanceRate}</div>
                  <div className="text-[10px] text-text-muted">kabul oranı</div>
                </div>
              )}
            </div>
          )}

          {(provider.phoneVerifiedAt || profile?.identityVerifiedAt) && (
            <div className="mb-4 flex flex-wrap gap-1.5">
              {provider.phoneVerifiedAt && (
                <Badge tone="success" icon="check">
                  Telefon Doğrulandı
                </Badge>
              )}
              {profile?.identityVerifiedAt && (
                <Badge tone="success" icon="check">
                  Kimlik Doğrulandı
                </Badge>
              )}
            </div>
          )}

          {profile?.bio && (
            <p className="mb-4 text-sm leading-relaxed text-text-muted">{profile.bio}</p>
          )}

          {sessionUser && sessionUser.id !== id && (
            <div className="mb-3">
              <FavoriteButton providerId={id} initialFavorited={isFavorited} />
            </div>
          )}

          <Link href={requestHref} className="hidden lg:block">
            <Button className="w-full" size="lg">
              Bu Ustaya Teklif İste
            </Button>
          </Link>
        </aside>

        <div>
          {profile?.portfolioPhotos?.length > 0 && (
            <div className="mb-8">
              <div className="mb-2.5 font-bold">Geçmiş İşlerden</div>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {profile.portfolioPhotos.map((url) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={url}
                    src={`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}${url}`}
                    alt=""
                    className="aspect-square w-full rounded-md object-cover"
                  />
                ))}
              </div>
            </div>
          )}

          <div className="mb-2.5 font-bold">Değerlendirmeler ({provider.reviewsReceived.length})</div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:gap-3">
            {provider.reviewsReceived.map((review) => (
              <div key={review.id} className="rounded-md border border-border bg-surface p-3">
                <div className="flex justify-between text-xs font-semibold">
                  <span>
                    {review.author.firstName} {review.author.lastName[0]}.
                  </span>
                  <StarRating rating={review.rating} />
                </div>
                {review.comment && (
                  <div className="mt-1 text-xs text-text-muted">{review.comment}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 flex items-center gap-3 border-t border-border bg-surface px-4 py-3 lg:hidden">
        {provider.avgPrice != null && (
          <div>
            <div className="text-[10px] text-text-muted">Ortalama</div>
            <div className="font-bold">{Number(provider.avgPrice)} ₺</div>
          </div>
        )}
        <Link href={requestHref} className="flex-1">
          <Button className="w-full" size="lg">
            Bu Ustaya Teklif İste
          </Button>
        </Link>
      </div>
    </div>
  );
}
