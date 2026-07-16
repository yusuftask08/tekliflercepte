"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Button } from "@tekliflercepte/ui";

export function OfferForm({ requestId }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [price, setPrice] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/requests/${requestId}/offers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price: Number(price), message: message || undefined }),
      });
      if (res.status === 401) {
        router.push("/giris?next=/usta/panel");
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Teklif gönderilemedi, lütfen tekrar dene.");
        return;
      }
      setSent(true);
      router.refresh();
    } catch {
      toast.error("Bir bağlantı sorunu oluştu, lütfen tekrar dene.");
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return <div className="rounded-md bg-success/10 px-4 py-2.5 text-sm text-success">Teklifin gönderildi.</div>;
  }

  if (!open) {
    return (
      <Button size="md" onClick={() => setOpen(true)}>
        Teklif Ver
      </Button>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 rounded-md border border-border bg-bg p-3">
      <div>
        <label className="mb-1.5 block text-xs font-semibold">Fiyatın (₺)</label>
        <input
          type="number"
          required
          min="1"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold">Mesaj (opsiyonel)</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={2}
          placeholder="Örn: Yarın sabah 09:00'da gelebilirim..."
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm"
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="md" disabled={submitting} className="flex-1">
          {submitting ? "Gönderiliyor..." : "Teklifi Gönder"}
        </Button>
        <Button type="button" variant="secondary" size="md" onClick={() => setOpen(false)}>
          Vazgeç
        </Button>
      </div>
    </form>
  );
}
