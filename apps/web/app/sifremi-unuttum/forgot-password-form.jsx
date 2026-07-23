"use client";

import { useState } from "react";
import { Button } from "@tekliflercepte/ui";
import { AuthInput } from "../auth-input";
import { validate, rules } from "@/lib/validation";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    const errors = validate([
      { field: "email", value: email, rules: [rules.required("Email gerekli"), rules.email()] },
    ]);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Bir sorun oluştu");
        return;
      }
      setSent(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="rounded-md bg-success/10 px-4 py-3 text-sm text-success">
        Bu email kayıtlıysa, şifre sıfırlama bağlantısı gönderildi. Gelen kutunu (ve spam
        klasörünü) kontrol et.
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div>
        <label className="mb-2 block text-sm font-semibold">
          E-posta<span className="text-danger"> *</span>
        </label>
        <AuthInput
          icon="mail"
          required
          type="email"
          maxLength={254}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ornek@email.com"
        />
        {fieldErrors.email && <p className="mt-1 text-xs text-danger">{fieldErrors.email}</p>}
      </div>

      {error && <div className="text-sm text-danger">{error}</div>}

      <Button type="submit" size="lg" disabled={submitting}>
        {submitting ? "Gönderiliyor..." : "Sıfırlama Bağlantısı Gönder"}
      </Button>
    </form>
  );
}
