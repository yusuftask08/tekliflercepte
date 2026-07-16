"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@tekliflercepte/ui";

export function CancelButton({ requestId }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);

  const cancel = async () => {
    const res = await fetch(`/api/requests/${requestId}/cancel`, { method: "POST" });
    if (res.status === 401) {
      router.push(`/giris?next=/taleplerim/${requestId}`);
      return;
    }
    router.refresh();
  };

  if (!confirming) {
    return (
      <Button variant="danger" size="sm" onClick={() => setConfirming(true)}>
        Talebi İptal Et
      </Button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <span className="text-text-muted">Emin misin?</span>
      <Button variant="danger" size="sm" onClick={cancel}>
        Evet, iptal et
      </Button>
      <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
        Vazgeç
      </Button>
    </div>
  );
}
