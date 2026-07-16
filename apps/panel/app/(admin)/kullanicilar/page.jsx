import { apiUrl } from "@/lib/api";
import { getSessionToken } from "@/lib/session";
import { ResetPasswordButton } from "../../reset-password-button";

async function getUsers() {
  const token = await getSessionToken();
  const res = await fetch(apiUrl("/admin/users"), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function KullanicilarPage() {
  const users = await getUsers();

  return (
    <div>
      <div className="mb-5">
        <div className="text-xl font-bold">Kullanıcılar</div>
        <div className="text-sm text-text-muted">{users.length} müşteri</div>
      </div>

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
          users.map((user) => (
            <div
              key={user.id}
              className="grid grid-cols-[1.6fr_1.2fr_1fr_1fr_1fr] items-center border-b border-border px-5 py-3.5 text-sm last:border-0"
            >
              <div>
                {user.firstName} {user.lastName}
              </div>
              <div className="text-text-muted">{user.phone}</div>
              <div>{user._count.serviceRequests}</div>
              <div className="text-text-muted">
                {new Date(user.createdAt).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" })}
              </div>
              <div>
                <ResetPasswordButton userId={user.id} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
