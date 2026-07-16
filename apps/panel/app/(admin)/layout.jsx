import { redirect } from "next/navigation";
import { getSessionUser, getSessionToken } from "@/lib/session";
import { apiUrl } from "@/lib/api";
import { Sidebar } from "../sidebar";

async function getPendingCount(token) {
  try {
    const res = await fetch(apiUrl("/requests?status=PENDING_REVIEW"), {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return 0;
    const requests = await res.json();
    return requests.length;
  } catch {
    return 0;
  }
}

export default async function AdminLayout({ children }) {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/giris");
  }
  const token = await getSessionToken();
  const pendingCount = await getPendingCount(token);

  return (
    <div className="flex h-screen">
      <Sidebar pendingCount={pendingCount} />
      <main className="flex-1 overflow-auto px-6 py-5">{children}</main>
    </div>
  );
}
