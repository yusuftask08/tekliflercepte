"use client";

import { useEffect, useRef, useState } from "react";

const REASONS = [
  { value: "HARASSMENT", label: "Taciz / uygunsuz davranış" },
  { value: "SPAM", label: "Spam" },
  { value: "FRAUD", label: "Dolandırıcılık şüphesi" },
  { value: "OTHER", label: "Diğer" },
];

export function ReportBlockMenu({ otherUserId, offerId, initialBlocked }) {
  const [open, setOpen] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [reason, setReason] = useState("HARASSMENT");
  const [details, setDetails] = useState("");
  const [blocked, setBlocked] = useState(initialBlocked);
  const [submitting, setSubmitting] = useState(false);
  const [reportSent, setReportSent] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
        setReporting(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const toggleBlock = async () => {
    setSubmitting(true);
    try {
      await fetch(`/api/blocks/${otherUserId}`, { method: blocked ? "DELETE" : "POST" });
      setBlocked(!blocked);
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const submitReport = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportedUserId: otherUserId, offerId, reason, details }),
      });
      setReportSent(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted hover:bg-surface-raised"
        aria-label="Seçenekler"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5" r="1.8" />
          <circle cx="12" cy="12" r="1.8" />
          <circle cx="12" cy="19" r="1.8" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-10 mt-2 w-64 rounded-md border border-border bg-surface p-3 shadow-md">
          {reporting ? (
            reportSent ? (
              <div className="text-sm text-success">Şikayetin alındı, inceleyeceğiz.</div>
            ) : (
              <form onSubmit={submitReport} className="flex flex-col gap-2">
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="rounded-md border border-border bg-bg px-2 py-1.5 text-sm"
                >
                  {REASONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Detay (opsiyonel)"
                  rows={2}
                  className="rounded-md border border-border bg-bg px-2 py-1.5 text-sm"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-md bg-danger px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {submitting ? "Gönderiliyor..." : "Şikayeti Gönder"}
                </button>
              </form>
            )
          ) : (
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setReporting(true)}
                className="rounded-md px-2 py-2 text-left text-sm hover:bg-surface-raised"
              >
                Şikayet Et
              </button>
              <button
                onClick={toggleBlock}
                disabled={submitting}
                className="rounded-md px-2 py-2 text-left text-sm text-danger hover:bg-surface-raised disabled:opacity-50"
              >
                {blocked ? "Engeli Kaldır" : "Engelle"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
