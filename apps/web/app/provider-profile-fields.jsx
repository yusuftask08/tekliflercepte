"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Button, Checkbox, Input, Textarea } from "@tekliflercepte/ui";
import { SearchSelect } from "./search-select";
import { TR_LOCATIONS } from "@/lib/turkey-locations";

export const MIN_BIO_LENGTH = 50;
export const MAX_PORTFOLIO_PHOTOS = 5;

// Shared, controlled field groups used by both the first-time onboarding
// wizard (usta/kurulum/onboarding-form.jsx) and the post-onboarding edit
// form on /profil — kept "dumb" (props in, onChange out) so each caller
// owns its own state/submit flow without duplicating this JSX.

export function BusinessTypeField({ businessType, setBusinessType, businessName, setBusinessName }) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="mb-2 block text-sm font-semibold">Bir şirketiniz var mı?</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setBusinessType("SAHIS")}
            className={`rounded-md border px-4 py-4 text-left ${
              businessType === "SAHIS" ? "border-primary bg-brand-50" : "border-border"
            }`}
          >
            <div className="font-semibold">Şahıs</div>
            <div className="text-xs text-text-muted">Bireysel olarak hizmet veriyorum</div>
          </button>
          <button
            type="button"
            onClick={() => setBusinessType("SIRKET")}
            className={`rounded-md border px-4 py-4 text-left ${
              businessType === "SIRKET" ? "border-primary bg-brand-50" : "border-border"
            }`}
          >
            <div className="font-semibold">Şirket</div>
            <div className="text-xs text-text-muted">Bir şirket adına hizmet veriyorum</div>
          </button>
        </div>
      </div>

      {businessType === "SIRKET" && (
        <div>
          <label className="mb-2 block text-sm font-semibold">Şirket / işletme adı</label>
          <Input
            maxLength={100}
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="Örn: Yılmaz Temizlik Hizmetleri"
          />
        </div>
      )}
    </div>
  );
}

export function LocationField({
  city,
  setCity,
  district,
  setDistrict,
  neighborhood,
  setNeighborhood,
  serviceCities,
  setServiceCities,
}) {
  const [neighborhoodOptions, setNeighborhoodOptions] = useState([]);
  const [extraCity, setExtraCity] = useState("");

  useEffect(() => {
    if (!city || !district) {
      setNeighborhoodOptions([]);
      return;
    }
    let cancelled = false;
    fetch(`/api/locations/neighborhoods?il=${encodeURIComponent(city)}&ilce=${encodeURIComponent(district)}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (!cancelled) setNeighborhoodOptions(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setNeighborhoodOptions([]);
      });
    return () => {
      cancelled = true;
    };
  }, [city, district]);

  const addServiceCity = () => {
    if (!extraCity || extraCity === city || serviceCities.includes(extraCity)) return;
    setServiceCities((prev) => [...prev, extraCity]);
    setExtraCity("");
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="mb-2 block text-sm font-semibold">Nerede hizmet veriyorsun?</label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <SearchSelect
            value={city}
            onChange={(value) => {
              setCity(value);
              setDistrict("");
              setNeighborhood("");
            }}
            options={TR_LOCATIONS.map((p) => p.name)}
            placeholder="İl ara..."
          />
          <SearchSelect
            value={district}
            onChange={(value) => {
              setDistrict(value);
              setNeighborhood("");
            }}
            options={TR_LOCATIONS.find((p) => p.name === city)?.districts ?? []}
            placeholder={city ? "İlçe ara..." : "Önce il seç"}
            disabled={!city}
          />
          <SearchSelect
            value={neighborhood}
            onChange={setNeighborhood}
            options={neighborhoodOptions}
            placeholder={district ? "Mahalle ara..." : "Önce ilçe seç"}
            disabled={!district}
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold">
          Ayrıca hizmet verdiğin şehirler (opsiyonel)
        </label>
        <p className="mb-2 text-xs text-text-muted">
          Sadece ana şehrinle sınırlı kalmak zorunda değilsin.
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
                aria-label={`${c} şehrini kaldır`}
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
    </div>
  );
}

export function CategoriesField({ categories, selected, setSelected, experienceYears, setExperienceYears }) {
  const [categorySearch, setCategorySearch] = useState("");

  const toggleCategory = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredCategories = categories
    .map((group) => ({
      ...group,
      children: group.children.filter((sub) =>
        sub.name.toLocaleLowerCase("tr").includes(categorySearch.toLocaleLowerCase("tr"))
      ),
    }))
    .filter((group) => group.children.length > 0 || !categorySearch);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="mb-2 block text-sm font-semibold">Hangi hizmetleri veriyorsun?</label>
        <Input
          maxLength={50}
          value={categorySearch}
          onChange={(e) => setCategorySearch(e.target.value)}
          placeholder="Kategori ara..."
          className="mb-3"
        />
        <div className="flex max-h-72 flex-col gap-5 overflow-auto">
          {filteredCategories.map((group) => (
            <div key={group.id}>
              <div className="mb-2 text-sm font-bold">{group.name}</div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {group.children.map((sub) => (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => toggleCategory(sub.id)}
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
      <div>
        <label className="mb-2 block text-sm font-semibold">Deneyim (yıl, opsiyonel)</label>
        <Input
          type="number"
          min="0"
          max="80"
          value={experienceYears}
          onChange={(e) => setExperienceYears(e.target.value)}
          className="sm:w-40"
        />
      </div>
    </div>
  );
}

export function BioConsentField({ bio, setBio, dataConsent, setDataConsent }) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="mb-2 block text-sm font-semibold">Kendini tanıt</label>
        <p className="mb-2 text-xs text-text-muted">
          Müşterinin dikkatini çekecek, seni farklı yapan şeylerden bahset — deneyimin, uzmanlığın,
          çalışma tarzın gibi.
        </p>
        <Textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          maxLength={600}
          placeholder="Örn: 6 yıldır Kadıköy ve çevresinde ev temizliği yapıyorum, malzemelerimi kendim getiriyorum..."
        />
        <div className={`mt-1 text-xs ${bio.length >= MIN_BIO_LENGTH ? "text-success" : "text-text-muted"}`}>
          {bio.length}/{MIN_BIO_LENGTH} karakter
        </div>
      </div>

      <label className="flex items-start gap-2.5 text-sm">
        <Checkbox checked={dataConsent} onChange={setDataConsent} className="mt-0.5" />
        <span>
          Profil bilgilerimin (isim, fotoğraf, tanıtım yazısı, portföy) müşterilerle ve talep
          eşleşmeleriyle paylaşılmasına, kişisel verilerimin bu amaçla işlenmesine izin veriyorum.
        </span>
      </label>
    </div>
  );
}

export function PortfolioField({ portfolioPhotos, setPortfolioPhotos, loginRedirectPath }) {
  const router = useRouter();
  const [portfolioUploading, setPortfolioUploading] = useState(false);
  const portfolioInputRef = useRef(null);
  const apiOrigin = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

  const uploadPortfolioPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPortfolioUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/uploads", { method: "POST", body: formData });
      if (res.status === 401) {
        router.push(`/giris?next=${loginRedirectPath}`);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setPortfolioPhotos((prev) => [...prev, data.url]);
      } else {
        toast.error("Fotoğraf yüklenemedi, tekrar dene.");
      }
    } finally {
      setPortfolioUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="mb-1 flex items-center justify-between">
        <label className="block text-sm font-semibold">Geçmiş iş fotoğrafları (opsiyonel)</label>
        <span className="text-xs font-semibold text-text-muted">
          {portfolioPhotos.length}/{MAX_PORTFOLIO_PHOTOS}
        </span>
      </div>
      <p className="mb-2 text-xs text-text-muted">
        Yaptığın işlerden kaliteli fotoğraflar profilinde görünür, güven oluşturur.
      </p>
      <div className="flex flex-wrap gap-2.5">
        {portfolioPhotos.map((url) => (
          // eslint-disable-next-line @next/next/no-img-element
          <div key={url} className="relative h-20 w-20">
            <img src={`${apiOrigin}${url}`} alt="" className="h-20 w-20 rounded-md object-cover" />
            <button
              type="button"
              onClick={() => setPortfolioPhotos((prev) => prev.filter((p) => p !== url))}
              aria-label="Fotoğrafı kaldır"
              className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-danger text-xs text-white"
            >
              ✕
            </button>
          </div>
        ))}
        {portfolioPhotos.length < MAX_PORTFOLIO_PHOTOS && (
          <button
            type="button"
            onClick={() => portfolioInputRef.current?.click()}
            disabled={portfolioUploading}
            className="flex h-20 w-20 items-center justify-center rounded-md border-2 border-dashed border-border text-text-muted disabled:opacity-50"
          >
            {portfolioUploading ? (
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
        ref={portfolioInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={uploadPortfolioPhoto}
      />
    </div>
  );
}
