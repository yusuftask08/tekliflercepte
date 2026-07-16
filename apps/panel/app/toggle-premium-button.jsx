"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function TogglePremiumButton({ providerId, isPremium }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const toggle = async () => {
    setSubmitting(true);
    try {
      await fetch(`/api/providers/${providerId}/toggle-premium`, { method: "POST" });
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={submitting}
      className={`text-xs font-semibold disabled:opacity-50 ${isPremium ? "text-text-muted" : "text-primary"}`}
    >
      {submitting ? "..." : isPremium ? "Premium'u Kaldır" : "Premium Yap"}
    </button>
  );
}
