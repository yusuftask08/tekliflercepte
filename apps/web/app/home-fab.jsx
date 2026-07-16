"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const MESSAGES = [
  { text: "Hadi bir talep oluştur, teklif almaya başla! 🎉", href: "/talep-olustur" },
  { text: "Usta mısın? Hadi teklif ver, ücretsiz! 👷", href: "/hizmet-ver" },
];

export function HomeFab() {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const [pop, setPop] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % MESSAGES.length);
      setOpen(true);
      setPop(true);
      setTimeout(() => setPop(false), 300);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  if (dismissed) return null;
  const message = MESSAGES[index];

  return (
    <div className="fixed bottom-5 right-5 z-20 flex flex-col items-end gap-2">
      {open && (
        <div
          className={`relative max-w-[220px] rounded-lg bg-surface px-4 py-3 text-sm font-medium shadow-lg ring-1 ring-border transition-transform duration-300 ${
            pop ? "scale-105" : "scale-100"
          }`}
        >
          <button
            onClick={() => setDismissed(true)}
            className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-text text-[10px] text-bg"
            aria-label="Kapat"
          >
            ✕
          </button>
          <Link href={message.href} onClick={() => setOpen(false)}>
            {message.text}
          </Link>
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-text-on-brand shadow-lg transition-transform hover:scale-105"
        aria-label="Yardım"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M4 5h16v11H8l-4 4V5Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
