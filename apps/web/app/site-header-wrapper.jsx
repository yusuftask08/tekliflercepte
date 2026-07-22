"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "./site-header";

// Same idea as BottomNavWrapper's HIDDEN_PREFIXES: auth pages have their own
// focused AuthShell with a lightweight wordmark — the full marketing nav
// (including a "Giriş Yap" link while already on /giris) would just be
// distracting clutter competing with the actual task.
const HIDDEN_PREFIXES = ["/giris", "/kayit", "/sifremi"];

export function SiteHeaderWrapper({ user, unreadCount }) {
  const pathname = usePathname();
  if (HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return null;
  return <SiteHeader user={user} unreadCount={unreadCount} />;
}
