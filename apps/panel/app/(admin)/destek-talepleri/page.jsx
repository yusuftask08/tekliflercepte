import { Badge } from "@tekliflercepte/ui";
import { apiUrl } from "@/lib/api";
import { getSessionToken } from "@/lib/session";
import { ResolveTicketButton } from "../../resolve-ticket-button";

async function getTickets(q) {
  const token = await getSessionToken();
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  try {
    const res = await fetch(`${apiUrl("/admin/support-tickets")}?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return { tickets: [], error: true };
    return { tickets: await res.json(), error: false };
  } catch {
    return { tickets: [], error: true };
  }
}

export default async function DestekTalepleriPage({ searchParams }) {
  const params = await searchParams;
  const q = params?.q ?? "";
  const { tickets, error } = await getTickets(q);

  return (
    <div>
      <div className="mb-5">
        <div className="text-xl font-bold">Destek Talepleri</div>
        <div className="text-sm text-text-muted">{tickets.length} talep</div>
      </div>

      <form className="mb-4" action="/destek-talepleri">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="İsim, e-posta veya konu ara..."
          className="w-full max-w-sm rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm"
        />
      </form>

      {error ? (
        <div className="rounded-lg border border-danger/30 bg-danger/10 px-5 py-4 text-sm text-danger">
          Veriler yüklenemedi, tekrar dene.
        </div>
      ) : tickets.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface px-5 py-6 text-sm text-text-muted shadow-sm">
          Destek talebi bulunamadı.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="rounded-lg border border-border bg-surface p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="font-semibold">{ticket.subject}</div>
                  <div className="text-sm text-text-muted">
                    {ticket.name} · {ticket.email}
                    {ticket.userId ? " · kayıtlı kullanıcı" : ""} ·{" "}
                    {new Date(ticket.createdAt).toLocaleDateString("tr-TR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={ticket.status === "OPEN" ? "warning" : "success"}>
                    {ticket.status === "OPEN" ? "Açık" : "Yanıtlandı"}
                  </Badge>
                  {ticket.status === "OPEN" && <ResolveTicketButton ticketId={ticket.id} />}
                </div>
              </div>
              <p className="mt-2 text-sm">{ticket.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
