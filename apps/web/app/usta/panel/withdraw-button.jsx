"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function WithdrawButton({ offerId }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const withdraw = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/offers/${offerId}/withdraw`, { method: "POST" });
      if (res.status === 401) {
        router.push("/giris?next=/usta/panel");
        return;
      }
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <button onClick={withdraw} disabled={submitting} className="text-xs text-danger disabled:opacity-50">
      {submitting ? "..." : "Geri Çek"}
    </button>
  );
}
