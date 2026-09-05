import { Badge } from "@tekliflercepte/ui";
import { apiUrl } from "@/lib/api";
import { getSessionToken } from "@/lib/session";
import { DocumentReviewButtons } from "../../document-review-buttons";

const TYPE_LABEL = { CERTIFICATE: "Sertifika / Diploma", INSURANCE: "Sigorta Poliçesi" };
const STATUS_TONE = { PENDING: "warning", APPROVED: "success", REJECTED: "neutral" };
const STATUS_LABEL = { PENDING: "İnceleniyor", APPROVED: "Onaylandı", REJECTED: "Reddedildi" };

async function getDocuments(status) {
  const token = await getSessionToken();
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  try {
    const res = await fetch(`${apiUrl("/admin/provider-documents")}?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return { documents: [], error: true };
    return { documents: await res.json(), error: false };
  } catch {
    return { documents: [], error: true };
  }
}

export default async function BelgelerPage({ searchParams }) {
  const params = await searchParams;
  const durum = params?.durum ?? "PENDING";
  const status = durum === "hepsi" ? undefined : durum;
  const { documents, error } = await getDocuments(status);
  const apiOrigin = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

  return (
    <div>
      <div className="mb-5">
        <div className="text-xl font-bold">Usta Belgeleri</div>
        <div className="text-sm text-text-muted">{documents.length} belge</div>
      </div>

      <div className="mb-4 flex gap-2 text-sm">
        {[
          { key: "PENDING", label: "İnceleniyor" },
          { key: "APPROVED", label: "Onaylandı" },
          { key: "REJECTED", label: "Reddedildi" },
          { key: "hepsi", label: "Hepsi" },
        ].map((tab) => (
          <a
            key={tab.key}
            href={`/belgeler?durum=${tab.key}`}
            className={`rounded-md px-3 py-1.5 ${
              durum === tab.key ? "bg-brand-100 font-semibold text-brand-700" : "text-text-muted hover:bg-surface-raised"
            }`}
          >
            {tab.label}
          </a>
        ))}
      </div>

      {error ? (
        <div className="rounded-lg border border-danger/30 bg-danger/10 px-5 py-4 text-sm text-danger">
          Veriler yüklenemedi, tekrar dene.
        </div>
      ) : documents.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface px-5 py-6 text-sm text-text-muted shadow-sm">
          Belge bulunamadı.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {documents.map((doc) => (
            <div key={doc.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface p-4 shadow-sm">
              <div>
                <div className="font-semibold">
                  {doc.providerProfile.user.firstName} {doc.providerProfile.user.lastName}
                </div>
                <div className="text-sm text-text-muted">
                  {TYPE_LABEL[doc.type]}
                  {doc.label ? ` · ${doc.label}` : ""}
                </div>
                <a
                  href={`${apiOrigin}${doc.fileUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-block text-sm font-semibold text-primary"
                >
                  Belgeyi görüntüle ↗
                </a>
                {doc.status === "REJECTED" && doc.reviewNote && (
                  <div className="mt-1 text-xs text-text-muted">Sebep: {doc.reviewNote}</div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Badge tone={STATUS_TONE[doc.status]}>{STATUS_LABEL[doc.status]}</Badge>
                {doc.status === "PENDING" && <DocumentReviewButtons documentId={doc.id} />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
