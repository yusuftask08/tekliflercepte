import { redirect } from "next/navigation";
import Link from "next/link";
import { apiUrl } from "@/lib/api";
import { getSessionUser, getSessionToken } from "@/lib/session";

const ACTION_LABEL = {
  "request.approve": "Talep onaylandı",
  "request.reject": "Talep reddedildi",
  "request.cancel": "Talep iptal edildi",
  "report.resolve": "Şikayet çözüldü",
  "user.reset-password": "Şifre sıfırlandı",
  "provider.verify-identity": "Kimlik doğrulama değişti",
  "provider.toggle-premium": "Premium durumu değişti",
  "category.create": "Kategori eklendi",
  "category.update": "Kategori güncellendi",
  "category.delete": "Kategori silindi",
};

async function getAuditLog(token, page) {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", page);
  try {
    const res = await fetch(`${apiUrl("/admin/audit-log")}?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return { entries: [], total: 0, hasMore: false, error: true };
    return { ...(await res.json()), error: false };
  } catch {
    return { entries: [], total: 0, hasMore: false, error: true };
  }
}

export default async function AuditLogPage({ searchParams }) {
  const user = await getSessionUser();
  if (user.role !== "ADMIN") redirect("/");

  const params = await searchParams;
  const page = Math.max(1, Number(params?.sayfa) || 1);
  const token = await getSessionToken();
  const { entries, total, hasMore, error } = await getAuditLog(token, page);

  return (
    <div>
      <div className="mb-5">
        <div className="text-xl font-bold">İşlem Geçmişi</div>
        <div className="text-sm text-text-muted">{total} kayıt</div>
      </div>

      {error ? (
        <div className="rounded-lg border border-danger/30 bg-danger/10 px-5 py-4 text-sm text-danger">
          Veriler yüklenemedi, tekrar dene.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
          <div className="grid grid-cols-[1fr_1.4fr_1fr_1fr] border-b border-border px-5 py-3 text-xs font-bold uppercase tracking-wide text-text-muted">
            <div>Yönetici</div>
            <div>İşlem</div>
            <div>Hedef</div>
            <div>Tarih</div>
          </div>
          {entries.length === 0 ? (
            <div className="px-5 py-6 text-sm text-text-muted">Kayıt bulunamadı.</div>
          ) : (
            entries.map((entry) => (
              <div
                key={entry.id}
                className="grid grid-cols-[1fr_1.4fr_1fr_1fr] items-center border-b border-border px-5 py-3.5 text-sm last:border-0"
              >
                <div>{entry.admin ? `${entry.admin.firstName} ${entry.admin.lastName}` : "—"}</div>
                <div>{ACTION_LABEL[entry.action] ?? entry.action}</div>
                <div className="text-text-muted">{entry.targetId ? `${entry.targetType ?? ""} #${entry.targetId.slice(-6)}` : "—"}</div>
                <div className="text-text-muted">
                  {new Date(entry.createdAt).toLocaleString("tr-TR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {(page > 1 || hasMore) && (
        <div className="mt-4 flex items-center justify-center gap-3">
          {page > 1 && (
            <Link href={`/audit-log?sayfa=${page - 1}`} className="rounded-md border border-border bg-surface px-4 py-2 text-sm font-semibold shadow-sm">
              ‹ Önceki
            </Link>
          )}
          {hasMore && (
            <Link href={`/audit-log?sayfa=${page + 1}`} className="rounded-md border border-border bg-surface px-4 py-2 text-sm font-semibold shadow-sm">
              Sonraki ›
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
