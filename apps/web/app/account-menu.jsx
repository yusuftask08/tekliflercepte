"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar } from "@tekliflercepte/ui";

export function AccountMenu({ user }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const rootRef = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setOpen(false);
    router.push("/");
    router.refresh();
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-sm font-medium hover:text-primary"
        aria-expanded={open}
      >
        <Avatar name={`${user.firstName} ${user.lastName}`} size="sm" />
        Merhaba, {user.firstName}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-modal mt-2 w-48 rounded-md border border-border bg-surface py-1.5 shadow-md">
          <Link
            href="/profil"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm hover:bg-surface-raised"
          >
            Profilim
          </Link>
          <div className="my-1 border-t border-border" />
          <button
            onClick={logout}
            className="block w-full px-4 py-2 text-left text-sm text-danger hover:bg-surface-raised"
          >
            Çıkış Yap
          </button>
        </div>
      )}
    </div>
  );
}
