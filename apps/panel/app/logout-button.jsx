"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/giris");
    router.refresh();
  };

  return (
    <button onClick={logout} className="rounded-md px-3.5 py-2.5 text-left text-sm text-danger">
      Çıkış Yap
    </button>
  );
}
