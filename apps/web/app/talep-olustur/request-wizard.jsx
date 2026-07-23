"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "react-toastify";
import { Button, Input, SelectableCard, Textarea } from "@tekliflercepte/ui";
import { CategoryIcon } from "../category-icon";
import { SearchSelect } from "../search-select";
import { TR_LOCATIONS } from "@/lib/turkey-locations";
import { getDetailsPlaceholder } from "./detail-placeholders";

function isoDateOffset(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const STEP_LABELS = ["Kategori", "Konum", "Detay", "Gönder"];
const DRAFT_KEY = "tekliflercepte-request-draft";

function Header({ step, onBack }) {
  return (
    <>
      <div className="flex items-center gap-3 px-4 pt-6 sm:px-6 lg:px-10">
        <button onClick={onBack} className="text-text">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <div className="flex-1 text-lg font-bold lg:text-xl">Talep Oluştur</div>
        <div className="text-xs font-semibold text-text-muted">{step + 1}/4</div>
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

function QuestionField({ question, value, onChange }) {
  if (question.type === "select") {
    return (
      <div>
        <label className="mb-2 block text-sm font-semibold">
          {question.label}
          {question.required && <span className="text-danger"> *</span>}
        </label>
        <div className="flex flex-wrap gap-2">
          {question.options.map((option) => (
            <SelectableCard
              key={option}
              selected={value === option}
              onClick={() => onChange(option)}
              className="rounded-full px-3.5 py-2 text-sm"
            >
              {option}
            </SelectableCard>
          ))}
        </div>
      </div>
    );
  }
  const isNumber = question.type === "number";
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold">
        {question.label}
        {question.required && <span className="text-danger"> *</span>}
      </label>
      <Input
        type={isNumber ? "number" : "text"}
        inputMode={isNumber ? "numeric" : undefined}
        maxLength={isNumber ? undefined : 200}
        max={isNumber ? 9999 : undefined}
        value={value ?? ""}
        // Number inputs ignore maxLength in every browser, so a value like
        // "1231231231231231231231231" is otherwise perfectly typeable —
        // clamp to 4 digits (0-9999), plenty for any real oda/m²/adet count.
        onChange={(e) => onChange(isNumber ? e.target.value.slice(0, 4) : e.target.value)}
      />
    </div>
  );
}

function CategoryChip({ category, onRemove }) {
  if (!category) return null;
  return (
    <div className="flex gap-1.5 px-4 pb-4 sm:px-6 lg:px-10">
      <button
        onClick={onRemove}
        aria-label={`${category.name} kategorisini değiştir`}
        className="flex items-center gap-1.5 rounded-full bg-brand-100 px-3 py-1.5 text-xs font-semibold text-brand-700"
      >
        {category.name}
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
          <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

function findLeafBy(categories, key, value) {
  for (const group of categories) {
    const leaf = group.children?.find((c) => c[key] === value);
    if (leaf) return { group, leaf };
  }
  return null;
}

export function RequestWizard({ categories, preselectedSlug, preselectedLeafSlug, isProvider }) {
  const router = useRouter();
  const preselectedGroup = categories.find((c) => c.slug === preselectedSlug) ?? null;
  const preselectedLeaf = preselectedLeafSlug
    ? findLeafBy(categories, "slug", preselectedLeafSlug)
    : null;

  const [step, setStep] = useState(preselectedLeaf ? 1 : 0);
  const [group, setGroup] = useState(preselectedLeaf?.group ?? preselectedGroup);
  const [category, setCategory] = useState(preselectedLeaf?.leaf ?? null);
  const [categorySearch, setCategorySearch] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [locating, setLocating] = useState(false);
  const [details, setDetails] = useState("");
  const [budget, setBudget] = useState("");
  const [answers, setAnswers] = useState({});
  const [photos, setPhotos] = useState([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef(null);
  const apiOrigin = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [autoSubmitPending, setAutoSubmitPending] = useState(false);
  // The specific subcategory's own questions take priority — the group's
  // shared default doesn't fit every one of its subcategories (e.g. "kaç
  // oda?" makes no sense for Apartman Temizliği or Kuru Temizleme).
  const questionSet = category?.questions ?? group?.questions ?? [];

  // Restores a draft saved right before a guest was sent to log in (see the
  // 401 branch in submit()) and finishes the job for them — they filled the
  // form once, they shouldn't have to do it again just because they had to
  // create an account first.
  useEffect(() => {
    const saved = sessionStorage.getItem(DRAFT_KEY);
    if (isProvider) {
      // Provider accounts can't submit requests (API rejects it too) — if
      // this is where a guest landed after logging into a provider account
      // mid-flow, their draft would otherwise vanish with zero explanation
      // instead of just quietly re-showing their empty panel.
      sessionStorage.removeItem(DRAFT_KEY);
      toast.error(
        saved
          ? "Bu talep bir usta hesabıyla gönderilemez. Müşteri hesabınla giriş yapıp tekrar dene."
          : "Usta hesapları talep oluşturamaz."
      );
      // router.replace() was observed to silently no-op right after the
      // login-page redirect lands back here (App Router soft-nav timing) —
      // a real navigation is more important than a soft one for a redirect
      // that only fires on this one edge case.
      window.location.replace("/usta/panel");
      return;
    }
    if (!saved) return;
    sessionStorage.removeItem(DRAFT_KEY);
    const draft = JSON.parse(saved);
    const found = findLeafBy(categories, "id", draft.categoryId);
    setStep(draft.step);
    setGroup(found?.group ?? null);
    setCategory(found?.leaf ?? null);
    setCity(draft.city);
    setDistrict(draft.district);
    setPreferredDate(draft.preferredDate ?? "");
    setDetails(draft.details);
    setBudget(draft.budget);
    setAnswers(draft.answers ?? {});
    setPhotos(draft.photos ?? []);
    setAutoSubmitPending(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!autoSubmitPending) return;
    setAutoSubmitPending(false);
    submit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSubmitPending]);

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
            setCity(data.city);
            setDistrict("");
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

  const uploadPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/uploads", { method: "POST", body: formData });
      if (res.status === 401) {
        router.push("/giris?next=/talep-olustur");
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setPhotos((prev) => [...prev, data.url]);
      }
    } finally {
      setUploadingPhoto(false);
      e.target.value = "";
    }
  };

  const goBack = () => {
    if (step === 0) router.back();
    else setStep(step - 1);
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: category.id,
          city,
          district: district || undefined,
          preferredDate: preferredDate || undefined,
          details,
          budget: budget || undefined,
          answers,
          photos,
        }),
      });
      if (res.status === 401) {
        sessionStorage.setItem(
          DRAFT_KEY,
          JSON.stringify({
            step,
            categoryId: category.id,
            city,
            district,
            preferredDate,
            details,
            budget,
            answers,
            photos,
          })
        );
        router.push("/giris?next=/talep-olustur");
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Talep gönderilemedi, lütfen tekrar dene.");
        return;
      }
      setSubmitted(true);
    } catch {
      toast.error("Bir bağlantı sorunu oluştu, lütfen tekrar dene.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col bg-bg">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="text-xl font-bold">Talebin gönderildi!</div>
          <div className="text-sm text-text-muted">
            Talebin kısa bir incelemeden sonra ustalara gönderilecek. Ustalar teklif verdikçe
            bildirim alacaksın — teklif vermek onlar için de ücretsiz.
          </div>
          <Button className="w-full" onClick={() => router.push("/")}>
            Ana Sayfaya Dön
          </Button>
        </div>
      </div>
    );
  }

  // Redirect fires from the effect above — render nothing in the meantime
  // instead of flashing the full wizard for a provider account that can't
  // actually submit it.
  if (isProvider) return null;

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col sm:max-w-xl sm:py-8 lg:max-w-3xl lg:py-14">
        <div className="flex flex-1 flex-col sm:rounded-lg sm:border sm:border-border sm:bg-surface sm:shadow-md lg:shadow-lg">
          <Header step={step} onBack={goBack} />
          <CategoryChip
            category={step > 0 ? category : null}
            onRemove={() => {
              setStep(0);
              setGroup(null);
              setCategory(null);
            }}
          />

          <div className="flex-1 overflow-auto px-4 sm:px-6 lg:px-10">
            {step === 0 && !group && (
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:gap-4">
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setGroup(c)}
                    className="rounded-md border border-border bg-surface px-3 py-4 text-left shadow-sm"
                  >
                    <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-600">
                      <CategoryIcon slug={c.slug} />
                    </div>
                    <div className="text-sm font-medium">{c.name}</div>
                  </button>
                ))}
              </div>
            )}

            {step === 0 && group && (
              <div>
                <button
                  onClick={() => {
                    setGroup(null);
                    setCategory(null);
                    setCategorySearch("");
                  }}
                  className="mb-3 flex items-center gap-1 text-sm text-text-muted"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  {group.name}
                </button>
                {group.children.length > 6 && (
                  <Input
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    placeholder="Hizmet ara..."
                    className="mb-3"
                  />
                )}
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-2.5 md:grid-cols-3">
                  {group.children
                    .filter((sub) => sub.name.toLocaleLowerCase("tr").includes(categorySearch.toLocaleLowerCase("tr")))
                    .map((sub) => (
                      <SelectableCard
                        key={sub.id}
                        selected={category?.id === sub.id}
                        onClick={() => setCategory(sub)}
                        className="rounded-md bg-surface px-3 py-3 text-sm shadow-sm"
                      >
                        {sub.name}
                      </SelectableCard>
                    ))}
                </div>
              </div>
            )}

        {step === 1 && (
          <div className="flex flex-col gap-4">
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Şehir<span className="text-danger"> *</span>
              </label>
              <div className="flex gap-2">
                <div className="flex-1">
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
                <button
                  type="button"
                  onClick={useMyLocation}
                  disabled={locating}
                  title="Yakınımı Kullan"
                  aria-label="Yakınımı Kullan"
                  className="flex flex-shrink-0 items-center justify-center rounded-md border border-border bg-surface px-3.5 text-sm disabled:opacity-50"
                >
                  {locating ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-primary" />
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 22s7-6.2 7-12A7 7 0 1 0 5 10c0 5.8 7 12 7 12Z"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  )}
                </button>
              </div>
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
            <div>
              <label className="mb-2 block text-sm font-semibold">Tercih ettiğin tarih (opsiyonel)</label>
              <div className="mb-2 flex gap-2">
                {[
                  { label: "Bugün", date: isoDateOffset(0) },
                  { label: "Yarın", date: isoDateOffset(1) },
                ].map((option) => (
                  <SelectableCard
                    key={option.label}
                    selected={preferredDate === option.date}
                    onClick={() => setPreferredDate(option.date)}
                    className="rounded-full px-3.5 py-1.5 text-sm"
                  >
                    {option.label}
                  </SelectableCard>
                ))}
              </div>
              <input
                type="date"
                value={preferredDate}
                min={isoDateOffset(0)}
                onChange={(e) => setPreferredDate(e.target.value)}
                className="w-full rounded-md border border-border bg-bg px-3.5 py-2.5 text-sm"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            {questionSet.map((question) => (
              <QuestionField
                key={question.id}
                question={question}
                value={answers[question.id]}
                onChange={(value) => setAnswers((prev) => ({ ...prev, [question.id]: value }))}
              />
            ))}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                İşin detaylarını anlat<span className="text-danger"> *</span>
              </label>
              <Textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder={getDetailsPlaceholder(group, category)}
                rows={4}
                maxLength={1000}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold">Bu iş için bütçen ne kadar?</label>
              <p className="mb-2 text-xs text-text-muted">Opsiyonel — paylaşmak istemezsen boş bırakabilirsin.</p>
              <Input
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="Örn: 1.500 ₺"
                maxLength={20}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold">Fotoğraf ekle (opsiyonel)</label>
              <div className="flex gap-2.5">
                {photos.map((url) => (
                  <div key={url} className="relative h-16 w-16">
                    <Image
                      src={`${apiOrigin}${url}`}
                      alt=""
                      fill
                      sizes="64px"
                      className="rounded-md object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setPhotos((prev) => prev.filter((p) => p !== url))}
                      aria-label="Fotoğrafı kaldır"
                      className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-danger text-xs text-white"
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                        <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                ))}
                {photos.length < 3 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingPhoto}
                    className="flex h-16 w-16 items-center justify-center rounded-md border-2 border-dashed border-border text-text-muted disabled:opacity-50"
                  >
                    {uploadingPhoto ? (
                      <span className="text-xs">...</span>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M12 5v14M5 12h14"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
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
                onChange={uploadPhoto}
              />
            </div>
            <div className="text-xs text-text-muted">
              Bu bilgiler sadece teklif veren ustalarla paylaşılır.
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-3">
            <div className="rounded-md border border-border bg-surface p-4 shadow-sm">
              <div className="mb-1 text-xs font-semibold uppercase text-text-muted">Kategori</div>
              <div className="mb-3 text-sm font-medium">{category?.name}</div>
              <div className="mb-1 text-xs font-semibold uppercase text-text-muted">Konum</div>
              <div className="mb-3 text-sm font-medium">
                {city}
                {district ? ` / ${district}` : ""}
              </div>
              {questionSet
                .filter((q) => answers[q.id])
                .map((q) => (
                  <div key={q.id} className="mb-3">
                    <div className="mb-1 text-xs font-semibold uppercase text-text-muted">{q.label}</div>
                    <div className="text-sm font-medium">{answers[q.id]}</div>
                  </div>
                ))}
              <div className="mb-1 text-xs font-semibold uppercase text-text-muted">Detay</div>
              <div className="mb-3 text-sm font-medium">{details}</div>
              {budget && (
                <>
                  <div className="mb-1 text-xs font-semibold uppercase text-text-muted">Bütçe</div>
                  <div className="mb-3 text-sm font-medium">{budget}</div>
                </>
              )}
              {photos.length > 0 && (
                <>
                  <div className="mb-1 text-xs font-semibold uppercase text-text-muted">Fotoğraflar</div>
                  <div className="flex gap-2">
                    {photos.map((url) => (
                      <div key={url} className="relative h-14 w-14">
                        <Image src={`${apiOrigin}${url}`} alt="" fill sizes="56px" className="rounded-md object-cover" />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 sm:px-6 sm:py-5 lg:px-10">
        {step < 2 && (
          <Button
            className="w-full"
            size="lg"
            disabled={step === 0 ? !category : !city}
            onClick={() => setStep(step + 1)}
          >
            Devam Et
          </Button>
        )}
        {step === 2 && (
          <Button
            className="w-full"
            size="lg"
            disabled={!details || questionSet.some((q) => q.required && !answers[q.id])}
            onClick={() => setStep(3)}
          >
            Devam Et
          </Button>
        )}
        {step === 3 && (
          <Button className="w-full" size="lg" disabled={submitting} onClick={submit}>
            {submitting ? "Gönderiliyor..." : "Talebi Gönder"}
          </Button>
        )}
          </div>
        </div>
      </div>
    </div>
  );
}
