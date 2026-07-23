"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@tekliflercepte/ui";
import { AuthInput } from "../auth-input";
import { validate, rules } from "@/lib/validation";

export function ResetPasswordForm({ token }) {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    const errors = validate([
      { field: "newPassword", value: newPassword, rules: [rules.required("Şifre gerekli"), rules.minLength(6)] },
    ]);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Bir sorun oluştu");
        return;
      }
      setDone(true);
      setTimeout(() => router.push("/giris"), 1500);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-md bg-success/10 px-4 py-3 text-sm text-success">
        Şifren güncellendi, giriş sayfasına yönlendiriliyorsun...
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div>
        <label className="mb-2 block text-sm font-semibold">
          Yeni Şifre<span className="text-danger"> *</span>
        </label>
        <AuthInput
          icon="lock"
          required
          type="password"
          minLength={6}
          maxLength={72}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        {fieldErrors.newPassword && <p className="mt-1 text-xs text-danger">{fieldErrors.newPassword}</p>}
      </div>

      {error && <div className="text-sm text-danger">{error}</div>}

      <Button type="submit" size="lg" disabled={submitting}>
        {submitting ? "Kaydediliyor..." : "Şifreyi Güncelle"}
      </Button>
    </form>
  );
}
