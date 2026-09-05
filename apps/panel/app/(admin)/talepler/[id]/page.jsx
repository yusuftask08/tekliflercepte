import Link from "next/link";
import { Badge } from "@tekliflercepte/ui";
import { apiUrl } from "@/lib/api";
import { getSessionToken } from "@/lib/session";
import { CancelRequestButton } from "../../../cancel-request-button";
import { ResolveReportButton } from "../../../resolve-report-button";
import { REASON_LABEL } from "../../../report-reason-labels";

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

const OFFER_STATUS_LABEL = {
  PENDING: "Beklemede",
  SELECTED: "Seçildi",
  REJECTED: "Reddedildi",
  WITHDRAWN: "Geri Çekildi",
};

async function getRequest(id) {
  const token = await getSessionToken();
  const res = await fetch(apiUrl(`/admin/requests/${id}`), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function TalepDetayPage({ params }) {
  const { id } = await params;
  const request = await getRequest(id);
  const apiOrigin = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

  if (!request) {
    return <div className="text-sm text-text-muted">Talep bulunamadı.</div>;
  }

  const isCancelable = !["CLOSED", "CANCELLED", "REJECTED"].includes(request.status);
  const reports = request.offers.flatMap((offer) =>
    offer.reports.map((report) => ({ ...report, offerProviderName: `${offer.provider.firstName} ${offer.provider.lastName}` }))
  );

  return (
    <div>
      <Link href="/" className="mb-4 inline-block text-sm text-text-muted hover:text-primary">
        ← Talepler
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-border bg-surface p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="text-lg font-bold">{request.category?.name}</div>
            <Badge tone={STATUS_TONE[request.status]}>{STATUS_LABEL[request.status]}</Badge>
          </div>
          <div className="mt-1 text-sm text-text-muted">
            {request.customer?.firstName} {request.customer?.lastName} · {request.customer?.phone}
            {request.customer?.email ? ` · ${request.customer.email}` : ""}
          </div>
          <div className="mt-1 text-sm text-text-muted">
            {request.city}
            {request.district ? ` / ${request.district}` : ""} ·{" "}
            {new Date(request.createdAt).toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" })}
          </div>
        </div>
        {isCancelable && <CancelRequestButton requestId={request.id} />}
      </div>

      <div className="mt-4 rounded-lg border border-border bg-surface p-5 shadow-sm">
        <div className="mb-2 text-sm font-bold">Detay</div>
        <p className="text-sm">{request.details}</p>

        {request.answers && Object.keys(request.answers).length > 0 && (
          <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
            {Object.entries(request.answers).map(([key, value]) => (
              <div key={key} className="flex gap-1">
                <dt className="text-text-muted">{key}:</dt>
                <dd className="font-medium">{String(value)}</dd>
              </div>
            ))}
          </dl>
        )}

        {request.photos?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {request.photos.map((url) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={url}
                src={`${apiOrigin}${url}`}
                alt=""
                className="h-28 w-28 rounded-md border border-border object-cover"
              />
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 rounded-lg border border-border bg-surface p-5 shadow-sm">
        <div className="mb-3 text-sm font-bold">Teklifler ({request.offers.length})</div>
        {request.offers.length === 0 ? (
          <div className="text-sm text-text-muted">Henüz teklif yok.</div>
        ) : (
          <div className="flex flex-col gap-2">
            {request.offers.map((offer) => (
              <div
                key={offer.id}
                className="flex items-center justify-between rounded-md border border-border px-3.5 py-2.5 text-sm"
              >
                <div>
                  {offer.provider.firstName} {offer.provider.lastName}
                  <span className="ml-2 text-text-muted">{Number(offer.price)} ₺</span>
                </div>
                <Badge tone="neutral">{OFFER_STATUS_LABEL[offer.status]}</Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      {reports.length > 0 && (
        <div className="mt-4 rounded-lg border border-danger/30 bg-danger/5 p-5 shadow-sm">
          <div className="mb-3 text-sm font-bold text-danger">
            Bu talep hakkında açılan şikayetler ({reports.length})
          </div>
          <div className="flex flex-col gap-2">
            {reports.map((report) => (
              <div
                key={report.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm"
              >
                <div>
                  <span className="font-medium">
                    {report.reporter.firstName} {report.reporter.lastName}
                  </span>
                  <span className="text-text-muted">
                    {" "}
                    → {report.reportedUser.firstName} {report.reportedUser.lastName} · {REASON_LABEL[report.reason]}
                  </span>
                  {report.details && <div className="mt-0.5 text-xs text-text-muted">{report.details}</div>}
                  <div className="mt-0.5 text-xs text-text-muted">Teklif: {report.offerProviderName}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={report.status === "OPEN" ? "warning" : "success"}>
                    {report.status === "OPEN" ? "Açık" : "İncelendi"}
                  </Badge>
                  {report.status === "OPEN" && <ResolveReportButton reportId={report.id} />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
