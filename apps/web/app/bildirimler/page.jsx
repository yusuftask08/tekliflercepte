import { redirect } from "next/navigation";
import Link from "next/link";
import { EmptyState } from "@tekliflercepte/ui";
import { SiteHeader } from "../site-header";
import { apiUrl } from "@/lib/api";
import { getSessionToken, getSessionUser } from "@/lib/session";
import { EmptyIcon } from "../empty-icons";

const TYPE_ICON = {
  REQUEST_APPROVED: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  NEW_MATCHING_REQUEST: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M6 3h12v18l-6-4-6 4V3Z" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  NEW_OFFER: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 2v20M17 6H9.5a3 3 0 0 0 0 6h5a3 3 0 0 1 0 6H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  NEW_MESSAGE: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M4 5h16v11H8l-4 4V5Z" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
};

const TYPE_TONE = {
  REQUEST_APPROVED: "bg-success/10 text-success",
  NEW_MATCHING_REQUEST: "bg-brand-100 text-brand-600",
  NEW_OFFER: "bg-brand-100 text-brand-600",
  NEW_MESSAGE: "bg-info/10 text-info",
};

async function getNotifications(token) {
  const res = await fetch(apiUrl("/me/notifications"), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function BildirimlerPage() {
  const user = await getSessionUser();
  if (!user) redirect("/giris?next=/bildirimler");

  const token = await getSessionToken();
  const notifications = await getNotifications(token);

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <SiteHeader />
      <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
        <h1 className="text-2xl font-bold sm:text-3xl">Bildirimler</h1>

        {notifications.length === 0 ? (
          <div className="mt-8">
            <EmptyState icon={<EmptyIcon name="offer" />} title="Henüz bildirimin yok" />
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-2">
            {notifications.map((notification) => (
              <Link
                key={notification.id}
                href={notification.link ?? "#"}
                className={`flex items-start gap-3 rounded-md border border-border p-4 shadow-sm transition-shadow hover:shadow-md ${
                  notification.readAt ? "bg-surface" : "bg-brand-50"
                }`}
              >
                <span
                  className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${TYPE_TONE[notification.type] ?? "bg-surface-raised text-text-muted"}`}
                >
                  {TYPE_ICON[notification.type]}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold">{notification.title}</div>
                  {notification.body && (
                    <div className="mt-0.5 truncate text-sm text-text-muted">{notification.body}</div>
                  )}
                  <div className="mt-1 text-xs text-text-muted">
                    {new Date(notification.createdAt).toLocaleDateString("tr-TR", {
                      day: "numeric",
                      month: "long",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                {!notification.readAt && (
                  <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-primary" aria-hidden />
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
