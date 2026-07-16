import { apiUrl } from "@/lib/api";
import { getSessionToken } from "@/lib/session";

async function getStats() {
  const token = await getSessionToken();
  const res = await fetch(apiUrl("/admin/stats"), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

const STATUS_LABEL = {
  OPEN: "Açık",
  OFFER_SELECTED: "Teklif Seçildi",
  CLOSED: "Kapalı",
  CANCELLED: "İptal",
};

function StatCard({ label, value }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-5 shadow-sm">
      <div className="text-2xl font-extrabold">{value}</div>
      <div className="mt-1 text-sm text-text-muted">{label}</div>
    </div>
  );
}

export default async function RaporlarPage() {
  const stats = await getStats();

  if (!stats) {
    return <div className="text-sm text-text-muted">İstatistikler yüklenemedi.</div>;
  }

  const totalRequests = Object.values(stats.requestsByStatus).reduce((a, b) => a + b, 0);

  return (
    <div>
      <div className="mb-5 text-xl font-bold">Raporlar</div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Müşteri" value={stats.customerCount} />
        <StatCard label="Usta" value={stats.providerCount} />
        <StatCard label="Toplam Teklif" value={stats.offerCount} />
        <StatCard label="Değerlendirme" value={stats.reviewCount} />
      </div>

      <div className="mt-8">
        <div className="mb-3 text-sm font-bold">Talep Durumları ({totalRequests} toplam)</div>
        <div className="flex flex-col gap-2">
          {Object.entries(STATUS_LABEL).map(([status, label]) => {
            const count = stats.requestsByStatus[status] ?? 0;
            const pct = totalRequests ? Math.round((count / totalRequests) * 100) : 0;
            return (
              <div key={status} className="flex items-center gap-3">
                <div className="w-32 text-sm text-text-muted">{label}</div>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-border">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                </div>
                <div className="w-10 text-right text-sm font-semibold">{count}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
