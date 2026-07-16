import Link from "next/link";
import { Badge } from "@tekliflercepte/ui";
import { apiUrl } from "@/lib/api";
import { getSessionToken } from "@/lib/session";

const FILTERS = [
  { label: "Tümü", status: null },
  { label: "İnceleniyor", status: "PENDING_REVIEW" },
  { label: "Açık", status: "OPEN" },
  { label: "Teklif Seçildi", status: "OFFER_SELECTED" },
  { label: "Kapalı", status: "CLOSED" },
];

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

async function getRequests(status) {
  const url = new URL(apiUrl("/requests"));
  if (status) url.searchParams.set("status", status);
  const token = await getSessionToken();
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function PanelHome({ searchParams }) {
  const params = await searchParams;
  const activeStatus = params?.durum ?? null;
  const requests = await getRequests(activeStatus);

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <div className="text-xl font-bold">Talepler</div>
          <div className="text-sm text-text-muted">{requests.length} talep</div>
        </div>
        <div className="flex gap-2">
          {FILTERS.map((filter) => {
            const isActive = activeStatus === filter.status;
            const href = filter.status ? `/?durum=${filter.status}` : "/";
            return (
              <Link
                key={filter.label}
                href={href}
                className={`rounded-md px-4 py-2 text-sm font-semibold ${
                  isActive ? "bg-primary text-text-on-brand" : "border border-border text-text-muted"
                }`}
              >
                {filter.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
        <div className="grid grid-cols-[1fr_1.6fr_1.4fr_1.2fr_1fr_1fr_0.6fr] border-b border-border px-5 py-3 text-xs font-bold uppercase tracking-wide text-text-muted">
          <div>Talep ID</div>
          <div>Müşteri</div>
          <div>Kategori</div>
          <div>Durum</div>
          <div>Teklif</div>
          <div>Tarih</div>
          <div />
        </div>
        {requests.length === 0 ? (
          <div className="px-5 py-6 text-sm text-text-muted">Talep bulunamadı.</div>
        ) : (
          requests.map((request) => (
            <Link
              key={request.id}
              href={`/talepler/${request.id}`}
              className="grid grid-cols-[1fr_1.6fr_1.4fr_1.2fr_1fr_1fr_0.6fr] items-center border-b border-border px-5 py-3.5 text-sm last:border-0 hover:bg-surface-raised"
            >
              <div className="text-text-muted">#{request.id.slice(-4)}</div>
              <div>
                {request.customer?.firstName} {request.customer?.lastName}
              </div>
              <div>{request.category?.name}</div>
              <div>
                <Badge tone={STATUS_TONE[request.status]}>{STATUS_LABEL[request.status]}</Badge>
              </div>
              <div>{request.offers.length} teklif</div>
              <div>
                {new Date(request.createdAt).toLocaleDateString("tr-TR", { day: "2-digit", month: "short" })}
              </div>
              <div className="text-text-muted">›</div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
