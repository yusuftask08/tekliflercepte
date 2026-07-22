"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@tekliflercepte/ui";
import { AuthInput } from "../auth-input";
import { normalizePhone } from "@/lib/phone";

export function LoginForm({ next }) {
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
      const identifier = phone.includes("@") ? phone.trim().toLowerCase() : normalizePhone(phone);
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Giriş yapılamadı");
        return;
      }
      router.push(next || "/");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div>
        <label className="mb-2 block text-sm font-semibold">Telefon veya E-posta</label>
        <AuthInput
          icon="user"
          required
          maxLength={254}
          placeholder="05XX XXX XX XX veya email"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="block text-sm font-semibold">Şifre</label>
          <Link href="/sifremi-unuttum" className="text-xs text-text-muted hover:text-primary">
            Şifremi unuttum
          </Link>
        </div>
        <AuthInput
          icon="lock"
          required
          type="password"
          maxLength={72}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {error && <div className="text-sm text-danger">{error}</div>}

      <Button type="submit" size="lg" disabled={submitting}>
        {submitting ? "Giriş yapılıyor..." : "Giriş Yap"}
      </Button>

      <div className="text-center text-sm text-text-muted">
        Hesabın yok mu?{" "}
        <Link
          href={`/kayit${next ? `?next=${encodeURIComponent(next)}` : ""}`}
          className="font-semibold text-primary"
        >
          Kayıt ol
        </Link>
      </div>
    </form>
  );
}
