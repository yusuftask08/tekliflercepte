import { redirect } from "next/navigation";
import { SiteHeader } from "../../site-header";
import { apiUrl } from "@/lib/api";
import { getSessionToken, getSessionUser } from "@/lib/session";
import { OnboardingForm } from "./onboarding-form";

async function getCategories() {
  try {
    const res = await fetch(apiUrl("/categories"), { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

async function getMyProviderProfile(token) {
  const res = await fetch(apiUrl("/me/provider-profile"), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function UstaKurulumPage() {
  const user = await getSessionUser();
  if (!user) redirect("/giris?next=/usta/kurulum");
  if (user.role !== "PROVIDER") redirect("/hizmet-ver");

  const token = await getSessionToken();
  const [categories, profile] = await Promise.all([getCategories(), getMyProviderProfile(token)]);

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <SiteHeader />
      <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:max-w-4xl lg:py-16">
        <h1 className="text-2xl font-bold sm:text-3xl">Usta Profilini Tamamla</h1>
        <p className="mt-2 text-text-muted">
          Hangi hizmetleri verdiğini ve nerede çalıştığını seç, sana uygun talepler önüne gelsin.
        </p>
        <div className="mt-8">
          <OnboardingForm categories={categories} initialProfile={profile} />
        </div>
      </div>
    </div>
  );
}
