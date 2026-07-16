"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Avatar, Badge, StarRating, Button } from "@tekliflercepte/ui";

export function OfferCard({ offer, requestClosed }) {
  const router = useRouter();
  const [selecting, setSelecting] = useState(false);
  const provider = offer.provider;
  const profile = provider.providerProfile;
  const name = `${provider.firstName} ${provider.lastName}`;
  const isSelected = offer.status === "SELECTED";

  const selectOffer = async () => {
    setSelecting(true);
    try {
      const res = await fetch(`/api/offers/${offer.id}/select`, { method: "POST" });
      if (res.status === 401) {
        router.push(`/giris?next=/taleplerim/${offer.serviceRequestId}`);
        return;
      }
      router.refresh();
    } finally {
      setSelecting(false);
    }
  };

  return (
    <div className="rounded-lg border border-border bg-surface p-3 shadow-sm">
      <div className="flex gap-2.5">
        <Avatar name={name} size="md" />
        <div className="flex-1">
          <div className="text-sm font-bold">{name}</div>
          {profile?.businessName && (
            <div className="text-[11px] text-text-muted">{profile.businessName}</div>
          )}
          <div className="mt-0.5">
            <StarRating rating={Number(profile?.avgRating ?? 0)} reviewCount={profile?.reviewCount ?? 0} />
          </div>
        </div>
        <div className="text-lg font-extrabold text-brand-700">{Number(offer.price)} ₺</div>
      </div>

      <div className="my-2 flex flex-wrap gap-1.5">
        {profile?.reviewCount != null && (
          <Badge tone="soft">{profile.reviewCount} iş tamamlandı</Badge>
        )}
        {provider.phoneVerifiedAt && (
          <Badge tone="success" icon="check">
            Telefon doğrulandı
          </Badge>
        )}
      </div>

      {offer.message && (
        <div className="mb-2.5 text-xs italic text-text-muted">&ldquo;{offer.message}&rdquo;</div>
      )}

      <div className="flex gap-2">
        <Link
          href={`/mesajlar/${offer.id}`}
          className="flex-1 rounded-md border border-border py-2 text-center text-xs font-semibold"
        >
          Mesaj
        </Link>
        {isSelected ? (
          <div className="flex-1 rounded-md bg-success py-2 text-center text-xs font-bold text-white">
            Seçildi
          </div>
        ) : (
          <Button
            size="md"
            className="flex-1 !px-0 py-2 text-xs"
            disabled={requestClosed || selecting}
            onClick={selectOffer}
          >
            Teklifi Seç
          </Button>
        )}
      </div>
    </div>
  );
}
