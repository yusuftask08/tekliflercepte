import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteHeader } from "../../site-header";
import { apiUrl } from "@/lib/api";
import { getSessionToken, getSessionUser } from "@/lib/session";
import { LogoutButton } from "../../logout-button";
import { AvailabilityToggle } from "../panel/availability-toggle";
import { ShareAppButton } from "./share-app-button";

async function getMyProviderProfile(token) {
  const res = await fetch(apiUrl("/me/provider-profile"), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

function MenuRow({ href, label, right }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between px-4 py-3.5 text-sm hover:bg-surface-raised"
    >
      <span>{label}</span>
      {right ?? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-text-muted">
          <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )}
    </Link>
  );
}

export default async function UstaAyarlarPage() {
  const user = await getSessionUser();
  if (!user) redirect("/giris?next=/usta/ayarlar");
  if (user.role !== "PROVIDER") redirect("/");

  const token = await getSessionToken();
  const profile = await getMyProviderProfile(token);

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <SiteHeader />
      <div className="mx-auto w-full max-w-xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        <h1 className="mb-6 text-2xl font-bold">Ayarlar</h1>

        <div className="mb-3 text-xs font-bold uppercase tracking-wide text-text-muted">Profil</div>
        <div className="mb-6 divide-y divide-border rounded-lg border border-border bg-surface shadow-sm">
          <MenuRow href="/usta/kurulum" label="Profil" />
          <MenuRow href="/usta/kurulum" label="Hizmetler" />
          <MenuRow href="/profil" label="Hesap Ayarları" />
          {profile && (
            <div className="flex items-center justify-between px-4 py-3.5 text-sm">
              <span>Tercihler</span>
              <AvailabilityToggle isAvailable={profile.isAvailable} />
            </div>
          )}
          <MenuRow href={`/usta/${user.id}`} label="Müşteri Yorumları" />
        </div>

        <div className="mb-3 text-xs font-bold uppercase tracking-wide text-text-muted">Diğer</div>
        <div className="mb-6 divide-y divide-border rounded-lg border border-border bg-surface shadow-sm">
          <div className="flex items-center justify-between px-4 py-3.5 text-sm">
            <span>Uygulamayı Tavsiye Et</span>
            <ShareAppButton />
          </div>
          <MenuRow href="/iletisim" label="Destek Merkezi" />
          <MenuRow href="/gizlilik-politikasi" label="Veri Gizliliği" />
        </div>

        <div className="rounded-lg border border-border bg-surface shadow-sm">
          <div className="px-4 py-3.5">
            <LogoutButton className="text-danger" />
          </div>
        </div>
      </div>
    </div>
  );
}
