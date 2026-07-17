import Link from "next/link";
import { Button } from "@tekliflercepte/ui";
import { AccountMenu } from "./account-menu";
import { NotificationBell } from "./notification-bell";

// These two sections only exist on the homepage, but SiteHeader is shared by
// every page — a plain "#id" href would just tack a dead hash onto whatever
// page you're currently on. Prefixing with "/" makes it a real Link that
// navigates home first, then scrolls to the section. Pure marketing content,
// so only shown to guests — an already-registered user has no use for it.
const MARKETING_LINKS = [
  { href: "/#nasil-calisir", label: "Nasıl Çalışır" },
  { href: "/#kategoriler", label: "Kategoriler" },
];

// Real feature (finding a provider), not marketing — kept for guests and
// logged-in customers, but dropped for providers, who have no reason to
// browse other providers.
const USTA_ARA_LINK = { href: "/ustalar", label: "Usta Ara" };

// "Hizmet Ver" is a recruitment CTA for people who aren't members yet —
// shown only to anonymous visitors, never to an already-logged-in user
// (customer or provider).
const GUEST_ONLY_LINK = { href: "/hizmet-ver", label: "Hizmet Ver" };

function getNavLinks(user) {
  if (!user) return [...MARKETING_LINKS, USTA_ARA_LINK, GUEST_ONLY_LINK];
  if (user.role === "PROVIDER") return [];
  return [USTA_ARA_LINK];
}

// user/unreadCount are passed down from the root layout, which already
// fetches both for BottomNavWrapper — avoids fetching them a second time
// on every single page.
export function SiteHeader({ user, unreadCount }) {
  const NAV_LINKS = getNavLinks(user);

  return (
    <header className="sticky top-0 z-header border-b border-border bg-surface/90 backdrop-blur">
      <div className="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-lg font-extrabold sm:text-xl">
          Teklifler Cepte
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-text-muted lg:flex">
          {NAV_LINKS.map((link) =>
            link.href.startsWith("#") ? (
              <a key={link.label} href={link.href} className="hover:text-text">
                {link.label}
              </a>
            ) : (
              <Link key={link.label} href={link.href} className="hover:text-text">
                {link.label}
              </Link>
            )
          )}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {user && <NotificationBell />}
          <div className="hidden items-center gap-4 lg:flex">
            {user ? (
              <>
                <Link
                  href={user.role === "PROVIDER" ? "/usta/panel" : "/taleplerim"}
                  className="text-sm font-semibold"
                >
                  {user.role === "PROVIDER" ? "Açık İşler" : "Taleplerim"}
                </Link>
                {user.role !== "PROVIDER" && (
                  <Link href="/favorilerim" className="text-sm font-semibold">
                    Favorilerim
                  </Link>
                )}
                <Link href="/mesajlar" className="inline-flex items-center gap-1.5 text-sm font-semibold">
                  Mesajlar
                  {unreadCount > 0 && (
                    <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold leading-none text-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>
                <AccountMenu user={user} />
              </>
            ) : (
              <>
                <Link href="/giris" className="text-sm font-semibold">
                  Giriş Yap
                </Link>
                <Link href="/talep-olustur">
                  <Button size="md">Talep Oluştur</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
