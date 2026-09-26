"use client";

import { usePathname } from "next/navigation";

// Same idea as SiteHeaderWrapper/BottomNavWrapper: focused, full-height
// flows get no footer. The footer itself is a Server Component passed in as
// children, so its data fetching stays on the server.
const HIDDEN_PREFIXES = ["/giris", "/kayit", "/sifremi", "/mesajlar/", "/talep-olustur", "/usta/kurulum"];

export function SiteFooterWrapper({ children }) {
  const pathname = usePathname();
  if (HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return null;
  return children;
}
