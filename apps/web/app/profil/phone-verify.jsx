"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button, Input } from "@tekliflercepte/ui";

/** Inline phone-verification widget next to the phone field in AccountForm.
 *  `verified` reflects the server-rendered user at page load — a phone
 *  number change resets it server-side (see PATCH /me), and this widget
 *  goes back to its "unverified" state on the next router.refresh(). */
export function PhoneVerify({ verified }) {
  const router = useRouter();
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState(null);
  const [cooldown, setCooldown] = useState(false);

  if (verified) {
    return (
      <Badge tone="success" icon="check" className="mt-2">
        Telefon Doğrulandı
      </Badge>
    );
  }

  const sendCode = async () => {
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/me/phone/send-code", { method: "POST" });
      if (res.status === 401) {
        router.push("/giris?next=/profil");
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Kod gönderilemedi, tekrar dene");
        return;
      }
      setSent(true);
      setCooldown(true);
      setTimeout(() => setCooldown(false), 60_000);
    } finally {
      setSending(false);
    }
  };

  const verifyCode = async (e) => {
    e.preventDefault();
    setVerifying(true);
    setError(null);
    try {
      const res = await fetch("/api/me/phone/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (res.status === 401) {
        router.push("/giris?next=/profil");
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Kod doğrulanamadı");
        return;
      }
      router.refresh();
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="mt-2">
      {!sent ? (
        <div className="flex items-center gap-2">
          <Badge tone="warning">Telefon doğrulanmadı</Badge>
          <button
            type="button"
            onClick={sendCode}
            disabled={sending}
            className="text-sm font-semibold text-primary disabled:opacity-50"
          >
            {sending ? "Gönderiliyor..." : "Doğrulama kodu gönder"}
          </button>
        </div>
      ) : (
        <form onSubmit={verifyCode} className="flex flex-wrap items-center gap-2">
          <Input
            inputMode="numeric"
            maxLength={6}
            placeholder="6 haneli kod"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            className="w-32"
          />
          <Button type="submit" size="sm" disabled={verifying || code.length !== 6}>
            {verifying ? "Doğrulanıyor..." : "Doğrula"}
          </Button>
          <button
            type="button"
            onClick={sendCode}
            disabled={sending || cooldown}
            className="text-sm font-semibold text-primary disabled:opacity-50"
          >
            Kodu tekrar gönder
          </button>
        </form>
      )}
      {error && <div className="mt-1 text-sm text-danger">{error}</div>}
    </div>
  );
}
