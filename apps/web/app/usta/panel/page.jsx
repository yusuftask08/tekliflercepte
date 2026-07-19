import { redirect } from "next/navigation";
import Link from "next/link";
import { Badge, EmptyState } from "@tekliflercepte/ui";
import { EmptyIcon } from "../../empty-icons";
import { apiUrl } from "@/lib/api";
import { getSessionToken, getSessionUser } from "@/lib/session";
import { formatPrice } from "@/lib/price";
import { OfferForm } from "./offer-form";
import { WithdrawButton } from "./withdraw-button";
import { AvailabilityToggle } from "./availability-toggle";

const OFFER_STATUS_LABEL = {
  PENDING: "Beklemede",
  SELECTED: "Seçildi",
  REJECTED: "Reddedildi",
  WITHDRAWN: "Geri Çekildi",
};

const OFFER_STATUS_TONE = {
  PENDING: "info",
  SELECTED: "success",
  REJECTED: "neutral",
  WITHDRAWN: "neutral",
};

async function getJson(path, token) {
  const res = await fetch(apiUrl(path), {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

function buildQuestionLookup(categories) {
  const map = new Map();
  for (const group of categories) {
    for (const sub of group.children) {
      map.set(sub.id, sub.questions ?? group.questions ?? []);
    }
  }
  return map;
}

export default async function UstaPanelPage() {
  const user = await getSessionUser();
  if (!user) redirect("/giris?next=/usta/panel");
  if (user.role !== "PROVIDER") redirect("/hizmet-ver");

  const token = await getSessionToken();
  const profile = await getJson("/me/provider-profile", token);
  if (!profile) redirect("/usta/kurulum");

  const [matchingRequests, myOffers, categories] = await Promise.all([
    getJson("/me/matching-requests", token),
    getJson("/me/offers", token),
    getJson("/categories", null),
  ]);
  const questionLookup = buildQuestionLookup(categories ?? []);

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">Açık İşler</h1>
            <Link href="/profil" className="mt-1 inline-block text-sm font-semibold text-primary">
              Profilimi düzenle
            </Link>
          </div>
          <AvailabilityToggle isAvailable={profile.isAvailable} />
        </div>

        <section className="mt-8">
          <h2 className="text-lg font-bold">Sana Uygun Açık Talepler</h2>
          {!profile.isAvailable ? (
            <div className="mt-3">
              <EmptyState
                icon={<EmptyIcon name="clipboard" />}
                title="Molaya çıktın, yeni talep gelmiyor"
                description="Tekrar müsait olduğunda yukarıdaki düğmeye basman yeterli."
              />
            </div>
          ) : matchingRequests.length === 0 ? (
            <div className="mt-3">
              <EmptyState
                icon={<EmptyIcon name="clipboard" />}
                title="Şu an uygun açık talep yok"
                description="Kategorilerine ve bölgene uygun yeni bir talep geldiğinde burada görünecek."
              />
            </div>
          ) : (
            <div className="mt-4 flex flex-col gap-3">
              {matchingRequests.map((request) => {
                const questions = questionLookup.get(request.categoryId) ?? [];
                const answers = request.answers ?? {};
                return (
                  <div key={request.id} className="rounded-lg border border-border bg-surface p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold">{request.category?.name}</div>
                        <div className="mt-0.5 text-sm text-text-muted">
                          {request.city}
                          {request.district ? ` / ${request.district}` : ""} ·{" "}
                          {request.customer?.firstName} {request.customer?.lastName?.[0]}.
                        </div>
                      </div>
                    </div>

                    {questions.length > 0 && (
                      <dl className="mt-3 grid grid-cols-1 gap-1 text-xs sm:grid-cols-2">
                        {questions
                          .filter((q) => answers[q.id])
                          .map((q) => (
                            <div key={q.id} className="flex gap-1">
                              <dt className="text-text-muted">{q.label}:</dt>
                              <dd className="font-medium">{answers[q.id]}</dd>
                            </div>
                          ))}
                      </dl>
                    )}

                    <p className="mt-2 text-sm">{request.details}</p>
                    {request.budget && (
                      <p className="mt-1 text-xs text-text-muted">Bütçe: {request.budget}</p>
                    )}

                    {request.photos?.length > 0 && (
                      <div className="mt-3 flex gap-2">
                        {request.photos.map((url) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            key={url}
                            src={`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}${url}`}
                            alt=""
                            className="h-16 w-16 rounded-md object-cover"
                          />
                        ))}
                      </div>
                    )}

                    <div className="mt-3">
                      <OfferForm requestId={request.id} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-bold">Verdiğim Teklifler</h2>
          {myOffers.length === 0 ? (
            <div className="mt-3">
              <EmptyState icon={<EmptyIcon name="offer" />} title="Henüz teklif vermedin" />
            </div>
          ) : (
            <div className="mt-4 flex flex-col gap-2">
              {myOffers.map((offer) => (
                <div
                  key={offer.id}
                  className="flex flex-col gap-2.5 rounded-md border border-border bg-surface px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 truncate">
                    <span className="font-medium">{offer.serviceRequest.category?.name}</span>
                    <span className="ml-2 whitespace-nowrap text-text-muted">{formatPrice(offer.price)}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge tone={OFFER_STATUS_TONE[offer.status]}>
                      {OFFER_STATUS_LABEL[offer.status]}
                    </Badge>
                    {offer.status === "PENDING" && <WithdrawButton offerId={offer.id} />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
