"use client";

import { useState } from "react";
import { Button, Input } from "@tekliflercepte/ui";

export function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/me/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Şifre değiştirilemedi");
        return;
      }
      setSaved(true);
      setCurrentPassword("");
      setNewPassword("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div>
        <label className="mb-2 block text-sm font-semibold">Mevcut Şifre</label>
        <Input
          type="password"
          required
          maxLength={72}
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
      </div>
      <div>
        <label className="mb-2 block text-sm font-semibold">Yeni Şifre</label>
        <Input
          type="password"
          required
          minLength={6}
          maxLength={72}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </div>
      {error && <div className="text-sm text-danger">{error}</div>}
      {saved && <div className="text-sm text-success">Şifren güncellendi.</div>}
      <Button type="submit" variant="secondary" disabled={submitting} className="self-start">
        {submitting ? "Güncelleniyor..." : "Şifreyi Değiştir"}
      </Button>
    </form>
  );
}
