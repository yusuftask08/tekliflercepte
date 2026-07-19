import { redirect } from "next/navigation";
import Link from "next/link";
import { apiUrl } from "@/lib/api";
import { getSessionUser, getSessionToken } from "@/lib/session";
import { ResetPasswordButton } from "../../reset-password-button";

async function getUsers(q, page) {
  const token = await getSessionToken();
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (page > 1) params.set("page", page);
  try {
    const res = await fetch(`${apiUrl("/admin/users")}?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return { users: [], total: 0, hasMore: false, error: true };
    return { ...(await res.json()), error: false };
  } catch {
    return { users: [], total: 0, hasMore: false, error: true };
  }
}

export default async function KullanicilarPage({ searchParams }) {
  const user = await getSessionUser();
  if (user.role !== "ADMIN") redirect("/");

  const params = await searchParams;
  const q = params?.q ?? "";
  const page = Math.max(1, Number(params?.sayfa) || 1);
  const { users, total, hasMore, error } = await getUsers(q, page);

  return (
    <div>
      <div className="mb-5">
        <div className="text-xl font-bold">Kullanıcılar</div>
        <div className="text-sm text-text-muted">{total} müşteri</div>
      </div>

      <form className="mb-4" action="/kullanicilar">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="İsim veya telefon ara..."
          className="w-full max-w-sm rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm"
        />
      </form>

      {error ? (
        <div className="rounded-lg border border-danger/30 bg-danger/10 px-5 py-4 text-sm text-danger">
          Veriler yüklenemedi, tekrar dene.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
          <div className="grid grid-cols-[1.6fr_1.2fr_1fr_1fr_1fr] border-b border-border px-5 py-3 text-xs font-bold uppercase tracking-wide text-text-muted">
            <div>Ad Soyad</div>
            <div>Telefon</div>
            <div>Talep Sayısı</div>
            <div>Kayıt Tarihi</div>
            <div></div>
          </div>
          {users.length === 0 ? (
            <div className="px-5 py-6 text-sm text-text-muted">Kullanıcı bulunamadı.</div>
          ) : (
            users.map((u) => (
              <div
                key={u.id}
                className="grid grid-cols-[1.6fr_1.2fr_1fr_1fr_1fr] items-center border-b border-border px-5 py-3.5 text-sm last:border-0"
              >
                <div>
                  {u.firstName} {u.lastName}
                </div>
                <div className="text-text-muted">{u.phone}</div>
                <div>{u._count.serviceRequests}</div>
                <div className="text-text-muted">
                  {new Date(u.createdAt).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" })}
                </div>
                <div>
                  <ResetPasswordButton userId={u.id} />
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {(page > 1 || hasMore) && (
        <div className="mt-4 flex items-center justify-center gap-3">
          {page > 1 && (
            <Link
              href={`/kullanicilar?${new URLSearchParams({ ...(q ? { q } : {}), sayfa: String(page - 1) })}`}
              className="rounded-md border border-border bg-surface px-4 py-2 text-sm font-semibold shadow-sm"
            >
              ‹ Önceki
            </Link>
          )}
          {hasMore && (
            <Link
              href={`/kullanicilar?${new URLSearchParams({ ...(q ? { q } : {}), sayfa: String(page + 1) })}`}
              className="rounded-md border border-border bg-surface px-4 py-2 text-sm font-semibold shadow-sm"
            >
              Sonraki ›
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
