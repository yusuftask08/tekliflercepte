"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Button } from "@tekliflercepte/ui";
import { SearchSelect } from "../../search-select";
import { TR_LOCATIONS } from "@/lib/turkey-locations";

export function OnboardingForm({ categories, initialProfile }) {
  const router = useRouter();
  const [selected, setSelected] = useState(
    new Set(initialProfile?.categories?.map((c) => c.categoryId) ?? [])
  );
  const [city, setCity] = useState(initialProfile?.city ?? "");
  const [district, setDistrict] = useState(initialProfile?.district ?? "");
  const [serviceCities, setServiceCities] = useState(initialProfile?.serviceCities ?? []);
  const [extraCity, setExtraCity] = useState("");
  const [bio, setBio] = useState(initialProfile?.bio ?? "");
  const [experienceYears, setExperienceYears] = useState(initialProfile?.experienceYears ?? "");
  const [portfolioPhotos, setPortfolioPhotos] = useState(initialProfile?.portfolioPhotos ?? []);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const apiOrigin = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

  const toggle = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const addServiceCity = () => {
    if (!extraCity || extraCity === city || serviceCities.includes(extraCity)) return;
    setServiceCities((prev) => [...prev, extraCity]);
    setExtraCity("");
  };

  const uploadPortfolioPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/uploads", { method: "POST", body: formData });
      if (res.status === 401) {
        router.push("/giris?next=/usta/kurulum");
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setPortfolioPhotos((prev) => [...prev, data.url]);
      }
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/provider-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city,
          district: district || undefined,
          serviceCities,
          bio: bio || undefined,
          experienceYears: experienceYears ? Number(experienceYears) : undefined,
          categoryIds: Array.from(selected),
          portfolioPhotos,
        }),
      });
      if (res.status === 401) {
        router.push("/giris?next=/usta/kurulum");
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Profil kaydedilemedi, lütfen tekrar dene.");
        return;
      }
      router.push("/usta/panel");
      router.refresh();
    } catch {
      toast.error("Bir bağlantı sorunu oluştu, lütfen tekrar dene.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-6">
      <div>
        <label className="mb-2 block text-sm font-semibold">Hangi hizmetleri veriyorsun?</label>
        <p className="mb-3 text-xs text-text-muted">Birden fazla seçebilirsin.</p>
        <div className="flex flex-col gap-5">
          {categories.map((group) => (
            <div key={group.id}>
              <div className="mb-2 text-sm font-bold">{group.name}</div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {group.children.map((sub) => (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => toggle(sub.id)}
                    className={`rounded-md border px-3 py-2 text-left text-sm ${
                      selected.has(sub.id) ? "border-primary bg-brand-50 font-semibold" : "border-border"
                    }`}
                  >
                    {sub.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold">Ana Şehir</label>
          <SearchSelect
            value={city}
            onChange={(value) => {
              setCity(value);
              setDistrict("");
            }}
            options={TR_LOCATIONS.map((p) => p.name)}
            placeholder="İl ara..."
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold">İlçe (opsiyonel)</label>
          <SearchSelect
            value={district}
            onChange={setDistrict}
            options={TR_LOCATIONS.find((p) => p.name === city)?.districts ?? []}
            placeholder={city ? "İlçe ara..." : "Önce il seç"}
            disabled={!city}
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold">Ayrıca hizmet verdiğin şehirler (opsiyonel)</label>
        <p className="mb-2 text-xs text-text-muted">
          Sadece ana şehrinle sınırlı kalmak zorunda değilsin — gittiğin başka şehirleri de ekle,
          oradaki taleplerde de görün.
        </p>
        <div className="flex flex-wrap gap-2">
          {serviceCities.map((c) => (
            <span
              key={c}
              className="flex items-center gap-1.5 rounded-full bg-brand-100 px-3 py-1.5 text-xs font-semibold text-brand-700"
            >
              {c}
              <button
                type="button"
                onClick={() => setServiceCities((prev) => prev.filter((x) => x !== c))}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          <div className="flex-1">
            <SearchSelect
              value={extraCity}
              onChange={setExtraCity}
              options={TR_LOCATIONS.map((p) => p.name).filter(
                (n) => n !== city && !serviceCities.includes(n)
              )}
              placeholder="Başka bir il ara..."
            />
          </div>
          <Button type="button" variant="secondary" onClick={addServiceCity}>
            Ekle
          </Button>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold">Deneyim (yıl, opsiyonel)</label>
        <input
          type="number"
          min="0"
          value={experienceYears}
          onChange={(e) => setExperienceYears(e.target.value)}
          className="w-full rounded-md border border-border bg-surface px-3.5 py-3 text-sm sm:w-40"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold">Kendini tanıt (opsiyonel)</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          placeholder="Örn: 6 yıldır Kadıköy ve çevresinde ev temizliği yapıyorum..."
          className="w-full rounded-md border border-border bg-surface px-3.5 py-3 text-sm"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold">
          Geçmiş iş fotoğrafları (opsiyonel, en fazla 6)
        </label>
        <p className="mb-2 text-xs text-text-muted">
          Yaptığın işlerden fotoğraflar profilinde görünür, güven oluşturur.
        </p>
        <div className="flex flex-wrap gap-2.5">
          {portfolioPhotos.map((url) => (
            // eslint-disable-next-line @next/next/no-img-element
            <div key={url} className="relative h-20 w-20">
              <img src={`${apiOrigin}${url}`} alt="" className="h-20 w-20 rounded-md object-cover" />
              <button
                type="button"
                onClick={() => setPortfolioPhotos((prev) => prev.filter((p) => p !== url))}
                className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-danger text-xs text-white"
              >
                ✕
              </button>
            </div>
          ))}
          {portfolioPhotos.length < 6 && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex h-20 w-20 items-center justify-center rounded-md border-2 border-dashed border-border text-text-muted disabled:opacity-50"
            >
              {uploading ? (
                <span className="text-xs">...</span>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              )}
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={uploadPortfolioPhoto}
        />
      </div>

      <Button type="submit" size="lg" disabled={submitting || selected.size === 0 || !city}>
        {submitting ? "Kaydediliyor..." : "Kaydet ve Panele Git"}
      </Button>
    </form>
  );
}
