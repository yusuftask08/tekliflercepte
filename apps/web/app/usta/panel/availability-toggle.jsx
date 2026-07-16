"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AvailabilityToggle({ isAvailable }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const toggle = async () => {
    setSubmitting(true);
    try {
      await fetch("/api/provider-profile/toggle-availability", { method: "POST" });
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={submitting}
      className={`flex items-center gap-2 rounded-md border px-3.5 py-2 text-sm font-semibold disabled:opacity-50 ${
        isAvailable
          ? "border-border text-text-muted hover:bg-surface-raised"
          : "border-warning bg-warning/10 text-warning"
      }`}
    >
      <span className={`h-2 w-2 rounded-full ${isAvailable ? "bg-success" : "bg-warning"}`} />
      {submitting ? "..." : isAvailable ? "Müsaitim" : "Molada — talep almıyorum"}
    </button>
  );
}
