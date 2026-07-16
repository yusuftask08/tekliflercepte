"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@tekliflercepte/ui";

export function AccountForm({ user }) {
  const router = useRouter();
  const [email, setEmail] = useState(user.email ?? "");
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const [emailError, setEmailError] = useState(null);
  const [emailSaved, setEmailSaved] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSaved, setPasswordSaved] = useState(false);

  const submitEmail = async (e) => {
    e.preventDefault();
    setEmailSubmitting(true);
    setEmailError(null);
    setEmailSaved(false);
    try {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEmailError(data.error ?? "Kaydedilemedi");
        return;
      }
      setEmailSaved(true);
      router.refresh();
    } finally {
      setEmailSubmitting(false);
    }
  };

  const submitPassword = async (e) => {
    e.preventDefault();
    setPasswordSubmitting(true);
    setPasswordError(null);
    setPasswordSaved(false);
    try {
      const res = await fetch("/api/me/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPasswordError(data.error ?? "Şifre değiştirilemedi");
        return;
      }
      setPasswordSaved(true);
      setCurrentPassword("");
      setNewPassword("");
    } finally {
      setPasswordSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={submitEmail} className="flex flex-col gap-3">
        <div>
          <label className="mb-2 block text-sm font-semibold">E-posta</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ornek@email.com"
            className="w-full rounded-md border border-border bg-bg px-3.5 py-3 text-sm"
          />
          <p className="mt-1 text-xs text-text-muted">
            Yeni talep onay bekleyince buraya bildirim gider.
          </p>
        </div>
        {emailError && <div className="text-sm text-danger">{emailError}</div>}
        {emailSaved && <div className="text-sm text-success">Kaydedildi.</div>}
        <Button type="submit" disabled={emailSubmitting} className="self-start">
          {emailSubmitting ? "Kaydediliyor..." : "Kaydet"}
        </Button>
      </form>

      <form onSubmit={submitPassword} className="flex flex-col gap-3 border-t border-border pt-6">
        <div>
          <label className="mb-2 block text-sm font-semibold">Mevcut Şifre</label>
          <input
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full rounded-md border border-border bg-bg px-3.5 py-3 text-sm"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold">Yeni Şifre</label>
          <input
            type="password"
            required
            minLength={6}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full rounded-md border border-border bg-bg px-3.5 py-3 text-sm"
          />
        </div>
        {passwordError && <div className="text-sm text-danger">{passwordError}</div>}
        {passwordSaved && <div className="text-sm text-success">Şifren güncellendi.</div>}
        <Button type="submit" variant="secondary" disabled={passwordSubmitting} className="self-start">
          {passwordSubmitting ? "Güncelleniyor..." : "Şifreyi Değiştir"}
        </Button>
      </form>
    </div>
  );
}
