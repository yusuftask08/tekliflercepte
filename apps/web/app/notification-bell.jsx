"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const POLL_INTERVAL_MS = 25000;

/** A short two-tone chime via Web Audio — avoids shipping/embedding an audio
 *  file for something this simple, and sidesteps autoplay restrictions since
 *  it only ever runs as a result of an already-established page session. */
function playChime() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContextClass();
    [880, 1174.66].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      const start = ctx.currentTime + i * 0.12;
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.exponentialRampToValueAtTime(0.15, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.3);
    });
    setTimeout(() => ctx.close(), 800);
  } catch {
    // Web Audio unsupported/blocked — silently skip the sound, badge still updates.
  }
}

export function NotificationBell() {
  const [count, setCount] = useState(0);
  const previousCount = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      try {
        const res = await fetch("/api/notifications/unread-count");
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        if (previousCount.current !== null && data.count > previousCount.current) {
          playChime();
        }
        previousCount.current = data.count;
        setCount(data.count);
      } catch {
        // transient network error — next poll will retry
      }
    };
    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <Link
      href="/bildirimler"
      aria-label="Bildirimler"
      className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full hover:bg-surface-raised"
    >
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
        <path
          d="M6 8a6 6 0 0 1 12 0c0 4 1.5 5.5 2 6H4c.5-.5 2-2 2-6Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M10 18a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      {count > 0 && (
        <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[9px] font-bold text-white">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
