"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ResolveReportButton({ reportId }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const resolve = async () => {
    setSubmitting(true);
    try {
      await fetch(`/api/reports/${reportId}/resolve`, { method: "POST" });
      router.refresh();
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
