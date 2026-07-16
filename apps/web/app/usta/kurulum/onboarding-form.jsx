"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Button } from "@tekliflercepte/ui";
import { SearchSelect } from "../../search-select";
import { MascotIcon } from "../../mascot-icon";
import { TR_LOCATIONS } from "@/lib/turkey-locations";

const STEP_LABELS = ["İş Türü", "Konum", "Hizmetler", "Fotoğraf", "Tanıtım", "Portföy"];
const MIN_BIO_LENGTH = 50;
const MAX_PORTFOLIO_PHOTOS = 5;

function Header({ step, onBack }) {
  return (
    <>
      <div className="flex items-center gap-3 px-4 pt-6 sm:px-6 lg:px-10">
        <button onClick={onBack} className="text-text" aria-label="Geri">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <div className="flex-1 text-lg font-bold lg:text-xl">Usta Profili Oluştur</div>
        <div className="text-xs font-semibold text-text-muted">
          {step + 1}/{STEP_LABELS.length}
        </div>
      </div>
      <div className="flex gap-1.5 px-4 py-4 sm:px-6 lg:px-10">
        {STEP_LABELS.map((label, i) => (
          <div
            key={label}
            className={`h-[5px] flex-1 rounded-full ${
              i < step ? "bg-primary" : i === step ? "bg-brand-300" : "bg-border"
            }`}
          />
        ))}
      </div>
    </>
  );
}

export function OnboardingForm({ categories, initialProfile, header }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [showWelcome, setShowWelcome] = useState(false);

  // İş Türü
  const [businessType, setBusinessType] = useState(initialProfile?.businessType ?? "");
  const [businessName, setBusinessName] = useState(initialProfile?.businessName ?? "");
  const [taxOffice, setTaxOffice] = useState(initialProfile?.taxOffice ?? "");
  const [taxNumber, setTaxNumber] = useState(initialProfile?.taxNumber ?? "");

  // Konum
  const [city, setCity] = useState(initialProfile?.city ?? "");
  const [district, setDistrict] = useState(initialProfile?.district ?? "");
  const [neighborhood, setNeighborhood] = useState(initialProfile?.neighborhood ?? "");
  const [neighborhoodOptions, setNeighborhoodOptions] = useState([]);
  const [serviceCities, setServiceCities] = useState(initialProfile?.serviceCities ?? []);
  const [extraCity, setExtraCity] = useState("");

  // Hizmetler
  const [selected, setSelected] = useState(
    new Set(initialProfile?.categories?.map((c) => c.categoryId) ?? [])
  );
  const [categorySearch, setCategorySearch] = useState("");
  const [experienceYears, setExperienceYears] = useState(initialProfile?.experienceYears ?? "");

  // Fotoğraf
  const [avatarUrl, setAvatarUrl] = useState(initialProfile?.avatarUrl ?? "");
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Tanıtım
  const [bio, setBio] = useState(initialProfile?.bio ?? "");
  const [dataConsent, setDataConsent] = useState(Boolean(initialProfile?.dataConsentAt));

  // Portföy
  const [portfolioPhotos, setPortfolioPhotos] = useState(initialProfile?.portfolioPhotos ?? []);
  const [portfolioUploading, setPortfolioUploading] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const avatarInputRef = useRef(null);
  const portfolioInputRef = useRef(null);
  const apiOrigin = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

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

  const toggleCategory = (id) => {
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

  const uploadAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
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
        setAvatarUrl(data.url);
      } else {
        toast.error("Fotoğraf yüklenemedi, tekrar dene.");
      }
    } finally {
      setAvatarUploading(false);
      e.target.value = "";
    }
  };

  const uploadPortfolioPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPortfolioUploading(true);
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
      } else {
        toast.error("Fotoğraf yüklenemedi, tekrar dene.");
      }
    } finally {
      setPortfolioUploading(false);
      e.target.value = "";
    }
  };

  const canProceed = [
    Boolean(businessType) && (businessType !== "SIRKET" || businessName.trim().length > 0),
    Boolean(city),
    selected.size > 0,
    true, // face photo is encouraged, not required
    bio.trim().length >= MIN_BIO_LENGTH && dataConsent,
    true, // portfolio optional
  ][step];

  const goBack = () => {
    if (step === 0) router.back();
    else setStep(step - 1);
  };

  const goNext = () => {
    if (step < STEP_LABELS.length - 1) setStep(step + 1);
    else submit();
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/provider-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessType,
          businessName: businessName || undefined,
          taxOffice: taxOffice || undefined,
          taxNumber: taxNumber || undefined,
          city,
          district: district || undefined,
          neighborhood: neighborhood || undefined,
          serviceCities,
          bio,
          experienceYears: experienceYears ? Number(experienceYears) : undefined,
          categoryIds: Array.from(selected),
          portfolioPhotos,
          dataConsent,
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
      if (avatarUrl) {
        await fetch("/api/me", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ avatarUrl }),
        });
      }
      if (initialProfile) {
        // Editing an already-complete profile — no "welcome", just confirm
        // and go back to the panel.
        toast.success("Profilin güncellendi.");
        router.push("/usta/panel");
        router.refresh();
      } else {
        setShowWelcome(true);
      }
    } catch {
      toast.error("Bir bağlantı sorunu oluştu, lütfen tekrar dene.");
    } finally {
      setSubmitting(false);
    }
  };

  if (showWelcome) {
    return (
      <div className="flex min-h-screen flex-col bg-bg">
        {header}
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
          <div style={{ animation: "mascot-bounce 1.4s ease-in-out infinite" }}>
            <MascotIcon size={96} waving />
          </div>
          <h1 className="text-2xl font-extrabold sm:text-3xl">Teklifler Cepte&apos;ye Hoş Geldin! 🎉</h1>
          <p className="max-w-sm text-sm text-text-muted">
            Profilin hazır. Artık sana uygun talepleri görüp ücretsiz teklif vermeye başlayabilirsin.
          </p>
          <Button size="lg" onClick={() => router.push("/usta/panel")}>
            Panele Git →
          </Button>
        </div>
      </div>
    );
  }

  const filteredCategories = categories
    .map((group) => ({
      ...group,
      children: group.children.filter((sub) =>
        sub.name.toLocaleLowerCase("tr").includes(categorySearch.toLocaleLowerCase("tr"))
      ),
    }))
    .filter((group) => group.children.length > 0 || !categorySearch);

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      {header}
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col sm:max-w-xl sm:py-8 lg:max-w-3xl lg:py-14">
        <div className="flex flex-1 flex-col sm:rounded-lg sm:border sm:border-border sm:bg-surface sm:shadow-md lg:shadow-lg">
          <Header step={step} onBack={goBack} />

      <div className="flex-1 px-4 pb-6 sm:px-6 lg:px-10">
        {step === 0 && (
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
              <div className="flex flex-col gap-3">
                <div>
                  <label className="mb-2 block text-sm font-semibold">Şirket Adı</label>
                  <input
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full rounded-md border border-border bg-surface px-3.5 py-3 text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-2 block text-sm font-semibold">Vergi Dairesi</label>
                    <input
                      value={taxOffice}
                      onChange={(e) => setTaxOffice(e.target.value)}
                      className="w-full rounded-md border border-border bg-surface px-3.5 py-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold">Vergi No</label>
                    <input
                      value={taxNumber}
                      onChange={(e) => setTaxNumber(e.target.value)}
                      className="w-full rounded-md border border-border bg-surface px-3.5 py-3 text-sm"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 1 && (
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
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <div>
              <label className="mb-2 block text-sm font-semibold">Hangi hizmetleri veriyorsun?</label>
              <input
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                placeholder="Kategori ara..."
                className="mb-3 w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm"
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
              <input
                type="number"
                min="0"
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
                className="w-full rounded-md border border-border bg-surface px-3.5 py-3 text-sm sm:w-40"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-4">
            <label className="block text-sm font-semibold">Yüzünün net göründüğü bir fotoğraf</label>
            <div className="flex items-center gap-4">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-border bg-surface-raised">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={`${apiOrigin}${avatarUrl}`} alt="" className="h-full w-full object-cover" />
                ) : (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-text-muted">
                    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
                    <path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke="currentColor" strokeWidth="2" />
                  </svg>
                )}
              </div>
              <Button type="button" variant="secondary" onClick={() => avatarInputRef.current?.click()} disabled={avatarUploading}>
                {avatarUploading ? "Yükleniyor..." : avatarUrl ? "Değiştir" : "Fotoğraf Yükle"}
              </Button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={uploadAvatar}
              />
            </div>

            <div className="rounded-md border border-border bg-surface-raised p-3.5 text-xs text-text-muted">
              <div className="mb-1.5 font-semibold text-text">Kaliteli bir fotoğraf için:</div>
              <ul className="flex flex-col gap-1">
                <li>✅ İyi ışıkta, yüzün net ve tek başına görünsün</li>
                <li>✅ Kameraya bakan, gülümseyen bir fotoğraf tercih et</li>
                <li>❌ Güneş gözlüğü, şapka veya filtre kullanma</li>
                <li>❌ Grup fotoğrafından kesip kullanma</li>
              </ul>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col gap-4">
            <div>
              <label className="mb-2 block text-sm font-semibold">Kendini tanıt</label>
              <p className="mb-2 text-xs text-text-muted">
                Müşterinin dikkatini çekecek, seni farklı yapan şeylerden bahset — deneyimin,
                uzmanlığın, çalışma tarzın gibi.
              </p>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                placeholder="Örn: 6 yıldır Kadıköy ve çevresinde ev temizliği yapıyorum, malzemelerimi kendim getiriyorum..."
                className="w-full rounded-md border border-border bg-surface px-3.5 py-3 text-sm"
              />
              <div className={`mt-1 text-xs ${bio.length >= MIN_BIO_LENGTH ? "text-success" : "text-text-muted"}`}>
                {bio.length}/{MIN_BIO_LENGTH} karakter
              </div>
            </div>

            <label className="flex items-start gap-2.5 text-sm">
              <input
                type="checkbox"
                checked={dataConsent}
                onChange={(e) => setDataConsent(e.target.checked)}
                className="mt-0.5"
              />
              <span>
                Profil bilgilerimin (isim, fotoğraf, tanıtım yazısı, portföy) müşterilerle ve
                talep eşleşmeleriyle paylaşılmasına, kişisel verilerimin bu amaçla işlenmesine
                izin veriyorum.
              </span>
            </label>
          </div>
        )}

        {step === 5 && (
          <div className="flex flex-col gap-2">
            <label className="mb-1 block text-sm font-semibold">
              Geçmiş iş fotoğrafları (opsiyonel, en fazla {MAX_PORTFOLIO_PHOTOS})
            </label>
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
        )}
      </div>

          <div className="border-t border-border px-4 py-4 sm:px-6 lg:px-10">
            <Button size="lg" className="w-full" disabled={!canProceed || submitting} onClick={goNext}>
              {submitting
                ? "Kaydediliyor..."
                : step === STEP_LABELS.length - 1
                  ? "Profili Tamamla"
                  : "Devam Et"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
