"use client";

import { useRouter, usePathname } from "next/navigation";
import { SORT_OPTIONS } from "./sort-options";

export function SortSelect({ value }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-text-muted">Sırala:</span>
      <select
        defaultValue={value}
        onChange={(e) => router.push(`${pathname}?sirala=${e.target.value}`)}
        className="rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.key} value={option.key}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
