"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Button } from "@tekliflercepte/ui";
import { MascotIcon } from "../../mascot-icon";
import {
  BusinessTypeField,
  LocationField,
  CategoriesField,
  BioConsentField,
  PortfolioField,
  MIN_BIO_LENGTH,
} from "../../provider-profile-fields";
import { submitProviderProfile, submitAvatarUrl } from "../../provider-profile-submit";

const STEP_LABELS = ["İş Türü", "Konum", "Hizmetler", "Fotoğraf", "Tanıtım", "Portföy"];
const LOGIN_REDIRECT = "/usta/kurulum";

function TipIcon({ ok }) {
  return (
    <span
      className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full ${
        ok ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
      }`}
    >
      {ok ? (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
          <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )}
    </span>
  );
}

function PhotoExample({ ok, label }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className={`relative flex h-16 w-16 items-center justify-center rounded-full ${
          ok ? "bg-success/10" : "bg-danger/10"
        }`}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="9" r="4.5" stroke={ok ? "var(--color-success)" : "var(--color-danger)"} strokeWidth="1.8" />
          {ok ? (
            <path d="M9 9.3c.6.5 1.4.8 2.3.8s1.7-.3 2.3-.8" stroke="var(--color-success)" strokeWidth="1.6" strokeLinecap="round" />
          ) : (
            <>
              <path d="M8 8h3M13 8h3" stroke="var(--color-danger)" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M9.5 11h5" stroke="var(--color-danger)" strokeWidth="1.6" strokeLinecap="round" />
            </>
          )}
          <path d="M5 20c0-3.5 3.1-6 7-6s7 2.5 7 6" stroke={ok ? "var(--color-success)" : "var(--color-danger)"} strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <span
          className={`absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-white ${
            ok ? "bg-success" : "bg-danger"
          }`}
        >
          {ok ? (
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          )}
        </span>
      </div>
      <span className={`text-[11px] font-semibold ${ok ? "text-success" : "text-danger"}`}>{label}</span>
    </div>
  );
}

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

export function OnboardingForm({ categories, initialProfile }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [showWelcome, setShowWelcome] = useState(false);

  // İş Türü
  const [businessType, setBusinessType] = useState(initialProfile?.businessType ?? "");
  const [businessName, setBusinessName] = useState(initialProfile?.businessName ?? "");

  // Konum
  const [city, setCity] = useState(initialProfile?.city ?? "");
  const [district, setDistrict] = useState(initialProfile?.district ?? "");
  const [neighborhood, setNeighborhood] = useState(initialProfile?.neighborhood ?? "");
  const [serviceCities, setServiceCities] = useState(initialProfile?.serviceCities ?? []);

  // Hizmetler
  const [selected, setSelected] = useState(
    new Set(initialProfile?.categories?.map((c) => c.categoryId) ?? [])
  );
  const [experienceYears, setExperienceYears] = useState(initialProfile?.experienceYears ?? "");

  // Fotoğraf
  const [avatarUrl, setAvatarUrl] = useState(initialProfile?.avatarUrl ?? "");
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Tanıtım
  const [bio, setBio] = useState(initialProfile?.bio ?? "");
  const [dataConsent, setDataConsent] = useState(Boolean(initialProfile?.dataConsentAt));

  // Portföy
  const [portfolioPhotos, setPortfolioPhotos] = useState(initialProfile?.portfolioPhotos ?? []);

  const [submitting, setSubmitting] = useState(false);
  const avatarInputRef = useRef(null);
  const apiOrigin = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

  const uploadAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/uploads", { method: "POST", body: formData });
      if (res.status === 401) {
        router.push(`/giris?next=${LOGIN_REDIRECT}`);
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

  const canProceed = [
    Boolean(businessType),
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
      const { ok } = await submitProviderProfile(
        {
          businessType,
          businessName: businessName || undefined,
          city,
          district: district || undefined,
          neighborhood: neighborhood || undefined,
          serviceCities,
          bio,
          experienceYears: experienceYears ? Number(experienceYears) : undefined,
          categoryIds: Array.from(selected),
          portfolioPhotos,
          dataConsent,
        },
        { router, loginRedirectPath: LOGIN_REDIRECT }
      );
      if (!ok) return;

      if (avatarUrl) await submitAvatarUrl(avatarUrl);

      if (initialProfile) {
        // Editing an already-complete profile — no "welcome", just confirm
        // and go back to the panel.
        toast.success("Profilin güncellendi.");
        router.push("/usta/panel");
        router.refresh();
      } else {
        setShowWelcome(true);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (showWelcome) {
    return (
      <div className="flex min-h-screen flex-col bg-bg">
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
          <div style={{ animation: "mascot-bounce 1.4s ease-in-out infinite" }}>
            <MascotIcon size={96} waving />
          </div>
          <h1 className="text-2xl font-extrabold sm:text-3xl">Teklifler Cepte&apos;ye Hoş Geldin!</h1>
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

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col sm:max-w-xl sm:py-8 lg:max-w-3xl lg:py-14">
        <div className="flex flex-1 flex-col sm:rounded-lg sm:border sm:border-border sm:bg-surface sm:shadow-md lg:shadow-lg">
          <Header step={step} onBack={goBack} />

          <div className="flex-1 px-4 pb-6 sm:px-6 lg:px-10">
            {step === 0 && (
              <BusinessTypeField
                businessType={businessType}
                setBusinessType={setBusinessType}
                businessName={businessName}
                setBusinessName={setBusinessName}
              />
            )}

            {step === 1 && (
              <LocationField
                city={city}
                setCity={setCity}
                district={district}
                setDistrict={setDistrict}
                neighborhood={neighborhood}
                setNeighborhood={setNeighborhood}
                serviceCities={serviceCities}
                setServiceCities={setServiceCities}
              />
            )}

            {step === 2 && (
              <CategoriesField
                categories={categories}
                selected={selected}
                setSelected={setSelected}
                experienceYears={experienceYears}
                setExperienceYears={setExperienceYears}
              />
            )}

            {step === 3 && (
              <div className="mx-auto flex max-w-sm flex-col items-center gap-5 py-4 text-center">
                <div>
                  <label className="block text-sm font-semibold">Yüzünün net göründüğü bir fotoğraf</label>
                  <p className="mt-1 text-xs text-text-muted">Profilinde müşterinin ilk göreceği şey bu.</p>
                </div>

                <div className="relative">
                  <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border border-border bg-surface-raised">
                    {avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={`${apiOrigin}${avatarUrl}`} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" className="text-text-muted">
                        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
                        <path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke="currentColor" strokeWidth="2" />
                      </svg>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={avatarUploading}
                    aria-label={avatarUrl ? "Fotoğrafı değiştir" : "Fotoğraf yükle"}
                    className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-text-on-brand shadow-md disabled:opacity-50"
                  >
                    {avatarUploading ? (
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinejoin="round"
                        />
                        <circle cx="12" cy="13" r="3.2" stroke="currentColor" strokeWidth="1.8" />
                      </svg>
                    )}
                  </button>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={uploadAvatar}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={avatarUploading}
                  className="text-sm font-semibold text-primary disabled:opacity-50"
                >
                  {avatarUploading ? "Yükleniyor..." : avatarUrl ? "Fotoğrafı Değiştir" : "Fotoğraf Yükle"}
                </button>

                <div className="w-full rounded-md border border-border bg-surface-raised p-4 text-left text-xs text-text-muted">
                  <div className="mb-3 flex items-center justify-center gap-8">
                    <PhotoExample ok label="Örnek" />
                    <PhotoExample label="Kaçın" />
                  </div>
                  <div className="mb-2 font-semibold text-text">Kaliteli bir fotoğraf için:</div>
                  <ul className="flex flex-col gap-2">
                    <li className="flex items-center gap-2">
                      <TipIcon ok /> İyi ışıkta, yüzün net ve tek başına görünsün
                    </li>
                    <li className="flex items-center gap-2">
                      <TipIcon ok /> Kameraya bakan, gülümseyen bir fotoğraf tercih et
                    </li>
                    <li className="flex items-center gap-2">
                      <TipIcon /> Güneş gözlüğü, şapka veya filtre kullanma
                    </li>
                    <li className="flex items-center gap-2">
                      <TipIcon /> Grup fotoğrafından kesip kullanma
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {step === 4 && (
              <BioConsentField bio={bio} setBio={setBio} dataConsent={dataConsent} setDataConsent={setDataConsent} />
            )}

            {step === 5 && (
              <PortfolioField
                portfolioPhotos={portfolioPhotos}
                setPortfolioPhotos={setPortfolioPhotos}
                loginRedirectPath={LOGIN_REDIRECT}
              />
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
