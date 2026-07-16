import { redirect } from "next/navigation";
import Link from "next/link";
import { Badge, Button, EmptyState } from "@tekliflercepte/ui";
import { SiteHeader } from "../site-header";
import { apiUrl } from "@/lib/api";
import { getSessionToken, getSessionUser } from "@/lib/session";
import { EmptyIcon } from "../empty-icons";

const STATUS_LABEL = {
  PENDING_REVIEW: "İnceleniyor",
  OPEN: "Açık",
  OFFER_SELECTED: "Teklif Seçildi",
  CLOSED: "Kapalı",
  CANCELLED: "İptal",
  REJECTED: "Reddedildi",
};

const STATUS_TONE = {
  PENDING_REVIEW: "warning",
  OPEN: "info",
  OFFER_SELECTED: "success",
  CLOSED: "neutral",
  CANCELLED: "neutral",
  REJECTED: "neutral",
};

async function getMyRequests(token) {
  const res = await fetch(apiUrl("/me/requests"), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function TaleplerimPage() {
  const user = await getSessionUser();
  if (!user) redirect("/giris?next=/taleplerim");

  const token = await getSessionToken();
  const requests = await getMyRequests(token);

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <SiteHeader />
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <h1 className="text-2xl font-bold sm:text-3xl">Taleplerim</h1>

        {requests.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              icon={<EmptyIcon name="clipboard" />}
              title="Henüz talebin yok"
              description="İhtiyacın olan hizmeti anlat, ustalar sana ücretsiz teklif göndersin."
              action={
                <Link href="/talep-olustur">
                  <Button size="md">Talep Oluştur</Button>
                </Link>
              }
            />
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-3">
            {requests.map((request) => (
              <Link
                key={request.id}
                href={`/taleplerim/${request.id}`}
                className="flex items-center justify-between rounded-lg border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <div>
                  <div className="font-semibold">{request.category?.name}</div>
                  <div className="mt-0.5 text-sm text-text-muted">
                    {request.city}
                    {request.district ? ` / ${request.district}` : ""} ·{" "}
                    {new Date(request.createdAt).toLocaleDateString("tr-TR", {
                      day: "numeric",
                      month: "long",
                    })}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-text-muted">{request.offers.length} teklif</span>
                  <Badge tone={STATUS_TONE[request.status]}>{STATUS_LABEL[request.status]}</Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
