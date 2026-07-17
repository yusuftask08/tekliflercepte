"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Button } from "@tekliflercepte/ui";
import {
  BusinessTypeField,
  LocationField,
  CategoriesField,
  BioConsentField,
  PortfolioField,
} from "../provider-profile-fields";
import { submitProviderProfile } from "../provider-profile-submit";

const LOGIN_REDIRECT = "/profil";

function Section({ title, children }) {
  return (
    <div className="border-t border-border pt-6 first:border-t-0 first:pt-0">
      <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-text-muted">{title}</h3>
      {children}
    </div>
  );
}

export function ProviderProfileForm({ categories, initialProfile }) {
  const router = useRouter();

  const [businessType, setBusinessType] = useState(initialProfile.businessType ?? "");
  const [businessName, setBusinessName] = useState(initialProfile.businessName ?? "");
  const [city, setCity] = useState(initialProfile.city ?? "");
  const [district, setDistrict] = useState(initialProfile.district ?? "");
  const [neighborhood, setNeighborhood] = useState(initialProfile.neighborhood ?? "");
  const [serviceCities, setServiceCities] = useState(initialProfile.serviceCities ?? []);
  const [selected, setSelected] = useState(
    new Set(initialProfile.categories?.map((c) => c.categoryId) ?? [])
  );
  const [experienceYears, setExperienceYears] = useState(initialProfile.experienceYears ?? "");
  const [bio, setBio] = useState(initialProfile.bio ?? "");
  const [dataConsent, setDataConsent] = useState(Boolean(initialProfile.dataConsentAt));
  const [portfolioPhotos, setPortfolioPhotos] = useState(initialProfile.portfolioPhotos ?? []);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
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
      toast.success("Profilin güncellendi.");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-6 rounded-lg border border-border bg-surface p-5 shadow-sm"
    >
      <div className="text-sm font-bold">Usta Profili</div>

      <Section title="İşletme Bilgileri">
        <BusinessTypeField
          businessType={businessType}
          setBusinessType={setBusinessType}
          businessName={businessName}
          setBusinessName={setBusinessName}
        />
      </Section>

      <Section title="Konum">
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
      </Section>

      <Section title="Hizmetler">
        <CategoriesField
          categories={categories}
          selected={selected}
          setSelected={setSelected}
          experienceYears={experienceYears}
          setExperienceYears={setExperienceYears}
        />
      </Section>

      <Section title="Tanıtım">
        <BioConsentField bio={bio} setBio={setBio} dataConsent={dataConsent} setDataConsent={setDataConsent} />
      </Section>

      <Section title="Portföy">
        <PortfolioField
          portfolioPhotos={portfolioPhotos}
          setPortfolioPhotos={setPortfolioPhotos}
          loginRedirectPath={LOGIN_REDIRECT}
        />
      </Section>

      <Button type="submit" disabled={submitting} className="self-start">
        {submitting ? "Kaydediliyor..." : "Kaydet"}
      </Button>
    </form>
  );
}
