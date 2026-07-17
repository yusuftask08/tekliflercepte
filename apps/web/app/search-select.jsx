"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@tekliflercepte/ui";

export function SearchSelect({ value, onChange, options, placeholder, disabled }) {
  const [query, setQuery] = useState(value ?? "");
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    setQuery(value ?? "");
  }, [value]);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const filtered = options
    .filter((o) => o.toLocaleLowerCase("tr").includes(query.toLocaleLowerCase("tr")))
    .slice(0, 30);

  return (
    <div ref={rootRef} className="relative">
      <Input
        value={query}
        disabled={disabled}
        maxLength={100}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          if (e.target.value === "") onChange("");
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
      />
      {open && filtered.length > 0 && (
        <ul className="absolute z-dropdown mt-1 max-h-56 w-full overflow-auto rounded-md border border-border bg-surface shadow-md">
          {filtered.map((option) => (
            <li key={option}>
              <button
                type="button"
                onClick={() => {
                  onChange(option);
                  setQuery(option);
                  setOpen(false);
                }}
                className="block w-full px-3.5 py-2.5 text-left text-sm hover:bg-surface-raised"
              >
                {option}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
