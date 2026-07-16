"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function RequestModerationActions({ requestId }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const act = async (action) => {
    setSubmitting(true);
    try {
      await fetch(`/api/requests/${requestId}/${action}`, { method: "POST" });
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => act("approve")}
        disabled={submitting}
        className="rounded-md bg-success px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
      >
        Onayla
      </button>
      <button
        onClick={() => act("reject")}
        disabled={submitting}
        className="rounded-md border border-danger px-3 py-1.5 text-xs font-semibold text-danger disabled:opacity-50"
      >
        Reddet
      </button>
    </div>
  );
}
