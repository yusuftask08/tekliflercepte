"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Button, StarPicker, Textarea } from "@tekliflercepte/ui";

export function ReviewForm({ requestId }) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [skipping, setSkipping] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/requests/${requestId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment: comment || undefined }),
      });
      if (res.status === 401) {
        router.push(`/giris?next=/taleplerim/${requestId}`);
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Değerlendirme gönderilemedi, lütfen tekrar dene.");
        return;
      }
      router.refresh();
    } catch {
      toast.error("Bir bağlantı sorunu oluştu, lütfen tekrar dene.");
    } finally {
      setSubmitting(false);
    }
  };

  const skipAndComplete = async () => {
    setSkipping(true);
    try {
      const res = await fetch(`/api/requests/${requestId}/complete`, { method: "POST" });
      if (res.status === 401) {
        router.push(`/giris?next=/taleplerim/${requestId}`);
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Talep tamamlanamadı, lütfen tekrar dene.");
        return;
      }
      router.refresh();
    } catch {
      toast.error("Bir bağlantı sorunu oluştu, lütfen tekrar dene.");
    } finally {
      setSkipping(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-lg border border-border bg-surface p-4 shadow-sm">
      <div className="font-semibold">İş tamamlandı mı? Ustanı değerlendir</div>
      <div className="mt-3">
        <StarPicker value={rating} onChange={setRating} />
      </div>
      <Textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={2}
        maxLength={500}
        placeholder="Deneyimini kısaca anlat (opsiyonel)"
        className="mt-3 bg-bg"
      />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Button type="submit" size="md" disabled={submitting || skipping}>
          {submitting ? "Gönderiliyor..." : "Değerlendirmeyi Gönder"}
        </Button>
        <button
          type="button"
          onClick={skipAndComplete}
          disabled={submitting || skipping}
          className="text-sm font-medium text-text-muted underline-offset-2 hover:underline disabled:opacity-60"
        >
          {skipping ? "Kapatılıyor..." : "Değerlendirmeden işi tamamla"}
        </button>
      </div>
    </form>
  );
}
