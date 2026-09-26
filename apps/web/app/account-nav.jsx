"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "./logout-button";

const ICON_PATHS = {
  requests: <path d="M6 3h12v18l-6-4-6 4V3Z" />,
  messages: <path d="M4 5h16v11H8l-4 4V5Z" />,
  heart: <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z" />,
  bell: (
    <>
      <path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15L6 16Z" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
    </>
  ),
  grid: (
    <>
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </>
  ),
  file: (
    <>
      <path d="M7 3h7l5 5v13H7V3Z" />
      <path d="M14 3v5h5M10 13h6M10 17h6" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5V14M12 17h.01" />
    </>
  ),
};

function NavIcon({ name }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {ICON_PATHS[name]}
    </svg>
  );
}

const CUSTOMER_ITEMS = [
  { href: "/taleplerim", label: "Taleplerim", icon: "requests" },
  { href: "/mesajlar", label: "Mesajlar", icon: "messages", badge: "unread" },
  { href: "/favorilerim", label: "Favorilerim", icon: "heart" },
  { href: "/bildirimler", label: "Bildirimler", icon: "bell" },
  { href: "/profil", label: "Hesap Ayarları", icon: "user" },
];

const PROVIDER_ITEMS = [
  { href: "/usta/panel", label: "Panelim", icon: "grid" },
  { href: "/mesajlar", label: "Mesajlar", icon: "messages", badge: "unread" },
  { href: "/usta/belgeler", label: "Belgelerim", icon: "file" },
  { href: "/bildirimler", label: "Bildirimler", icon: "bell" },
  { href: "/profil", label: "Profilim", icon: "user" },
  { href: "/usta/ayarlar", label: "Ayarlar", icon: "settings" },
];

export function AccountNav({ role, unreadCount }) {
  const pathname = usePathname();
  const items = role === "PROVIDER" ? PROVIDER_ITEMS : CUSTOMER_ITEMS;

  return (
    <nav className="flex flex-col gap-1" aria-label="Hesap menüsü">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold ${
              active ? "bg-brand-50 text-brand-700" : "text-text-muted hover:bg-bg hover:text-text"
            }`}
          >
            <NavIcon name={item.icon} />
            <span className="flex-1">{item.label}</span>
            {item.badge === "unread" && unreadCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1.5 text-[11px] font-bold leading-none text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>
        );
      })}

      <div className="my-2 border-t border-border" />

      <Link
        href="/iletisim"
        className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold text-text-muted hover:bg-bg hover:text-text"
      >
        <NavIcon name="help" />
        Yardım & Destek
      </Link>
      <LogoutButton className="rounded-md px-3 py-2.5 text-left text-danger hover:bg-danger/5" />
    </nav>
  );
}
