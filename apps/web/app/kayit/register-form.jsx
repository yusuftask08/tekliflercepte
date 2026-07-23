"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Checkbox, Input, SelectableCard } from "@tekliflercepte/ui";
import { AuthInput } from "../auth-input";
import { normalizePhone } from "@/lib/phone";
import { validate, rules } from "@/lib/validation";

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
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    const errors = validate([
      { field: "firstName", value: firstName, rules: [rules.required("Ad gerekli")] },
      { field: "lastName", value: lastName, rules: [rules.required("Soyad gerekli")] },
      { field: "phone", value: normalizePhone(phone), rules: [rules.required("Telefon gerekli"), rules.phone()] },
      { field: "email", value: email, rules: [rules.required("Email gerekli"), rules.email()] },
      { field: "password", value: password, rules: [rules.required("Şifre gerekli"), rules.minLength(6)] },
    ]);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
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
          <label className="mb-2 block text-sm font-semibold">
            Ad<span className="text-danger"> *</span>
          </label>
          <Input
            required
            maxLength={50}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          {fieldErrors.firstName && <p className="mt-1 text-xs text-danger">{fieldErrors.firstName}</p>}
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold">
            Soyad<span className="text-danger"> *</span>
          </label>
          <Input
            required
            maxLength={50}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          {fieldErrors.lastName && <p className="mt-1 text-xs text-danger">{fieldErrors.lastName}</p>}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold">
          Telefon<span className="text-danger"> *</span>
        </label>
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
        {fieldErrors.phone && <p className="mt-1 text-xs text-danger">{fieldErrors.phone}</p>}
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold">
          E-posta<span className="text-danger"> *</span>
        </label>
        <AuthInput
          icon="mail"
          required
          type="email"
          maxLength={254}
          placeholder="ornek@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {fieldErrors.email ? (
          <p className="mt-1 text-xs text-danger">{fieldErrors.email}</p>
        ) : (
          <p className="mt-1 text-xs text-text-muted">
            Teklif/mesaj bildirimleri ve şifre sıfırlama için kullanılır.
          </p>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold">
          Şifre<span className="text-danger"> *</span>
        </label>
        <AuthInput
          icon="lock"
          required
          type="password"
          minLength={6}
          maxLength={72}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {fieldErrors.password && <p className="mt-1 text-xs text-danger">{fieldErrors.password}</p>}
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
