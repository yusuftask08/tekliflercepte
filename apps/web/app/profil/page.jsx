import { redirect } from "next/navigation";
import Link from "next/link";
import { AccountShell } from "../account-shell";
import { LogoutButton } from "../logout-button";
import { apiUrl } from "@/lib/api";
import { getSessionToken, getSessionUser } from "@/lib/session";
import { AccountForm } from "./account-form";
import { PasswordForm } from "./password-form";
import { ProviderProfileForm } from "./provider-profile-form";
import { ReferralCard } from "./referral-card";

function SectionCard({ title, description, children }) {
  return (
    <section className="rounded-lg border border-border bg-surface p-5 shadow-sm sm:p-6">
      <h2 className="text-base font-bold">{title}</h2>
      {description && <p className="mt-1 text-sm text-text-muted">{description}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

async function getFullUser(token) {
  const res = await fetch(apiUrl("/auth/me"), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

async function getMyProviderProfile(token) {
  const res = await fetch(apiUrl("/me/provider-profile"), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

async function getCategories() {
  const res = await fetch(apiUrl("/categories"), { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

async function getMyReferrals(token) {
  const res = await fetch(apiUrl("/me/referrals"), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function ProfilPage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) redirect("/giris?next=/profil");

  const token = await getSessionToken();
  const user = (await getFullUser(token)) ?? sessionUser;
  const isProvider = user.role === "PROVIDER";

  const [providerProfile, categories] = isProvider
    ? await Promise.all([getMyProviderProfile(token), getCategories()])
    : [null, []];
  const referrals = await getMyReferrals(token);

  return (
    <AccountShell
      user={sessionUser}
      title={isProvider ? "Profilim" : "Hesap Ayarları"}
      description={
        isProvider
          ? "Kişisel bilgilerin, usta profilin ve hesap güvenliğin."
          : "Kişisel bilgilerini ve hesap güvenliğini buradan yönet."
      }
    >
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] xl:items-start">
        <SectionCard title="Kişisel Bilgiler" description="Adın, fotoğrafın ve iletişim bilgilerin.">
          <AccountForm user={user} />
        </SectionCard>

        <div className="flex flex-col gap-6">
          <SectionCard title="Şifre Değiştir" description="Güvenliğin için en az 6 karakterli, tahmin edilmesi zor bir şifre kullan.">
            <PasswordForm />
          </SectionCard>
          {referrals && (
            <ReferralCard
              referralCode={referrals.referralCode}
              totalReferred={referrals.totalReferred}
              isProvider={isProvider}
            />
          )}
        </div>
      </div>

      {isProvider && (
        <div className="mt-6">
          {providerProfile ? (
            <ProviderProfileForm categories={categories} initialProfile={providerProfile} />
          ) : (
            <Link
              href="/usta/kurulum"
              className="flex items-center justify-between rounded-lg border border-border bg-surface px-5 py-4 text-sm font-semibold shadow-sm"
            >
              Usta profilini tamamla
              <span className="text-text-muted">›</span>
            </Link>
          )}
        </div>
      )}

      {/* Desktop has logout in the sidebar menu */}
      <div className="mt-6 rounded-lg border border-border bg-surface px-5 py-4 shadow-sm lg:hidden">
        <LogoutButton className="text-danger" />
      </div>
    </AccountShell>
  );
}
