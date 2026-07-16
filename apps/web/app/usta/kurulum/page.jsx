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

  return <OnboardingForm categories={categories} initialProfile={profile} header={<SiteHeader />} />;
}
