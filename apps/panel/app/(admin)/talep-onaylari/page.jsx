import { apiUrl } from "@/lib/api";
import { getSessionToken } from "@/lib/session";
import { RequestApprovalList } from "./request-approval-list";

async function getPendingRequests() {
  const token = await getSessionToken();
  try {
    const res = await fetch(apiUrl("/requests?status=PENDING_REVIEW"), {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return { requests: [], error: true };
    return { requests: await res.json(), error: false };
  } catch {
    return { requests: [], error: true };
  }
}

export default async function TalepOnaylariPage() {
  const { requests, error } = await getPendingRequests();
  const apiOrigin = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

  return (
    <div>
      <div className="mb-5">
        <div className="text-xl font-bold">Talep Onayları</div>
        <div className="text-sm text-text-muted">{requests.length} talep onay bekliyor</div>
      </div>

      {error ? (
        <div className="rounded-lg border border-danger/30 bg-danger/10 px-5 py-4 text-sm text-danger">
          Veriler yüklenemedi, tekrar dene.
        </div>
      ) : requests.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface px-5 py-6 text-sm text-text-muted shadow-sm">
          Onay bekleyen talep yok.
        </div>
      ) : (
        <RequestApprovalList requests={requests} apiOrigin={apiOrigin} />
      )}
    </div>
  );
}
