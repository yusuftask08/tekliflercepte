"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Button } from "@tekliflercepte/ui";

export function ReviewForm({ requestId }) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  return (
    <form onSubmit={submit} className="rounded-lg border border-border bg-surface p-4 shadow-sm">
      <div className="font-semibold">İş tamamlandı mı? Ustanı değerlendir</div>
      <div className="mt-3 flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            className={`text-2xl ${n <= rating ? "text-warning" : "text-border"}`}
            aria-label={`${n} yıldız`}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={2}
        placeholder="Deneyimini kısaca anlat (opsiyonel)"
        className="mt-3 w-full rounded-md border border-border bg-bg px-3.5 py-2.5 text-sm"
      />
      <Button type="submit" size="md" className="mt-3" disabled={submitting}>
        {submitting ? "Gönderiliyor..." : "Değerlendirmeyi Gönder"}
      </Button>
    </form>
  );
}
