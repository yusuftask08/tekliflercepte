"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { Button, Input, Textarea } from "@tekliflercepte/ui";

export function ContactForm({ initialName = "", initialEmail = "" }) {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/support-tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Gönderilemedi, lütfen tekrar dene.");
        return;
      }
      setSent(true);
      setSubject("");
      setMessage("");
    } catch {
      toast.error("Bir bağlantı sorunu oluştu, lütfen tekrar dene.");
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="rounded-lg border border-success/30 bg-success/10 p-4 text-sm text-success">
        Talebin bize ulaştı, en kısa sürede döneriz.
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold">Ad Soyad</label>
          <Input required maxLength={100} value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold">E-posta</label>
          <Input
            type="email"
            required
            maxLength={254}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>
      <div>
        <label className="mb-2 block text-sm font-semibold">Konu</label>
        <Input required maxLength={150} value={subject} onChange={(e) => setSubject(e.target.value)} />
      </div>
      <div>
        <label className="mb-2 block text-sm font-semibold">Mesaj</label>
        <Textarea
          required
          rows={5}
          maxLength={3000}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="bg-bg"
        />
      </div>
      <Button type="submit" disabled={submitting} className="self-start">
        {submitting ? "Gönderiliyor..." : "Gönder"}
      </Button>
    </form>
  );
}
