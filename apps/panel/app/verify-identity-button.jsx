"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function VerifyIdentityButton({ providerId, verified }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const toggle = async () => {
    setSubmitting(true);
    try {
      await fetch(`/api/providers/${providerId}/verify-identity`, { method: "POST" });
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={submitting}
      className={`text-xs font-semibold disabled:opacity-50 ${verified ? "text-text-muted" : "text-primary"}`}
    >
      {submitting ? "..." : verified ? "Doğrulamayı Kaldır" : "Kimlik Doğrula"}
    </button>
  );
}
