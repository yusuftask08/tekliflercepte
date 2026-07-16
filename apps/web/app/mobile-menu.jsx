"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar, Button } from "@tekliflercepte/ui";
import { LogoutButton } from "./logout-button";

export function MobileMenu({ links, user, unreadCount = 0 }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="flex h-9 w-9 items-center justify-center rounded-md border border-border lg:hidden"
        onClick={() => setOpen(!open)}
        aria-label="Menü"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          {open ? (
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          ) : (
            <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          )}
        </svg>
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full flex flex-col gap-1 border-t border-border bg-surface px-4 py-3 lg:hidden">
          {links.map((link) =>
            link.href.startsWith("#") ? (
              <a key={link.label} href={link.href} className="rounded-md px-3 py-2.5 text-sm font-medium">
                {link.label}
              </a>
            ) : (
              <Link
                key={link.label}
                href={link.href}
                className="rounded-md px-3 py-2.5 text-sm font-medium"
              >
                {link.label}
              </Link>
            )
          )}
          {user ? (
            <>
              <Link
                href={user.role === "PROVIDER" ? "/usta/panel" : "/taleplerim"}
                className="rounded-md px-3 py-2.5 text-sm font-medium"
              >
                {user.role === "PROVIDER" ? "Usta Paneli" : "Taleplerim"}
              </Link>
              {user.role !== "PROVIDER" && (
                <Link href="/favorilerim" className="rounded-md px-3 py-2.5 text-sm font-medium">
                  Favorilerim
                </Link>
              )}
              <Link
                href="/mesajlar"
                className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium"
              >
                Mesajlar
                {unreadCount > 0 && (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
              <Link
                href="/profil"
                className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium"
              >
                <Avatar name={`${user.firstName} ${user.lastName}`} size="sm" />
                Merhaba, {user.firstName}
              </Link>
              <LogoutButton className="px-3 py-2.5 text-left" />
            </>
          ) : (
            <>
              <Link href="/giris" className="rounded-md px-3 py-2.5 text-left text-sm font-semibold">
                Giriş Yap
              </Link>
              <Link href="/talep-olustur" className="mt-1">
                <Button className="w-full">Talep Oluştur</Button>
              </Link>
            </>
          )}
        </div>
      )}
    </>
  );
}
