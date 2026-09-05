"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

export function DocumentReviewButtons({ documentId }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const approve = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/provider-documents/${documentId}/approve`, { method: "POST" });
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

  const reject = async () => {
    const note = window.prompt("Reddetme sebebi (opsiyonel):") ?? "";
    setSubmitting(true);
    try {
      const res = await fetch(`/api/provider-documents/${documentId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note }),
      });
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
    <div className="flex items-center gap-3">
      <button onClick={approve} disabled={submitting} className="text-xs font-semibold text-primary disabled:opacity-50">
        Onayla
      </button>
      <button onClick={reject} disabled={submitting} className="text-xs font-semibold text-danger disabled:opacity-50">
        Reddet
      </button>
    </div>
  );
}
