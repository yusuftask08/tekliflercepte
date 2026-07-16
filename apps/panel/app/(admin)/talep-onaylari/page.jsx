import { apiUrl } from "@/lib/api";
import { getSessionToken } from "@/lib/session";
import { RequestModerationActions } from "../../request-moderation-actions";

async function getPendingRequests() {
  const token = await getSessionToken();
  const res = await fetch(apiUrl("/requests?status=PENDING_REVIEW"), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function TalepOnaylariPage() {
  const requests = await getPendingRequests();
  const apiOrigin = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

  return (
    <div>
      <div className="mb-5">
        <div className="text-xl font-bold">Talep Onayları</div>
        <div className="text-sm text-text-muted">{requests.length} talep onay bekliyor</div>
      </div>

      {requests.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface px-5 py-6 text-sm text-text-muted shadow-sm">
          Onay bekleyen talep yok.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {requests.map((request) => (
            <div key={request.id} className="rounded-lg border border-border bg-surface p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">
                    {request.customer?.firstName} {request.customer?.lastName} · {request.category?.name}
                  </div>
                  <div className="mt-0.5 text-sm text-text-muted">
                    {request.city}
                    {request.district ? ` / ${request.district}` : ""} ·{" "}
                    {new Date(request.createdAt).toLocaleDateString("tr-TR", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </div>
                </div>
                <RequestModerationActions requestId={request.id} />
              </div>

              <p className="mt-3 text-sm">{request.details}</p>

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
          ))}
        </div>
      )}
    </div>
  );
}
