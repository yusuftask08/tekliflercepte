"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { RequestModerationActions } from "../../request-moderation-actions";

export function RequestApprovalList({ requests, apiOrigin }) {
  const router = useRouter();
  const [selected, setSelected] = useState(new Set());
  const [bulkSubmitting, setBulkSubmitting] = useState(false);

  const toggle = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const bulkAct = async (action) => {
    setBulkSubmitting(true);
    try {
      const results = await Promise.all(
        Array.from(selected).map((id) => fetch(`/api/requests/${id}/${action}`, { method: "POST" }))
      );
      const failed = results.filter((r) => !r.ok).length;
      if (failed > 0) {
        toast.error(`${failed} talep işlenemedi, listeyi kontrol et.`);
      }
      setSelected(new Set());
      router.refresh();
    } catch {
      toast.error("Bir bağlantı sorunu oluştu, lütfen tekrar dene.");
    } finally {
      setBulkSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {selected.size > 0 && (
        <div className="sticky top-0 z-dropdown flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3 shadow-sm">
          <span className="text-sm font-semibold">{selected.size} talep seçildi</span>
          <button
            onClick={() => bulkAct("approve")}
            disabled={bulkSubmitting}
            className="rounded-md bg-success px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
          >
            Seçilenleri Onayla
          </button>
          <button
            onClick={() => bulkAct("reject")}
            disabled={bulkSubmitting}
            className="rounded-md border border-danger px-3 py-1.5 text-xs font-semibold text-danger disabled:opacity-50"
          >
            Seçilenleri Reddet
          </button>
          <button
            onClick={() => setSelected(new Set())}
            className="ml-auto text-xs font-semibold text-text-muted"
          >
            Seçimi temizle
          </button>
        </div>
      )}

      {requests.map((request) => (
        <div key={request.id} className="rounded-lg border border-border bg-surface p-4 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={selected.has(request.id)}
                onChange={() => toggle(request.id)}
                className="mt-1"
                aria-label="Talebi seç"
              />
              <div>
                <div className="font-semibold">
                  {request.customer?.firstName} {request.customer?.lastName} · {request.category?.name}
                </div>
                <div className="mt-0.5 text-sm text-text-muted">
                  {request.city}
                  {request.district ? ` / ${request.district}` : ""} ·{" "}
                  {new Date(request.createdAt).toLocaleDateString("tr-TR", {
                    day: "2-digit",
                    month: "short",
                  })}
                </div>
              </div>
            </div>
            <RequestModerationActions requestId={request.id} />
          </div>

          <p className="mt-3 text-sm">{request.details}</p>
          {request.budget && (
            <p className="mt-1 text-xs text-text-muted">Bütçe: {request.budget}</p>
          )}

          {request.photos?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {request.photos.map((url) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={url}
                  src={`${apiOrigin}${url}`}
                  alt=""
                  className="h-28 w-28 rounded-md border border-border object-cover"
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
