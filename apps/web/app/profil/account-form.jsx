"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, Button } from "@tekliflercepte/ui";
import { normalizePhone } from "@/lib/phone";

export function AccountForm({ user }) {
  const router = useRouter();
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [phone, setPhone] = useState(user.phone);
  const [email, setEmail] = useState(user.email ?? "");
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef(null);
  const apiOrigin = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  const name = `${firstName} ${lastName}`;

  const uploadAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/uploads", { method: "POST", body: formData });
      if (res.status === 401) {
        router.push("/giris?next=/profil");
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setAvatarUrl(data.url);
      }
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, phone: normalizePhone(phone), email, avatarUrl }),
      });
      if (res.status === 401) {
        router.push("/giris?next=/profil");
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Kaydedilemedi");
        return;
      }
      setSaved(true);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Avatar name={name} src={avatarUrl ? `${apiOrigin}${avatarUrl}` : null} size="lg" />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="text-sm font-semibold text-primary disabled:opacity-50"
        >
          {uploading ? "Yükleniyor..." : "Fotoğraf değiştir"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={uploadAvatar}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-2 block text-sm font-semibold">Ad</label>
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full rounded-md border border-border bg-surface px-3.5 py-3 text-sm"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold">Soyad</label>
          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full rounded-md border border-border bg-surface px-3.5 py-3 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold">Telefon</label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-md border border-border bg-surface px-3.5 py-3 text-sm"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold">E-posta</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ornek@email.com"
          className="w-full rounded-md border border-border bg-surface px-3.5 py-3 text-sm"
        />
        {!email && (
          <p className="mt-1 text-xs text-warning">
            Email eklemezsen bildirim alamaz, şifreni unutursan sıfırlayamazsın.
          </p>
        )}
      </div>

      {error && <div className="text-sm text-danger">{error}</div>}
      {saved && <div className="text-sm text-success">Kaydedildi.</div>}

      <Button type="submit" disabled={submitting} className="self-start">
        {submitting ? "Kaydediliyor..." : "Kaydet"}
      </Button>
    </form>
  );
}
