import Link from "next/link";
import { Button } from "@tekliflercepte/ui";
import { apiUrl } from "@/lib/api";
import { getSessionToken, getSessionUser } from "@/lib/session";
import { AccountMenu } from "./account-menu";
import { MobileMenu } from "./mobile-menu";

// These two sections only exist on the homepage, but SiteHeader is shared by
// every page — a plain "#id" href would just tack a dead hash onto whatever
// page you're currently on. Prefixing with "/" makes it a real Link that
// navigates home first, then scrolls to the section.
const BASE_NAV_LINKS = [
  { href: "/#nasil-calisir", label: "Nasıl Çalışır" },
  { href: "/#kategoriler", label: "Kategoriler" },
  { href: "/ustalar", label: "Usta Ara" },
];

// "Hizmet Ver" is a recruitment CTA for people who aren't members yet —
// shown only to anonymous visitors, never to an already-logged-in user
// (customer or provider).
const GUEST_ONLY_LINK = { href: "/hizmet-ver", label: "Hizmet Ver" };

async function getUnreadCount(token) {
  if (!token) return 0;
  try {
    const res = await fetch(apiUrl("/me/unread-count"), {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return 0;
    const data = await res.json();
    return data.count ?? 0;
  } catch {
    return 0;
  }
}

export async function SiteHeader() {
  const user = await getSessionUser();
  const NAV_LINKS = user ? BASE_NAV_LINKS : [...BASE_NAV_LINKS, GUEST_ONLY_LINK];
  const unreadCount = user ? await getUnreadCount(await getSessionToken()) : 0;

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-surface/90 backdrop-blur">
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

        <div className="hidden items-center gap-4 lg:flex">
          {user ? (
            <>
              <Link
                href={user.role === "PROVIDER" ? "/usta/panel" : "/taleplerim"}
                className="text-sm font-semibold"
              >
                {user.role === "PROVIDER" ? "Usta Paneli" : "Taleplerim"}
              </Link>
              {user.role !== "PROVIDER" && (
                <Link href="/favorilerim" className="text-sm font-semibold">
                  Favorilerim
                </Link>
              )}
              <Link href="/mesajlar" className="relative text-sm font-semibold">
                Mesajlar
                {unreadCount > 0 && (
                  <span className="absolute -right-3 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
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

        <MobileMenu links={NAV_LINKS} user={user} unreadCount={unreadCount} />
      </div>
    </header>
  );
}
