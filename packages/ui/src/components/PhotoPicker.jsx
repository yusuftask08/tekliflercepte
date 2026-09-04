"use client";

import { useRef, useState } from "react";
import Image from "next/image";

/** Small multi-photo upload grid — thumbnail chips with a remove button,
 *  plus a dashed "add" tile up to `max`. Owns the actual upload request
 *  (POST /api/uploads, same-origin proxy) so every caller doesn't re-wire
 *  the same FormData/fetch/401 dance; caller only holds the resulting
 *  `/uploads/<file>` URL array. Was request-wizard.jsx's inline photo step
 *  before being pulled out here for review-form.jsx's photos to reuse
 *  without duplicating it. */
export function PhotoPicker({ photos, onChange, max = 3, apiOrigin, onUnauthorized }) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const upload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/uploads", { method: "POST", body: formData });
      if (res.status === 401) {
        onUnauthorized?.();
        return;
      }
      if (res.ok) {
        const data = await res.json();
        onChange([...photos, data.url]);
      }
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="flex gap-2.5">
      {photos.map((url) => (
        <div key={url} className="relative h-16 w-16">
          <Image src={`${apiOrigin}${url}`} alt="" fill sizes="64px" className="rounded-md object-cover" />
          <button
            type="button"
            onClick={() => onChange(photos.filter((p) => p !== url))}
            aria-label="Fotoğrafı kaldır"
            className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-danger text-xs text-white"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      ))}
      {photos.length < max && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex h-16 w-16 items-center justify-center rounded-md border-2 border-dashed border-border text-text-muted disabled:opacity-50"
        >
          {uploading ? (
            <span className="text-xs">...</span>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </button>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={upload}
      />
    </div>
  );
}
