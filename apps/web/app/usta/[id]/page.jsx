import Link from "next/link";
import { Avatar, Badge, Button, StarRating } from "@tekliflercepte/ui";
import { getSessionToken, getSessionUser } from "@/lib/session";
import { apiUrl } from "@/lib/api";
import { FavoriteButton } from "./favorite-button";
import { PortfolioGallery } from "./portfolio-gallery";
import { formatResponseTime } from "@/lib/trust";
import { formatPrice } from "@/lib/price";
import { displayName } from "@/lib/name";

const REVIEW_SORTS = [
  { value: "", label: "En Yeni" },
  { value: "puan-yuksek", label: "En Yüksek Puan" },
  { value: "puan-dusuk", label: "En Düşük Puan" },
];

function buildReviewHref(id, { reviewSirala, reviewSayfa }) {
  const params = new URLSearchParams();
  if (reviewSirala) params.set("reviewSirala", reviewSirala);
  if (reviewSayfa > 1) params.set("reviewSayfa", String(reviewSayfa));
  return `/usta/${id}${params.toString() ? `?${params.toString()}` : ""}`;
}

async function getProvider(id, { reviewSayfa, reviewSirala } = {}) {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  const params = new URLSearchParams();
  if (reviewSayfa) params.set("reviewSayfa", reviewSayfa);
  if (reviewSirala) params.set("reviewSirala", reviewSirala);
  const qs = params.toString();
  const res = await fetch(`${base}/providers/${id}${qs ? `?${qs}` : ""}`, { cache: "no-store" });
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

// generateMetadata and the page component below both call getProvider(id)
// — accepted duplicate fetch (same tradeoff as hizmet/[kategori]/[sehir]),
// no shared cache since requests use { cache: "no-store" }.
export async function generateMetadata({ params }) {
  const { id } = await params;
  const provider = await getProvider(id);
  const profile = provider?.providerProfile;
  if (!provider || !profile) {
    return { robots: { index: false, follow: true } };
  }

  const name = displayName(provider);
  const categoryName = profile.categories?.[0]?.category?.name;
  const title = categoryName
    ? `${name} — ${categoryName} Ustası, ${profile.city}`
    : `${name} — Usta Profili, ${profile.city}`;
  const ratingText =
    profile.reviewCount > 0
      ? `${Number(profile.avgRating).toFixed(1)} puan (${profile.reviewCount} değerlendirme)`
      : "Yeni üye";
  const description = `${name}, ${profile.city}'de ${
    categoryName ? categoryName.toLocaleLowerCase("tr") : "hizmet"
  } veriyor. ${ratingText}. Profilini incele, ücretsiz teklif al.`;

  return {
    title,
    description,
    robots: profile.isAvailable ? undefined : { index: false, follow: true },
  };
}

export default async function ProviderProfilePage({ params, searchParams }) {
  const { id } = await params;
  const search = await searchParams;
  const reviewSayfa = Number(search?.reviewSayfa) || 1;
  const reviewSirala = search?.reviewSirala ?? "";
  const [provider, sessionUser] = await Promise.all([
    getProvider(id, { reviewSayfa, reviewSirala }),
    getSessionUser(),
  ]);
  const isFavorited = sessionUser && sessionUser.id !== id ? await getIsFavorited(id) : false;

  if (!provider) {
    return (
      <div className="flex min-h-screen flex-col bg-bg">
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
  const name = displayName(provider);
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
  const apiOrigin = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

  // Real data only — no fabricated ratings/reviews. aggregateRating/review
  // are omitted entirely when there's nothing to report yet.
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        name,
        ...(provider.avatarUrl ? { image: `${apiOrigin}${provider.avatarUrl}` } : {}),
        ...(profile?.bio ? { description: profile.bio } : {}),
        ...(profile?.categories?.[0]?.category?.name
          ? { jobTitle: profile.categories[0].category.name }
          : {}),
        ...(profile?.city
          ? { address: { "@type": "PostalAddress", addressLocality: profile.city, addressCountry: "TR" } }
          : {}),
        ...(profile?.reviewCount > 0
          ? {
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: Number(profile.avgRating),
                reviewCount: profile.reviewCount,
              },
              review: provider.reviewsReceived.slice(0, 10).map((r) => ({
                "@type": "Review",
                author: { "@type": "Person", name: displayName(r.author) },
                reviewRating: { "@type": "Rating", ratingValue: r.rating },
                ...(r.comment ? { reviewBody: r.comment } : {}),
              })),
            }
          : {}),
      },
    ],
  };

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <script
        type="application/ld+json"
        // Unlike app/page.jsx's static JSON_LD, this embeds user-authored
        // text (bio, review comments) — escape "<" so a bio/comment
        // containing "</script>" can't break out of the tag.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <div className="h-[110px] w-full bg-brand-100 lg:h-[160px]" />

      <div className="mx-auto -mt-8 w-full max-w-5xl flex-1 px-4 pb-40 sm:px-6 lg:mt-0 lg:grid lg:grid-cols-[320px_1fr] lg:gap-10 lg:px-8 lg:py-10 lg:pb-10">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Avatar
            name={name}
            src={provider.avatarUrl ? `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}${provider.avatarUrl}` : null}
            size="lg"
          />
          <div className="mt-2.5 flex items-center gap-1.5 text-xl font-bold">
            {name}
            {profile?.isPremium && (
              <Badge tone="warning" icon="star">
                Öne Çıkan
              </Badge>
            )}
          </div>
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
            <PortfolioGallery photoUrls={profile.portfolioPhotos.map((url) => `${apiOrigin}${url}`)} />
          )}

          <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
            <span className="font-bold">Değerlendirmeler ({provider.reviewTotal})</span>
            {provider.reviewTotal > 1 && (
              <div className="flex items-center gap-3 text-xs">
                {REVIEW_SORTS.map((s) => (
                  <Link
                    key={s.value}
                    href={buildReviewHref(id, { reviewSirala: s.value, reviewSayfa: 1 })}
                    className={
                      (reviewSirala || "") === s.value
                        ? "font-semibold text-primary"
                        : "text-text-muted hover:text-text"
                    }
                  >
                    {s.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:gap-3">
            {provider.reviewsReceived.map((review) => (
              <div key={review.id} className="rounded-md border border-border bg-surface p-3">
                <div className="flex justify-between text-xs font-semibold">
                  <span>{displayName(review.author)}</span>
                  <StarRating rating={review.rating} />
                </div>
                {review.comment && (
                  <div className="mt-1 text-xs text-text-muted">{review.comment}</div>
                )}
              </div>
            ))}
          </div>

          {(reviewSayfa > 1 || provider.reviewHasMore) && (
            <div className="mt-4 flex items-center justify-center gap-3">
              {reviewSayfa > 1 && (
                <Link
                  href={buildReviewHref(id, { reviewSirala, reviewSayfa: reviewSayfa - 1 })}
                  className="rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-semibold shadow-sm hover:border-primary"
                >
                  ‹ Önceki
                </Link>
              )}
              {provider.reviewHasMore && (
                <Link
                  href={buildReviewHref(id, { reviewSirala, reviewSayfa: reviewSayfa + 1 })}
                  className="rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-semibold shadow-sm hover:border-primary"
                >
                  Sonraki ›
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="sticky bottom-24 z-actionbar flex items-center gap-3 border-t border-border bg-surface px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] lg:hidden">
        {provider.avgPrice != null && (
          <div>
            <div className="text-[10px] text-text-muted">Ortalama</div>
            <div className="font-bold">{formatPrice(provider.avgPrice)}</div>
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
