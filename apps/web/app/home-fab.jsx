"use client";

import { useEffect, useState } from "react";
import { MascotIcon } from "./mascot-icon";
import { ChatWidget } from "./chat-widget";

const TEASERS = [
  "Hadi bir talep oluştur, teklif almaya başla!",
  "Usta mısın? Hadi teklif ver, ücretsiz!",
];

export function HomeFab({ categories }) {
  const [index, setIndex] = useState(0);
  const [teaserOpen, setTeaserOpen] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const [pop, setPop] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  // Fixed bottom-right positioning sits directly over the hero trust card on
  // short mobile viewports at scrollY 0 — hold off on mounting the widget at
  // all until the visitor has scrolled past the hero, instead of popping a
  // teaser bubble on top of it the instant the page loads.
  const [scrolledPastHero, setScrolledPastHero] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolledPastHero(window.scrollY > 320);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (chatOpen || !scrolledPastHero) return;
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % TEASERS.length);
      setTeaserOpen(true);
      setPop(true);
      setTimeout(() => setPop(false), 300);
    }, 6000);
    return () => clearInterval(interval);
  }, [chatOpen, scrolledPastHero]);

  if ((dismissed || !scrolledPastHero) && !chatOpen) return null;

  return (
    <div className="fixed bottom-24 right-5 z-fab flex flex-col items-end gap-2 lg:bottom-5">
      {chatOpen ? (
        <ChatWidget categories={categories} onClose={() => setChatOpen(false)} />
      ) : (
        teaserOpen && (
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
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </button>
            <button onClick={() => setChatOpen(true)} className="text-left">
              {TEASERS[index]}
            </button>
          </div>
        )
      )}
      <button
        onClick={() => setChatOpen((o) => !o)}
        className="flex h-16 w-16 items-center justify-center rounded-full bg-surface shadow-lg ring-1 ring-border transition-transform hover:scale-105"
        style={chatOpen ? undefined : { animation: "mascot-bounce 2.4s ease-in-out infinite" }}
        aria-label={chatOpen ? "Sohbeti kapat" : "Yardım"}
      >
        <MascotIcon size={52} waving={pop} />
      </button>
    </div>
  );
}
