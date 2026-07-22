"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Checkbox, Input, SelectableCard } from "@tekliflercepte/ui";
import { AuthInput } from "../auth-input";
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
          <Input
            required
            maxLength={50}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold">Soyad</label>
          <Input
            required
            maxLength={50}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold">Telefon</label>
        <AuthInput
          icon="phone"
          required
          type="tel"
          inputMode="numeric"
          maxLength={14}
          placeholder="05XX XXX XX XX"
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/[^\d\s]/g, ""))}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold">E-posta</label>
        <AuthInput
          icon="mail"
          required
          type="email"
          maxLength={254}
          placeholder="ornek@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <p className="mt-1 text-xs text-text-muted">
          Teklif/mesaj bildirimleri ve şifre sıfırlama için kullanılır.
        </p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold">Şifre</label>
        <AuthInput
          icon="lock"
          required
          type="password"
          minLength={6}
          maxLength={72}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold">Hesap türü</label>
        <div className="grid grid-cols-2 gap-3">
          <SelectableCard
            selected={role === "CUSTOMER"}
            onClick={() => setRole("CUSTOMER")}
            className="rounded-md px-3 py-3 text-sm"
          >
            <div className="font-semibold">Hizmet almak istiyorum</div>
            <div className="text-xs text-text-muted">Talep oluştur, teklif al</div>
          </SelectableCard>
          <SelectableCard
            selected={role === "PROVIDER"}
            onClick={() => setRole("PROVIDER")}
            className="rounded-md px-3 py-3 text-sm"
          >
            <div className="font-semibold">Hizmet vermek istiyorum</div>
            <div className="text-xs text-text-muted">Ücretsiz teklif ver</div>
          </SelectableCard>
        </div>
      </div>

      <label className="flex items-start gap-2.5 text-sm">
        <Checkbox checked={termsAccepted} onChange={setTermsAccepted} className="mt-0.5" />
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
