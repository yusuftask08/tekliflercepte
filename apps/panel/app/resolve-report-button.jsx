"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

export function ResolveReportButton({ reportId }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const resolve = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/reports/${reportId}/resolve`, { method: "POST" });
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
      onClick={resolve}
      disabled={submitting}
      className="text-xs font-semibold text-primary disabled:opacity-50"
    >
      {submitting ? "..." : "İncelendi İşaretle"}
    </button>
  );
}
