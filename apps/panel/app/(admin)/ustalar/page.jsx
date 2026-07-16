import { Badge } from "@tekliflercepte/ui";
import { apiUrl } from "@/lib/api";
import { getSessionToken } from "@/lib/session";
import { ResetPasswordButton } from "../../reset-password-button";
import { VerifyIdentityButton } from "../../verify-identity-button";
import { TogglePremiumButton } from "../../toggle-premium-button";

async function getProviders() {
  const token = await getSessionToken();
  const res = await fetch(apiUrl("/admin/providers"), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function UstalarPage() {
  const providers = await getProviders();

  return (
    <div>
      <div className="mb-5">
        <div className="text-xl font-bold">Ustalar</div>
        <div className="text-sm text-text-muted">{providers.length} usta</div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-surface shadow-sm">
        <div className="grid min-w-[1020px] grid-cols-[1.2fr_0.9fr_0.7fr_0.6fr_1.3fr_0.9fr_0.9fr_0.9fr] border-b border-border px-5 py-3 text-xs font-bold uppercase tracking-wide text-text-muted">
          <div>Ad Soyad</div>
          <div>Şehir</div>
          <div>Puan</div>
          <div>Teklif</div>
          <div>Kategoriler</div>
          <div>Kimlik</div>
          <div>Premium</div>
          <div></div>
        </div>
        {providers.length === 0 ? (
          <div className="px-5 py-6 text-sm text-text-muted">Usta bulunamadı.</div>
        ) : (
          providers.map((provider) => (
            <div
              key={provider.id}
              className="grid min-w-[1020px] grid-cols-[1.2fr_0.9fr_0.7fr_0.6fr_1.3fr_0.9fr_0.9fr_0.9fr] items-center border-b border-border px-5 py-3.5 text-sm last:border-0"
            >
              <div>
                {provider.firstName} {provider.lastName}
              </div>
              <div className="text-text-muted">
                {provider.providerProfile
                  ? `${provider.providerProfile.city}${provider.providerProfile.district ? " / " + provider.providerProfile.district : ""}`
                  : "—"}
              </div>
              <div>
                {provider.providerProfile ? `${Number(provider.providerProfile.avgRating)} ★` : "—"}
              </div>
              <div>{provider._count.offers}</div>
              <div className="flex flex-wrap gap-1">
                {provider.providerProfile?.categories.length ? (
                  provider.providerProfile.categories.map(({ category }) => (
                    <Badge key={category.id} tone="brand">
                      {category.name}
                    </Badge>
                  ))
                ) : (
                  <span className="text-text-muted">Profil tamamlanmamış</span>
                )}
              </div>
              <div>
                {provider.providerProfile ? (
                  <VerifyIdentityButton
                    providerId={provider.id}
                    verified={Boolean(provider.providerProfile.identityVerifiedAt)}
                  />
                ) : (
                  "—"
                )}
              </div>
              <div>
                {provider.providerProfile ? (
                  <TogglePremiumButton
                    providerId={provider.id}
                    isPremium={Boolean(provider.providerProfile.isPremium)}
                  />
                ) : (
                  "—"
                )}
              </div>
              <div>
                <ResetPasswordButton userId={provider.id} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
