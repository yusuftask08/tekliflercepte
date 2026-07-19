import { Badge } from "@tekliflercepte/ui";
import { apiUrl } from "@/lib/api";
import { getSessionToken } from "@/lib/session";
import { ResolveReportButton } from "../../resolve-report-button";

const REASON_LABEL = {
  HARASSMENT: "Taciz",
  SPAM: "Spam",
  FRAUD: "Dolandırıcılık",
  OTHER: "Diğer",
};

async function getReports(q) {
  const token = await getSessionToken();
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  try {
    const res = await fetch(`${apiUrl("/admin/reports")}?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return { reports: [], error: true };
    return { reports: await res.json(), error: false };
  } catch {
    return { reports: [], error: true };
  }
}

export default async function SikayetlerPage({ searchParams }) {
  const params = await searchParams;
  const q = params?.q ?? "";
  const { reports, error } = await getReports(q);

  return (
    <div>
      <div className="mb-5">
        <div className="text-xl font-bold">Şikayetler</div>
        <div className="text-sm text-text-muted">{reports.length} şikayet</div>
      </div>

      <form className="mb-4" action="/sikayetler">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Raporlayan veya raporlanan isim ara..."
          className="w-full max-w-sm rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm"
        />
      </form>

      {error ? (
        <div className="rounded-lg border border-danger/30 bg-danger/10 px-5 py-4 text-sm text-danger">
          Veriler yüklenemedi, tekrar dene.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-surface shadow-sm">
          <div className="grid min-w-[900px] grid-cols-[1fr_1fr_0.8fr_1.5fr_0.6fr_0.8fr] border-b border-border px-5 py-3 text-xs font-bold uppercase tracking-wide text-text-muted">
            <div>Raporlayan</div>
            <div>Raporlanan</div>
            <div>Sebep</div>
            <div>Detay</div>
            <div>Durum</div>
            <div></div>
          </div>
          {reports.length === 0 ? (
            <div className="px-5 py-6 text-sm text-text-muted">Şikayet bulunamadı.</div>
          ) : (
            reports.map((report) => (
              <div
                key={report.id}
                className="grid min-w-[900px] grid-cols-[1fr_1fr_0.8fr_1.5fr_0.6fr_0.8fr] items-center border-b border-border px-5 py-3.5 text-sm last:border-0"
              >
                <div>
                  {report.reporter.firstName} {report.reporter.lastName}
                </div>
                <div>
                  {report.reportedUser.firstName} {report.reportedUser.lastName}
                </div>
                <div>{REASON_LABEL[report.reason]}</div>
                <div className="text-text-muted">{report.details || "—"}</div>
                <div>
                  <Badge tone={report.status === "OPEN" ? "warning" : "success"}>
                    {report.status === "OPEN" ? "Açık" : "İncelendi"}
                  </Badge>
                </div>
                <div>{report.status === "OPEN" && <ResolveReportButton reportId={report.id} />}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
