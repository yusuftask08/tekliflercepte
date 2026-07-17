"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: phone, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Giriş yapılamadı");
        return;
      }
      router.push("/");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex w-full max-w-sm flex-col gap-4">
      <div>
        <label className="mb-2 block text-sm font-semibold">Telefon veya E-posta</label>
        <input
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-md border border-border bg-surface px-3.5 py-3 text-sm"
        />
      </div>
      <div>
        <label className="mb-2 block text-sm font-semibold">Şifre</label>
        <input
          required
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-md border border-border bg-surface px-3.5 py-3 text-sm"
        />
      </div>
      {error && <div className="text-sm text-danger">{error}</div>}
      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-primary px-4 py-3 text-sm font-bold text-text-on-brand disabled:opacity-50"
      >
        {submitting ? "Giriş yapılıyor..." : "Giriş Yap"}
      </button>
    </form>
  );
}
