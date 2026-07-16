"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function FavoriteButton({ providerId, initialFavorited }) {
  const router = useRouter();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [submitting, setSubmitting] = useState(false);

  const toggle = async () => {
    setSubmitting(true);
    try {
      await fetch(`/api/favorites/${providerId}`, { method: favorited ? "DELETE" : "POST" });
      setFavorited(!favorited);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={submitting}
      aria-pressed={favorited}
      className={`flex w-full items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-sm font-bold transition disabled:opacity-50 ${
        favorited
          ? "border-primary bg-brand-50 text-primary"
          : "border-border bg-transparent text-text-muted hover:bg-surface-raised"
      }`}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill={favorited ? "currentColor" : "none"}>
        <path
          d="M12 21s-7.5-4.6-10-9.1C.6 8.6 2 5 5.6 5c2 0 3.4 1.1 4.4 2.6C11 6.1 12.4 5 14.4 5 18 5 19.4 8.6 22 11.9 19.5 16.4 12 21 12 21Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
      {favorited ? "Favorilerimde" : "Favorilere Ekle"}
    </button>
  );
}
