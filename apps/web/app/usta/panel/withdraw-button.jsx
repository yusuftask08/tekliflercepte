"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@tekliflercepte/ui";

export function WithdrawButton({ offerId }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);

  const withdraw = async () => {
    const res = await fetch(`/api/offers/${offerId}/withdraw`, { method: "POST" });
    if (res.status === 401) {
      router.push("/giris?next=/usta/panel");
      return;
    }
    router.refresh();
  };

  if (!confirming) {
    return (
      <Button variant="danger" size="sm" onClick={() => setConfirming(true)}>
        Geri Çek
      </Button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <span className="text-text-muted">Emin misin?</span>
      <Button variant="danger" size="sm" onClick={withdraw}>
        Evet, geri çek
      </Button>
      <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
        Vazgeç
      </Button>
    </div>
  );
}
