"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@tekliflercepte/ui";
import { AuthInput } from "../auth-input";
import { normalizePhone } from "@/lib/phone";
import { validate, rules } from "@/lib/validation";

export function LoginForm({ next }) {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    const errors = validate([
      { field: "phone", value: phone, rules: [rules.required("Telefon veya email gerekli")] },
      { field: "password", value: password, rules: [rules.required("Şifre gerekli")] },
    ]);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
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
        <label className="mb-2 block text-sm font-semibold">
          Telefon veya E-posta<span className="text-danger"> *</span>
        </label>
        <AuthInput
          icon="user"
          required
          maxLength={254}
          placeholder="05XX XXX XX XX veya email"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        {fieldErrors.phone && <p className="mt-1 text-xs text-danger">{fieldErrors.phone}</p>}
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="block text-sm font-semibold">
            Şifre<span className="text-danger"> *</span>
          </label>
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
        {fieldErrors.password && <p className="mt-1 text-xs text-danger">{fieldErrors.password}</p>}
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
