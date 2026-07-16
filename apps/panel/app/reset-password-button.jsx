"use client";

import { useState } from "react";

export function ResetPasswordButton({ userId }) {
  const [tempPassword, setTempPassword] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const reset = async () => {
    if (!confirm("Bu kullanıcının şifresini sıfırlamak istediğine emin misin?")) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/users/${userId}/reset-password`, { method: "POST" });
      const data = await res.json();
      if (res.ok) setTempPassword(data.tempPassword);
    } finally {
      setSubmitting(false);
    }
  };

  if (tempPassword) {
    return <span className="font-mono text-xs text-success">Yeni şifre: {tempPassword}</span>;
  }

  return (
    <button onClick={reset} disabled={submitting} className="text-xs font-semibold text-primary disabled:opacity-50">
      {submitting ? "..." : "Şifre Sıfırla"}
    </button>
  );
}
