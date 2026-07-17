"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export function HeroSearch({ categories }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const q = query.trim().toLocaleLowerCase("tr");
  const results =
    q.length < 2
      ? []
      : categories
          .flatMap((group) =>
            group.children.map((sub) => ({ group, sub }))
          )
          .filter(({ sub }) => sub.name.toLocaleLowerCase("tr").includes(q))
          .slice(0, 8);

  const goTo = ({ group, sub }) => {
    router.push(`/talep-olustur?kategori=${group.slug}&hizmet=${sub.slug}`);
  };

  return (
    <div ref={rootRef} className="relative w-full max-w-xl">
      <div className="flex items-center gap-3 rounded-md bg-white px-4 py-3.5 shadow-md">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-text-muted">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
          <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          value={query}
          maxLength={100}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Ne arıyorsun? Örn: Ev temizliği, boya badana..."
          className="flex-1 text-sm text-text placeholder:text-text-muted focus:outline-none"
        />
      </div>

      {open && results.length > 0 && (
        <ul className="absolute z-10 mt-1.5 w-full overflow-hidden rounded-md bg-surface shadow-lg ring-1 ring-border">
          {results.map(({ group, sub }) => (
            <li key={sub.id}>
              <button
                type="button"
                onClick={() => goTo({ group, sub })}
                className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-surface-raised"
              >
                <span>{sub.name}</span>
                <span className="text-xs text-text-muted">{group.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
