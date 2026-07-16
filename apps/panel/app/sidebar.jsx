"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LogoutButton } from "./logout-button";

const NAV_ITEMS = [
  { href: "/", label: "Talepler" },
  { href: "/talep-onaylari", label: "Talep Onayları", badgeKey: "pendingCount" },
  { href: "/kullanicilar", label: "Kullanıcılar" },
  { href: "/ustalar", label: "Ustalar" },
  { href: "/kategoriler", label: "Kategoriler" },
  { href: "/sikayetler", label: "Şikayetler" },
  { href: "/raporlar", label: "Raporlar" },
];

export function Sidebar({ pendingCount = 0 }) {
  const pathname = usePathname();
  const badgeValues = { pendingCount };

  return (
    <aside className="flex w-[220px] flex-shrink-0 flex-col border-r border-border bg-surface py-4">
      <div className="mb-5 px-4 text-lg font-extrabold">Teklifler Cepte</div>
      <nav className="flex flex-col gap-0.5 px-3">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const badgeValue = item.badgeKey ? badgeValues[item.badgeKey] : 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between rounded-md px-3.5 py-2.5 text-sm ${
                isActive
                  ? "bg-brand-100 font-semibold text-brand-700"
                  : "text-text-muted hover:bg-surface-raised"
              }`}
            >
              {item.label}
              {badgeValue > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1.5 text-xs font-bold text-white">
                  {badgeValue}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto flex flex-col gap-0.5 px-3 pt-4">
        <Link
          href="/profil"
          className={`rounded-md px-3.5 py-2.5 text-sm ${
            pathname === "/profil" ? "bg-brand-100 font-semibold text-brand-700" : "text-text-muted hover:bg-surface-raised"
          }`}
        >
          Profilim
        </Link>
        <LogoutButton />
      </div>
    </aside>
  );
}
