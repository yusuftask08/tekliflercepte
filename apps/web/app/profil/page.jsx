import { redirect } from "next/navigation";
import Link from "next/link";
import { LogoutButton } from "../logout-button";
import { apiUrl } from "@/lib/api";
import { getSessionToken, getSessionUser } from "@/lib/session";
import { AccountForm } from "./account-form";
import { PasswordForm } from "./password-form";
import { ProviderProfileForm } from "./provider-profile-form";

const ROLE_LABEL = {
  CUSTOMER: "Müşteri",
  PROVIDER: "Usta",
  ADMIN: "Yönetici",
};

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

export default async function ProfilPage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) redirect("/giris?next=/profil");

  const token = await getSessionToken();
  const user = (await getFullUser(token)) ?? sessionUser;

  const [providerProfile, categories] =
    user.role === "PROVIDER"
      ? await Promise.all([getMyProviderProfile(token), getCategories()])
      : [null, []];

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <div className="mx-auto w-full max-w-md flex-1 px-4 py-8 sm:max-w-2xl sm:py-12 lg:max-w-5xl lg:py-16">
        <div className="text-sm font-semibold uppercase tracking-wide text-text-muted">
          {ROLE_LABEL[user.role] ?? user.role}
        </div>

        <div className="mt-6 lg:grid lg:grid-cols-[1.3fr_1fr] lg:items-start lg:gap-10">
          <div>
            <AccountForm user={user} />

            <div className="mt-8 flex flex-col gap-2">
              {user.role === "PROVIDER" ? (
                <Link
                  href="/usta/panel"
                  className="flex items-center justify-between rounded-md border border-border bg-surface px-4 py-3.5 text-sm font-medium shadow-sm"
                >
                  Açık İşler
                  <span className="text-text-muted">›</span>
                </Link>
              ) : (
                <Link
                  href="/taleplerim"
                  className="flex items-center justify-between rounded-md border border-border bg-surface px-4 py-3.5 text-sm font-medium shadow-sm"
                >
                  Taleplerim
                  <span className="text-text-muted">›</span>
                </Link>
              )}
              <Link
                href="/mesajlar"
                className="flex items-center justify-between rounded-md border border-border bg-surface px-4 py-3.5 text-sm font-medium shadow-sm"
              >
                Mesajlarım
                <span className="text-text-muted">›</span>
              </Link>
            </div>
          </div>

          <div>
            <div className="mt-8 rounded-lg border border-border bg-surface p-5 shadow-sm lg:mt-0">
              <div className="mb-3 text-sm font-bold">Şifre Değiştir</div>
              <PasswordForm />
            </div>
          </div>
        </div>

        {user.role === "PROVIDER" && (
          <div className="mt-8">
            {providerProfile ? (
              <ProviderProfileForm categories={categories} initialProfile={providerProfile} />
            ) : (
              <Link
                href="/usta/kurulum"
                className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3.5 text-sm font-medium shadow-sm"
              >
                Usta profilini tamamla
                <span className="text-text-muted">›</span>
              </Link>
            )}
          </div>
        )}

        <div className="mt-8 rounded-lg border border-border bg-surface p-4 shadow-sm">
          <LogoutButton className="text-danger" />
        </div>
      </div>
    </div>
  );
}
