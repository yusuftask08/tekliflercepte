"use client";

import { useRouter } from "next/navigation";
import { Badge, Button } from "@tekliflercepte/ui";

const STATUS_LABEL = {
  PENDING: "Beklemede",
  SELECTED: "Seçildi",
  REJECTED: "Reddedildi",
  WITHDRAWN: "Geri Çekildi",
};

const STATUS_TONE = {
  PENDING: "info",
  SELECTED: "success",
  REJECTED: "neutral",
  WITHDRAWN: "neutral",
};

export function OfferStatusBar({ offerId, status, canWithdraw }) {
  const router = useRouter();

  const withdraw = async () => {
    const res = await fetch(`/api/offers/${offerId}/withdraw`, { method: "POST" });
    if (res.ok) router.refresh();
  };

  return (
    <div className="flex items-center justify-between gap-3">
      <Badge tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Badge>
      {canWithdraw && (
        <Button variant="danger" size="sm" onClick={withdraw}>
          Teklifi Geri Çek
        </Button>
      )}
    </div>
  );
}
