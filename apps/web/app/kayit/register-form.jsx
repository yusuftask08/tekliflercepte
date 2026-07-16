"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@tekliflercepte/ui";
import { normalizePhone } from "@/lib/phone";

export function RegisterForm({ next, defaultRole = "CUSTOMER" }) {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(defaultRole);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          phone: normalizePhone(phone),
          email,
          password,
          role,
          termsAccepted,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Kayıt olurken bir sorun oluştu");
        return;
      }
      router.push(next || (role === "PROVIDER" ? "/usta/kurulum" : "/"));
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-2 block text-sm font-semibold">Ad</label>
          <input
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full rounded-md border border-border bg-surface px-3.5 py-3 text-sm"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold">Soyad</label>
          <input
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full rounded-md border border-border bg-surface px-3.5 py-3 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold">Telefon</label>
        <input
          required
          type="tel"
          placeholder="05XX XXX XX XX"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-md border border-border bg-surface px-3.5 py-3 text-sm"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold">E-posta</label>
        <input
          required
          type="email"
          placeholder="ornek@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border border-border bg-surface px-3.5 py-3 text-sm"
        />
        <p className="mt-1 text-xs text-text-muted">
          Teklif/mesaj bildirimleri ve şifre sıfırlama için kullanılır.
        </p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold">Şifre</label>
        <input
          required
          type="password"
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-md border border-border bg-surface px-3.5 py-3 text-sm"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold">Hesap türü</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setRole("CUSTOMER")}
            className={`rounded-md border px-3 py-3 text-left text-sm ${
              role === "CUSTOMER" ? "border-primary bg-brand-50" : "border-border"
            }`}
          >
            <div className="font-semibold">Hizmet Almak İstiyorum</div>
            <div className="text-xs text-text-muted">Talep oluştur, teklif al</div>
          </button>
          <button
            type="button"
            onClick={() => setRole("PROVIDER")}
            className={`rounded-md border px-3 py-3 text-left text-sm ${
              role === "PROVIDER" ? "border-primary bg-brand-50" : "border-border"
            }`}
          >
            <div className="font-semibold">Hizmet Vermek İstiyorum</div>
            <div className="text-xs text-text-muted">Ücretsiz teklif ver</div>
          </button>
        </div>
      </div>

      <label className="flex items-start gap-2.5 text-sm">
        <input
          type="checkbox"
          required
          checked={termsAccepted}
          onChange={(e) => setTermsAccepted(e.target.checked)}
          className="mt-0.5"
        />
        <span>
          <Link href="/kullanici-sozlesmesi" target="_blank" className="font-semibold text-primary">
            Kullanıcı Sözleşmesi
          </Link>
          {"'"}ni ve{" "}
          <Link href="/kvkk" target="_blank" className="font-semibold text-primary">
            KVKK Aydınlatma Metni
          </Link>
          {"'"}ni okudum, kabul ediyorum.
        </span>
      </label>

      {error && <div className="text-sm text-danger">{error}</div>}

      <Button type="submit" size="lg" disabled={submitting || !termsAccepted}>
        {submitting ? "Kayıt olunuyor..." : "Kayıt Ol"}
      </Button>

      <div className="text-center text-sm text-text-muted">
        Zaten hesabın var mı?{" "}
        <Link href={`/giris${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-primary">
          Giriş yap
        </Link>
      </div>
    </form>
  );
}
