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

async function getOpenComplaintCount(token) {
  try {
    const res = await fetch(apiUrl("/admin/reports"), {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return 0;
    const reports = await res.json();
    return reports.filter((r) => r.status === "OPEN").length;
  } catch {
    return 0;
  }
}

export default async function AdminLayout({ children }) {
  const user = await getSessionUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "MODERATOR")) {
    redirect("/giris");
  }
  const token = await getSessionToken();
  const [pendingCount, openComplaintCount] = await Promise.all([
    getPendingCount(token),
    getOpenComplaintCount(token),
  ]);

  return (
    <div className="flex h-screen">
      <Sidebar pendingCount={pendingCount} openComplaintCount={openComplaintCount} role={user.role} />
      <main className="flex-1 overflow-auto px-6 py-5">{children}</main>
    </div>
  );
}
