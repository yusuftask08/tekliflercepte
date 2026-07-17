"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
}

export function MessageThread({ offerId, initialMessages, customerId, viewerId }) {
  const router = useRouter();
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  const scrollToBottom = (behavior = "auto") => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior });
  };

  // Jump to the latest message the moment the thread mounts — a chat should
  // always open where the conversation left off, not at its oldest message.
  useEffect(() => {
    scrollToBottom("auto");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Live push via Server-Sent Events — no polling. The API broadcasts a
  // new message to everyone subscribed to this offerId the moment it's
  // created; this just appends it (deduped in case it's an echo of a
  // message we already added optimistically after sending).
  useEffect(() => {
    const source = new EventSource(`/api/offers/${offerId}/messages/stream`);
    source.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
    };
    return () => source.close();
  }, [offerId]);

  useEffect(() => {
    scrollToBottom("smooth");
  }, [messages.length]);

  const send = async () => {
    if (!draft.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/offers/${offerId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: draft }),
      });
      if (res.status === 401) {
        router.push(`/giris?next=/mesajlar/${offerId}`);
        return;
      }
      if (res.ok) {
        const message = await res.json();
        setMessages((prev) => [...prev, message]);
        setDraft("");
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <div ref={scrollRef} className="flex-1 overflow-auto px-4">
        <div className="flex flex-col gap-2.5">
          {messages.map((message) => {
            const isMine = message.senderId === viewerId;
            const isCustomer = message.senderId === customerId;
            return (
              <div key={message.id} className={`max-w-[75%] ${isMine ? "self-end" : "self-start"}`}>
                <div
                  className={
                    isCustomer
                      ? "rounded-[16px_16px_4px_16px] bg-primary px-3.5 py-2.5 text-sm text-text-on-brand"
                      : "rounded-[16px_16px_16px_4px] border border-border bg-surface-raised px-3.5 py-2.5 text-sm"
                  }
                >
                  {message.body}
                </div>
                <div
                  className={`mt-0.5 flex items-center gap-1 text-[10px] text-text-muted ${isMine ? "justify-end" : ""}`}
                >
                  {formatTime(message.createdAt)}
                  {isMine && <span>· {message.readAt ? "Görüldü" : "Gönderildi"}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-2.5 border-t border-border bg-surface px-4 py-3">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Mesaj yaz..."
          className="flex-1 rounded-full bg-bg px-4 py-2.5 text-sm text-text placeholder:text-text-muted"
        />
        <button
          onClick={send}
          disabled={sending}
          aria-label="Mesajı gönder"
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary disabled:opacity-50"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M4 12l16-8-6 8 6 8-16-8Z" fill="var(--color-text-on-brand)" />
          </svg>
        </button>
      </div>
    </>
  );
}
