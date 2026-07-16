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

async function getReports() {
  const token = await getSessionToken();
  const res = await fetch(apiUrl("/admin/reports"), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function SikayetlerPage() {
  const reports = await getReports();

  return (
    <div>
      <div className="mb-5">
        <div className="text-xl font-bold">Şikayetler</div>
        <div className="text-sm text-text-muted">{reports.length} şikayet</div>
      </div>

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
    </div>
  );
}
