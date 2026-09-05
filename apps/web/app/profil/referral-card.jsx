"use client";

import { useState } from "react";
import { Button } from "@tekliflercepte/ui";

export function ReferralCard({ referralCode, totalReferred, isProvider }) {
  const [copied, setCopied] = useState(false);
  const link = typeof window !== "undefined" ? `${window.location.origin}/kayit?ref=${referralCode}` : "";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API can be unavailable (older Safari, non-https dev) —
      // the link is still visible/selectable in the input below either way.
    }
  };

  return (
    <div className="mt-8 rounded-lg border border-border bg-surface p-5 shadow-sm">
      <div className="text-sm font-bold">Arkadaşını Davet Et</div>
      <p className="mt-1 text-sm text-text-muted">
        {isProvider
          ? "Linkinle katılan bir usta profilini tamamladığında günlük ücretsiz teklif limitin kalkar."
          : "Linkinle yeni kullanıcılar davet et."}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input
          readOnly
          value={link}
          onClick={(e) => e.target.select()}
          className="min-w-0 flex-1 rounded-md border border-border bg-bg px-3 py-2 text-sm"
        />
        <Button type="button" size="sm" onClick={copy}>
          {copied ? "Kopyalandı" : "Kopyala"}
        </Button>
      </div>
      {totalReferred > 0 && (
        <div className="mt-2 text-xs text-text-muted">Şu ana kadar {totalReferred} kişi senin linkinle katıldı.</div>
      )}
    </div>
  );
}
