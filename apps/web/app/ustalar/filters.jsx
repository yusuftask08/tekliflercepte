"use client";

import { useRouter } from "next/navigation";
import { TR_LOCATIONS } from "../../lib/turkey-locations";
import { SearchSelect } from "../search-select";

const CITY_NAMES = TR_LOCATIONS.map((l) => l.name);

export function Filters({ city, kategori, q, categories }) {
  const router = useRouter();

  const pushParams = (next) => {
    const params = new URLSearchParams();
    if (next.city) params.set("sehir", next.city);
    if (next.kategori) params.set("kategori", next.kategori);
    if (next.q) params.set("q", next.q);
    router.push(`/ustalar${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <SearchSelect
        value={city ?? ""}
        onChange={(value) => pushParams({ city: value, kategori, q })}
        options={CITY_NAMES}
        placeholder="Şehir seç"
      />

      <select
        value={kategori ?? ""}
        onChange={(e) => pushParams({ city, kategori: e.target.value, q })}
        className="w-full rounded-md border border-border bg-surface px-3.5 py-3.5 text-sm"
      >
        <option value="">Tüm kategoriler</option>
        {categories.map((group) => (
          <optgroup key={group.id} label={group.name}>
            <option value={group.slug}>{group.name} (tümü)</option>
            {group.children.map((sub) => (
              <option key={sub.id} value={sub.slug}>
                {sub.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>

      <input
        defaultValue={q ?? ""}
        onKeyDown={(e) => {
          if (e.key === "Enter") pushParams({ city, kategori, q: e.currentTarget.value });
        }}
        onBlur={(e) => pushParams({ city, kategori, q: e.currentTarget.value })}
        placeholder="Usta ismiyle ara"
        className="w-full rounded-md border border-border bg-surface px-3.5 py-3.5 text-sm"
      />
    </div>
  );
}
