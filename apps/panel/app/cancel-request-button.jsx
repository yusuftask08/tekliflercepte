"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CancelRequestButton({ requestId }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const cancel = async () => {
    if (!confirm("Bu talebi iptal etmek istediğine emin misin?")) return;
    setSubmitting(true);
    try {
      await fetch(`/api/requests/${requestId}/cancel`, { method: "POST" });
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <button
      onClick={cancel}
      disabled={submitting}
      className="rounded-md border border-danger px-3.5 py-2 text-sm font-semibold text-danger disabled:opacity-50"
    >
      {submitting ? "..." : "Talebi İptal Et"}
    </button>
  );
}
