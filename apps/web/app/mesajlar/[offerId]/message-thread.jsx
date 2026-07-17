"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Lightbox } from "@tekliflercepte/ui";
import { useBlocked } from "./message-panel";

const PAGE_SIZE = 30;
const MAX_BODY_LENGTH = 2000;
const TYPING_PING_INTERVAL_MS = 2000;
const TYPING_DISPLAY_MS = 3000;

const API_ORIGIN = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
}

function imageSrc(url) {
  return url?.startsWith("http") ? url : `${API_ORIGIN}${url}`;
}

export function MessageThread({ offerId, initialMessages, customerId, viewerId }) {
  const router = useRouter();
  const [blocked] = useBlocked();
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [pendingImageUrl, setPendingImageUrl] = useState(null);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [hasMoreOlder, setHasMoreOlder] = useState(initialMessages.length === PAGE_SIZE);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState(null);

  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);
  const messagesRef = useRef(messages);
  const lastMessageIdRef = useRef(messages[messages.length - 1]?.id);
  const prevScrollHeightRef = useRef(null);
  const typingCooldownRef = useRef(null);
  const typingHideTimeoutRef = useRef(null);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const scrollToBottom = (behavior = "auto") => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior });
  };

  // Jump to the latest message the moment the thread mounts — a chat should
  // always open where the conversation left off, not at its oldest message.
  useEffect(() => {
    scrollToBottom("auto");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Only auto-scroll when a new message actually lands at the end — a
  // "load older" prepend also changes messages.length/reference but must
  // not yank the view back down to the bottom.
  useEffect(() => {
    const lastId = messages[messages.length - 1]?.id;
    if (lastId !== lastMessageIdRef.current) {
      scrollToBottom("smooth");
      lastMessageIdRef.current = lastId;
    }
  }, [messages]);

  // Restores scroll position after prepending older messages so the
  // viewport doesn't jump — captured just before the fetch resolves in
  // loadOlder(), consumed here once the DOM has the new (taller) content.
  useLayoutEffect(() => {
    if (prevScrollHeightRef.current != null && scrollRef.current) {
      scrollRef.current.scrollTop += scrollRef.current.scrollHeight - prevScrollHeightRef.current;
      prevScrollHeightRef.current = null;
    }
  }, [messages]);

  const loadOlder = async () => {
    if (loadingOlder || !hasMoreOlder || messages.length === 0) return;
    setLoadingOlder(true);
    try {
      prevScrollHeightRef.current = scrollRef.current?.scrollHeight ?? null;
      const res = await fetch(`/api/offers/${offerId}/messages?before=${messages[0].id}&take=${PAGE_SIZE}`);
      if (!res.ok) return;
      const older = await res.json();
      setHasMoreOlder(older.length === PAGE_SIZE);
      setMessages((prev) => [...older, ...prev]);
    } finally {
      setLoadingOlder(false);
    }
  };

  // Live push via Server-Sent Events — no polling. The API broadcasts a
  // new message (or a typing ping) to everyone subscribed to this offerId;
  // `kind` tells the two apart. onerror + a visibility listener cover the
  // gap a dropped connection can leave: resync() re-fetches anything
  // published since the last message we already have.
  useEffect(() => {
    let resyncTimeout;

    const resync = async () => {
      const last = messagesRef.current[messagesRef.current.length - 1];
      const qs = last ? `?since=${encodeURIComponent(last.createdAt)}` : "";
      try {
        const res = await fetch(`/api/offers/${offerId}/messages${qs}`);
        if (!res.ok) return;
        const fresh = await res.json();
        setMessages((prev) => {
          const ids = new Set(prev.map((m) => m.id));
          const toAdd = fresh.filter((m) => !ids.has(m.id));
          return toAdd.length ? [...prev, ...toAdd] : prev;
        });
      } catch {
        // best-effort — next reconnect or visibility change retries
      }
    };

    const source = new EventSource(`/api/offers/${offerId}/messages/stream`);
    source.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.kind === "typing") {
        if (data.userId === viewerId) return;
        setOtherTyping(true);
        clearTimeout(typingHideTimeoutRef.current);
        typingHideTimeoutRef.current = setTimeout(() => setOtherTyping(false), TYPING_DISPLAY_MS);
        return;
      }
      setMessages((prev) => (prev.some((m) => m.id === data.id) ? prev : [...prev, data]));
    };
    source.onerror = () => {
      clearTimeout(resyncTimeout);
      resyncTimeout = setTimeout(resync, 1000);
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") resync();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      source.close();
      clearTimeout(resyncTimeout);
      clearTimeout(typingHideTimeoutRef.current);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [offerId, viewerId]);

  const pingTyping = () => {
    if (typingCooldownRef.current) return;
    fetch(`/api/offers/${offerId}/typing`, { method: "POST" }).catch(() => {});
    typingCooldownRef.current = setTimeout(() => {
      typingCooldownRef.current = null;
    }, TYPING_PING_INTERVAL_MS);
  };

  const onDraftChange = (value) => {
    setDraft(value);
    if (value.trim()) pingTyping();
  };

  const uploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/uploads", { method: "POST", body: formData });
      if (res.status === 401) {
        router.push(`/giris?next=/mesajlar/${offerId}`);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setPendingImageUrl(data.url);
      } else {
        toast.error("Fotoğraf yüklenemedi, tekrar dene.");
      }
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const send = async () => {
    if (!draft.trim() && !pendingImageUrl) return;
    setSending(true);
    try {
      const res = await fetch(`/api/offers/${offerId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: draft.trim() || undefined, imageUrl: pendingImageUrl || undefined }),
      });
      if (res.status === 401) {
        router.push(`/giris?next=/mesajlar/${offerId}`);
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Mesaj gönderilemedi, tekrar dene.");
        return;
      }
      setMessages((prev) => [...prev, data]);
      setDraft("");
      setPendingImageUrl(null);
    } catch {
      toast.error("Bir bağlantı sorunu oluştu, lütfen tekrar dene.");
    } finally {
      setSending(false);
    }
  };

  const inputDisabled = sending || blocked;

  return (
    <>
      <div ref={scrollRef} className="flex-1 overflow-auto px-4">
        <div className="flex flex-col gap-2.5">
          {hasMoreOlder && (
            <button
              type="button"
              onClick={loadOlder}
              disabled={loadingOlder}
              className="mx-auto mt-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text-muted hover:border-primary disabled:opacity-50"
            >
              {loadingOlder ? "Yükleniyor..." : "Daha eski mesajları yükle"}
            </button>
          )}
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
                  {message.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imageSrc(message.imageUrl)}
                      alt=""
                      onClick={() => setLightboxSrc(imageSrc(message.imageUrl))}
                      className="mb-1 max-h-56 max-w-full cursor-pointer rounded-md object-cover"
                    />
                  )}
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
          {otherTyping && <div className="self-start text-xs text-text-muted">yazıyor...</div>}
        </div>
      </div>

      {blocked && (
        <div className="border-t border-border bg-warning/10 px-4 py-2 text-xs text-warning">
          Bu kişiyi engellediniz, mesaj gönderemezsin.
        </div>
      )}

      {pendingImageUrl && (
        <div className="flex items-center gap-2 border-t border-border bg-surface px-4 py-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageSrc(pendingImageUrl)} alt="" className="h-12 w-12 rounded-md object-cover" />
          <button
            type="button"
            onClick={() => setPendingImageUrl(null)}
            className="text-xs font-semibold text-danger"
          >
            Kaldır
          </button>
        </div>
      )}

      <div className="flex items-center gap-2 border-t border-border bg-surface px-4 py-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={inputDisabled || uploading}
          aria-label="Fotoğraf ekle"
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-text-muted hover:bg-surface-raised disabled:opacity-50"
        >
          {uploading ? "…" : "📎"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={uploadImage}
        />
        <input
          value={draft}
          onChange={(e) => onDraftChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          disabled={inputDisabled}
          maxLength={MAX_BODY_LENGTH}
          placeholder={blocked ? "Bu kişiyi engellediniz" : "Mesaj yaz..."}
          className="flex-1 rounded-full bg-bg px-4 py-2.5 text-sm text-text placeholder:text-text-muted disabled:opacity-50"
        />
        <button
          onClick={send}
          disabled={inputDisabled}
          aria-label="Mesajı gönder"
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary disabled:opacity-50"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M4 12l16-8-6 8 6 8-16-8Z" fill="var(--color-text-on-brand)" />
          </svg>
        </button>
      </div>

      <Lightbox
        images={lightboxSrc ? [lightboxSrc] : []}
        index={lightboxSrc ? 0 : null}
        onClose={() => setLightboxSrc(null)}
        onNavigate={() => {}}
      />
    </>
  );
}
