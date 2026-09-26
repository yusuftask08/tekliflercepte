import Link from "next/link";
import { Avatar, Button } from "@tekliflercepte/ui";
import { getUnreadCount } from "@/lib/api";
import { getSessionToken } from "@/lib/session";
import { AccountNav } from "./account-nav";

const ROLE_LABEL = { CUSTOMER: "Müşteri hesabı", PROVIDER: "Usta hesabı", ADMIN: "Yönetici" };

// Shared frame for the logged-in account pages (taleplerim, mesajlar,
// favorilerim, bildirimler, profil, usta panel/belgeler/ayarlar): a sticky
// sidebar with the account menu on desktop, and a consistent page header.
// On mobile the sidebar is dropped — BottomNav already covers navigation.
export async function AccountShell({ user, title, description, actions, children }) {
  // Already fetched by the root layout in the same request — cache() dedupes it.
  const unreadCount = await getUnreadCount(await getSessionToken());
  const isProvider = user.role === "PROVIDER";

  return (
    <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-5 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <div className="lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start lg:gap-10">
        <aside className="hidden lg:sticky lg:top-24 lg:block">
          <div className="rounded-lg border border-border bg-surface p-4 shadow-sm">
            <div className="flex items-center gap-3 px-1 pb-4">
              <Avatar name={`${user.firstName} ${user.lastName}`} size="md" />
              <div className="min-w-0">
                <div className="truncate font-bold">
                  {user.firstName} {user.lastName}
                </div>
                <div className="text-xs text-text-muted">{ROLE_LABEL[user.role] ?? user.role}</div>
              </div>
            </div>

            {isProvider ? (
              <Link href={`/usta/${user.id}`} className="mb-4 block">
                <Button variant="secondary" size="md" className="w-full">
                  Profilimi Görüntüle
                </Button>
              </Link>
            ) : (
              <Link href="/talep-olustur" className="mb-4 block">
                <Button size="md" className="w-full">
                  + Yeni Talep Oluştur
                </Button>
              </Link>
            )}

            <AccountNav role={user.role} unreadCount={unreadCount} />
          </div>
        </aside>

        <main className="min-w-0">
          <header className="flex flex-wrap items-end justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1>
              {description && <p className="mt-2 max-w-2xl text-sm text-text-muted sm:text-base">{description}</p>}
            </div>
            {actions && <div className="flex flex-shrink-0 items-center gap-3">{actions}</div>}
          </header>
          <div className="mt-5">{children}</div>
        </main>
      </div>
    </div>
  );
}
