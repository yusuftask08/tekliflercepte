"use client";

import { useState } from "react";

export function ShareAppButton() {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? window.location.origin : "https://tekliflercepte.com";

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Teklifler Cepte", url });
      } catch {
        // user cancelled the share sheet — no-op
      }
      return;
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button onClick={share} className="text-sm font-semibold text-primary">
      {copied ? "Kopyalandı!" : "Paylaş"}
    </button>
  );
}
