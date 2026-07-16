import { apiUrl } from "@/lib/api";
import { getSessionToken } from "@/lib/session";
import { AccountForm } from "./account-form";

async function getMe(token) {
  const res = await fetch(apiUrl("/auth/me"), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function ProfilPage() {
  const token = await getSessionToken();
  const user = await getMe(token);

  if (!user) {
    return <div className="text-sm text-text-muted">Kullanıcı bulunamadı.</div>;
  }

  return (
    <div className="max-w-md">
      <div className="mb-5">
        <div className="text-xl font-bold">Profilim</div>
        <div className="text-sm text-text-muted">
          {user.firstName} {user.lastName} · {user.phone}
        </div>
      </div>
      <div className="rounded-lg border border-border bg-surface p-5 shadow-sm">
        <AccountForm user={user} />
      </div>
    </div>
  );
}
