import Link from "next/link";
import { Badge, EmptyState } from "@tekliflercepte/ui";
import { EmptyIcon } from "../../empty-icons";
import { OfferCard } from "./offer-card";
import { ReviewForm } from "./review-form";
import { CancelButton } from "./cancel-button";
import { SortSelect } from "./sort-select";
import { SORT_OPTIONS } from "./sort-options";

function sortOffers(offers, sortKey) {
  const sorted = [...offers];
  if (sortKey === "fiyat-artan") return sorted.sort((a, b) => Number(a.price) - Number(b.price));
  if (sortKey === "fiyat-azalan") return sorted.sort((a, b) => Number(b.price) - Number(a.price));
  if (sortKey === "puan") {
    return sorted.sort(
      (a, b) =>
        Number(b.provider.providerProfile?.avgRating ?? 0) -
        Number(a.provider.providerProfile?.avgRating ?? 0)
    );
  }
  return sorted;
}

async function getRequest(id) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  const res = await fetch(`${apiUrl}/requests/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export default async function OffersInboxPage({ params, searchParams }) {
  const { id } = await params;
  const search = await searchParams;
  const sortKey = SORT_OPTIONS.some((o) => o.key === search?.sirala) ? search.sirala : "yeni";
  const request = await getRequest(id);

  if (!request) {
    return (
      <div className="flex min-h-screen flex-col bg-bg">
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <p className="text-sm text-text-muted">Talep bulunamadı.</p>
          <Link href="/" className="mt-3 text-sm font-semibold text-primary">
            Ana sayfaya dön
          </Link>
        </div>
      </div>
    );
  }

  const date = new Date(request.createdAt).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
  });
  const offers = sortOffers(request.offers, sortKey);

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-lg font-bold sm:text-2xl">{request.category?.name} Talebi</div>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-sm text-text-muted">
                {request.city}
                {request.district ? ` / ${request.district}` : ""} · {date}
              </span>
              <Badge tone="brand">{request.offers.length} teklif geldi</Badge>
            </div>
            {request.status === "OPEN" && (
              <div className="mt-3">
                <CancelButton requestId={request.id} />
              </div>
            )}
          </div>

          {offers.length > 1 && <SortSelect value={sortKey} />}
        </div>

        {offers.length === 0 ? (
          <EmptyState
            icon={<EmptyIcon name="offer" />}
            title={request.status === "PENDING_REVIEW" ? "Talebin inceleniyor" : "Henüz teklif gelmedi"}
            description={
              request.status === "PENDING_REVIEW"
                ? "Talebin onaylandığında ustalara gönderilecek."
                : "Kategorine uygun ustalar talebini inceliyor, teklif geldiğinde burada göreceksin."
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {offers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} requestClosed={request.status !== "OPEN"} />
            ))}
          </div>
        )}

        {request.status === "OFFER_SELECTED" && !request.review && (
          <div className="mt-6">
            <ReviewForm requestId={request.id} />
          </div>
        )}
      </div>
    </div>
  );
}
