"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BottomNav } from "@tekliflercepte/ui";

// Focused, linear flows where jumping to another tab mid-task would just be
// disruptive, plus /mesajlar/[offerId] which already pins its own message
// input to the bottom of a fixed-height (h-screen) layout — a second fixed
// bar there would visually collide with it.
const HIDDEN_PREFIXES = [
  "/usta/kurulum",
  "/talep-olustur",
  "/giris",
  "/kayit",
  "/sifremi",
  "/mesajlar/",
];

const ICONS = {
  home: (color) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1v-9Z" stroke={color} strokeWidth="2" />
    </svg>
  ),
  requests: (color) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M6 3h12v18l-6-4-6 4V3Z" stroke={color} strokeWidth="2" />
    </svg>
  ),
  messages: (color) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M4 5h16v11H8l-4 4V5Z" stroke={color} strokeWidth="2" />
    </svg>
  ),
  profile: (color) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke={color} strokeWidth="2" />
      <path d="M4 21c0-4 4-6 8-6s8 2 8 6" stroke={color} strokeWidth="2" />
    </svg>
  ),
  search: (color) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="6" stroke={color} strokeWidth="2" />
      <path d="M20 20l-4.35-4.35" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  add: (color) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
      <path d="M12 8v8M8 12h8" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  panel: (color) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="4" width="7" height="7" rx="1.5" stroke={color} strokeWidth="2" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" stroke={color} strokeWidth="2" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" stroke={color} strokeWidth="2" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" stroke={color} strokeWidth="2" />
    </svg>
  ),
  settings: (color) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" />
      <path
        d="M19.4 13a7.97 7.97 0 0 0 0-2l2.1-1.6-2-3.4-2.5 1a8 8 0 0 0-1.7-1L14.9 3h-4l-.4 2.6a8 8 0 0 0-1.7 1l-2.5-1-2 3.4L6.4 11a7.97 7.97 0 0 0 0 2l-2.1 1.6 2 3.4 2.5-1a8 8 0 0 0 1.7 1l.4 2.6h4l.4-2.6a8 8 0 0 0 1.7-1l2.5 1 2-3.4L19.4 13Z"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  ),
  briefcase: (color) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="8" width="18" height="12" rx="1.5" stroke={color} strokeWidth="2" />
      <path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke={color} strokeWidth="2" />
      <path d="M3 13h18" stroke={color} strokeWidth="2" />
    </svg>
  ),
};

function getItems(user, unreadCount) {
  if (!user) {
    return [
      { href: "/", label: "Ana Sayfa", icon: ICONS.home },
      { href: "/ustalar", label: "Usta Ara", icon: ICONS.search },
      { href: "/talep-olustur", label: "Talep Oluştur", icon: ICONS.add },
      { href: "/hizmet-ver", label: "Hizmet Ver", icon: ICONS.briefcase },
      { href: "/giris", label: "Giriş Yap", icon: ICONS.profile },
    ];
  }
  if (user.role === "PROVIDER") {
    return [
      { href: "/usta/panel", label: "Açık İşler", icon: ICONS.panel },
      { href: "/mesajlar", label: "Mesajlar", icon: ICONS.messages, badge: unreadCount },
      { href: "/usta/ayarlar", label: "Ayarlar", icon: ICONS.settings },
    ];
  }
  return [
    { href: "/", label: "Ana Sayfa", icon: ICONS.home },
    { href: "/taleplerim", label: "Taleplerim", icon: ICONS.requests },
    { href: "/mesajlar", label: "Mesajlar", icon: ICONS.messages, badge: unreadCount },
    { href: "/profil", label: "Profil", icon: ICONS.profile },
  ];
}

export function BottomNavWrapper({ user, unreadCount }) {
  const pathname = usePathname();
  if (HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-bottomnav lg:hidden">
      <BottomNav active={pathname} LinkComponent={Link} items={getItems(user, unreadCount)} />
    </div>
  );
}
