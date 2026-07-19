"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

export function VerifyIdentityButton({ providerId, verified }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const toggle = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/providers/${providerId}/verify-identity`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "İşlem başarısız, tekrar dene.");
        return;
      }
      router.refresh();
    } catch {
      toast.error("Bir bağlantı sorunu oluştu, lütfen tekrar dene.");
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
