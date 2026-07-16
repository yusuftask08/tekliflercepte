"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CancelButton({ requestId }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const cancel = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/requests/${requestId}/cancel`, { method: "POST" });
      if (res.status === 401) {
        router.push(`/giris?next=/taleplerim/${requestId}`);
        return;
      }
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  if (!confirming) {
    return (
      <button onClick={() => setConfirming(true)} className="text-sm font-semibold text-danger">
        Talebi İptal Et
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-text-muted">Emin misin?</span>
      <button onClick={cancel} disabled={submitting} className="font-semibold text-danger disabled:opacity-50">
        {submitting ? "İptal ediliyor..." : "Evet, iptal et"}
      </button>
      <button onClick={() => setConfirming(false)} className="text-text-muted">
        Vazgeç
      </button>
    </div>
  );
}
