import Link from "next/link";
import { Avatar, Badge, StarRating } from "@tekliflercepte/ui";
import { formatResponseTime } from "../lib/trust";
import { displayName } from "../lib/name";

export function ProviderCard({ provider }) {
  const profile = provider.providerProfile;
  const name = displayName(provider);
  const responseLabel = formatResponseTime(provider.trust?.avgResponseMinutes);

  return (
    <Link
      href={`/usta/${provider.id}`}
      className="rounded-lg border border-border bg-surface p-4 shadow-sm transition hover:border-primary"
    >
      <div className="flex items-start gap-3">
        <Avatar name={name} size="md" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate font-bold">{name}</span>
            {profile?.identityVerifiedAt && (
              <Badge tone="success" icon="check">
                Doğrulandı
              </Badge>
            )}
          </div>
          <div className="text-xs text-text-muted">
            {profile?.city}
            {profile?.serviceCities?.length > 0 && ` + ${profile.serviceCities.length} şehir daha`}
          </div>
          <div className="mt-1 flex items-center gap-1.5">
            <StarRating rating={Number(profile?.avgRating ?? 0)} />
            <span className="text-xs text-text-muted">({profile?.reviewCount ?? 0})</span>
          </div>
          {responseLabel && <div className="mt-0.5 text-xs text-success">{responseLabel}</div>}
        </div>
      </div>

      {profile?.categories?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {profile.categories.slice(0, 3).map(({ category }) => (
            <Badge key={category.id} tone="brand">
              {category.name}
            </Badge>
          ))}
        </div>
      )}
    </Link>
  );
}
