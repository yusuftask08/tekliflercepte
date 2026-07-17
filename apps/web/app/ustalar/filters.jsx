"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Input } from "@tekliflercepte/ui";
import { TR_LOCATIONS } from "../../lib/turkey-locations";
import { SearchSelect } from "../search-select";

const CITY_NAMES = TR_LOCATIONS.map((l) => l.name);

// Bucketed bands (matching the minPuan <select> pattern) rather than two
// free-form min/max inputs — avgPrice isn't something users think in exact
// numbers about, a handful of ranges is enough.
const PRICE_BANDS = [
  { value: "", label: "Tüm fiyatlar" },
  { value: "0-500", label: "500 ₺ altı" },
  { value: "500-1500", label: "500-1500 ₺" },
  { value: "1500-", label: "1500 ₺ üstü" },
];

export function Filters({ city, kategori, q, sirala, minPuan, fiyat, categories }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [locating, setLocating] = useState(false);

  const pushParams = (next) => {
    const params = new URLSearchParams();
    if (next.city) params.set("sehir", next.city);
    if (next.kategori) params.set("kategori", next.kategori);
    if (next.q) params.set("q", next.q);
    if (next.sirala) params.set("sirala", next.sirala);
    if (next.minPuan) params.set("minPuan", next.minPuan);
    if (next.fiyat) params.set("fiyat", next.fiyat);
    startTransition(() => {
      router.push(`/ustalar${params.toString() ? `?${params.toString()}` : ""}`);
    });
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Tarayıcın konum özelliğini desteklemiyor.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(`/api/locations/reverse-geocode?lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          if (data.city) {
            pushParams({ city: data.city, kategori, q, sirala, minPuan, fiyat });
          } else {
            toast.error("Konumun bir şehirle eşleştirilemedi.");
          }
        } catch {
          toast.error("Konum alınırken bir sorun oluştu.");
        } finally {
          setLocating(false);
        }
      },
      () => {
        toast.error("Konum izni verilmedi.");
        setLocating(false);
      },
      { timeout: 10000 }
    );
  };

  return (
    <fieldset
      disabled={isPending}
      className={`grid grid-cols-1 gap-3 border-0 p-0 sm:grid-cols-2 lg:grid-cols-3 ${
        isPending ? "opacity-60" : ""
      }`}
    >
      <div className="flex gap-2">
        <div className="flex-1">
          <SearchSelect
            value={city ?? ""}
            onChange={(value) => pushParams({ city: value, kategori, q, sirala, minPuan, fiyat })}
            options={CITY_NAMES}
            placeholder="Şehir seç"
          />
        </div>
        <button
          type="button"
          onClick={useMyLocation}
          disabled={locating}
          title="Yakınımı Kullan"
          aria-label="Yakınımı Kullan"
          className="flex-shrink-0 rounded-md border border-border bg-surface px-3.5 text-sm disabled:opacity-50"
        >
          {locating ? "…" : "📍"}
        </button>
      </div>

      <select
        value={kategori ?? ""}
        onChange={(e) => pushParams({ city, kategori: e.target.value, q, sirala, minPuan, fiyat })}
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

      <Input
        defaultValue={q ?? ""}
        maxLength={100}
        onKeyDown={(e) => {
          if (e.key === "Enter")
            pushParams({ city, kategori, q: e.currentTarget.value, sirala, minPuan, fiyat });
        }}
        onBlur={(e) => pushParams({ city, kategori, q: e.currentTarget.value, sirala, minPuan, fiyat })}
        placeholder="Usta veya işletme ismiyle ara"
      />

      <select
        value={sirala ?? ""}
        onChange={(e) => pushParams({ city, kategori, q, sirala: e.target.value, minPuan, fiyat })}
        className="w-full rounded-md border border-border bg-surface px-3.5 py-3.5 text-sm"
      >
        <option value="">Puana Göre</option>
        <option value="new">Yeni Ustalar</option>
      </select>

      <select
        value={minPuan ?? ""}
        onChange={(e) => pushParams({ city, kategori, q, sirala, minPuan: e.target.value, fiyat })}
        className="w-full rounded-md border border-border bg-surface px-3.5 py-3.5 text-sm"
      >
        <option value="">Tüm puanlar</option>
        <option value="4">4+ yıldız</option>
        <option value="3">3+ yıldız</option>
      </select>

      <select
        value={fiyat ?? ""}
        onChange={(e) => pushParams({ city, kategori, q, sirala, minPuan, fiyat: e.target.value })}
        className="w-full rounded-md border border-border bg-surface px-3.5 py-3.5 text-sm"
      >
        {PRICE_BANDS.map((band) => (
          <option key={band.value} value={band.value}>
            {band.label}
          </option>
        ))}
      </select>
    </fieldset>
  );
}
