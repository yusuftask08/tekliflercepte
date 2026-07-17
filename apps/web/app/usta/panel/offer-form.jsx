"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Button, Input, Textarea } from "@tekliflercepte/ui";

export function OfferForm({ requestId }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [price, setPrice] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
      router.push(`/mesajlar/${data.id}`);
    } catch {
      toast.error("Bir bağlantı sorunu oluştu, lütfen tekrar dene.");
    } finally {
      setSubmitting(false);
    }
  };

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
        <Input
          type="number"
          required
          min="1"
          max="1000000"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold">Mesaj (opsiyonel)</label>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={2}
          maxLength={500}
          placeholder="Örn: Yarın sabah 09:00'da gelebilirim..."
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
