"use client";

import { useState } from "react";
import Link from "next/link";
import { MascotIcon } from "./mascot-icon";

/** Rule-based conversation over real category data from the DB — no AI/LLM
 *  call, just a small scripted decision tree. Kept separate from the actual
 *  category-fetching logic so a real model can be dropped in later without
 *  reworking the UI. */
export function ChatWidget({ categories, onClose }) {
  const [screen, setScreen] = useState("start");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSub, setSelectedSub] = useState(null);
  const [history, setHistory] = useState([{ from: "bot", text: "Merhaba! Sana nasıl yardımcı olabilirim?" }]);

  const say = (text) => setHistory((h) => [...h, { from: "bot", text }]);
  const choose = (label) => setHistory((h) => [...h, { from: "user", text: label }]);

  const pickHizmetAlmak = () => {
    choose("Hizmet almak istiyorum");
    say("Hangi kategoride yardım arıyorsun?");
    setScreen("category");
  };

  const pickUstaOlmak = () => {
    choose("Usta olarak teklif vermek istiyorum");
    say("Harika! Teklif vermek tamamen ücretsiz, komisyon da yok. Hemen kayıt olabilirsin.");
    setScreen("provider");
  };

  const pickCategory = (category) => {
    choose(category.name);
    say(`${category.name} içinde tam olarak ne arıyorsun?`);
    setSelectedCategory(category);
    setScreen("subcategory");
  };

  const pickSubcategory = (sub) => {
    choose(sub.name);
    say(`Süper, hemen "${sub.name}" için ücretsiz teklif almaya başlayalım`);
    setSelectedSub(sub);
    setScreen("done");
  };

  const restart = () => {
    setHistory([{ from: "bot", text: "Merhaba! Sana nasıl yardımcı olabilirim?" }]);
    setSelectedCategory(null);
    setSelectedSub(null);
    setScreen("start");
  };

  return (
    <div className="flex h-[420px] w-[320px] flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-lg sm:w-[360px]">
      <div className="flex items-center gap-2.5 border-b border-border bg-bg px-4 py-3">
        <MascotIcon size={32} />
        <div className="flex-1">
          <div className="text-sm font-bold">Teklifler Cepte</div>
          <div className="flex items-center gap-1 text-[11px] text-success">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-success" />
            Yardımcı
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-full text-text-muted hover:bg-surface-raised"
          aria-label="Kapat"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-auto px-4 py-3">
        <div className="flex flex-col gap-2.5">
          {history.map((msg, i) => (
            <div key={i} className={`max-w-[80%] ${msg.from === "user" ? "self-end" : "self-start"}`}>
              <div
                className={
                  msg.from === "user"
                    ? "rounded-[14px_14px_2px_14px] bg-primary px-3.5 py-2 text-sm text-text-on-brand"
                    : "rounded-[14px_14px_14px_2px] border border-border bg-bg px-3.5 py-2 text-sm"
                }
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5 border-t border-border px-3 py-3">
        {screen === "start" && (
          <>
            <OptionButton onClick={pickHizmetAlmak}>Hizmet almak istiyorum</OptionButton>
            <OptionButton onClick={pickUstaOlmak}>Usta olarak teklif vermek istiyorum</OptionButton>
          </>
        )}

        {screen === "category" && (
          <div className="flex max-h-32 flex-col gap-1.5 overflow-auto">
            {categories.map((category) => (
              <OptionButton key={category.id} onClick={() => pickCategory(category)}>
                {category.name}
              </OptionButton>
            ))}
          </div>
        )}

        {screen === "subcategory" && selectedCategory && (
          <div className="flex max-h-32 flex-col gap-1.5 overflow-auto">
            {selectedCategory.children.map((sub) => (
              <OptionButton key={sub.id} onClick={() => pickSubcategory(sub)}>
                {sub.name}
              </OptionButton>
            ))}
            <Link
              href={`/talep-olustur?kategori=${selectedCategory.slug}`}
              className="rounded-md border border-border px-3 py-2 text-left text-sm text-text-muted hover:bg-surface-raised"
            >
              Genel {selectedCategory.name} teklifi istiyorum
            </Link>
          </div>
        )}

        {screen === "done" && selectedCategory && (
          <Link
            href={`/talep-olustur?kategori=${selectedCategory.slug}${selectedSub ? `&hizmet=${selectedSub.slug}` : ""}`}
            className="rounded-md bg-primary px-3.5 py-2.5 text-center text-sm font-bold text-text-on-brand"
          >
            Devam Et →
          </Link>
        )}

        {screen === "provider" && (
          <Link
            href="/kayit?rol=usta"
            className="rounded-md bg-primary px-3.5 py-2.5 text-center text-sm font-bold text-text-on-brand"
          >
            Usta Kaydı Yap →
          </Link>
        )}

        {screen !== "start" && (
          <button onClick={restart} className="mt-0.5 text-center text-xs text-text-muted hover:text-primary">
            Baştan başla
          </button>
        )}
      </div>
    </div>
  );
}

function OptionButton({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="rounded-md border border-border px-3 py-2 text-left text-sm hover:border-primary hover:bg-brand-50"
    >
      {children}
    </button>
  );
}
