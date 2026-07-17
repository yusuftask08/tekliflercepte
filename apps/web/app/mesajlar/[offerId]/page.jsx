import Link from "next/link";
import { redirect } from "next/navigation";
import { Avatar } from "@tekliflercepte/ui";
import { MessageThread } from "./message-thread";
import { ReportBlockMenu } from "./report-block-menu";
import { OfferStatusBar } from "./offer-status-bar";
import { getSessionToken, getSessionUser } from "@/lib/session";
import { apiUrl } from "@/lib/api";
import { displayName } from "@/lib/name";

async function getOffer(id, token) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  const res = await fetch(`${apiUrl}/offers/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

async function getMessages(offerId, token) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  const res = await fetch(`${apiUrl}/offers/${offerId}/messages`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

async function getBlockedIds(token) {
  const res = await fetch(apiUrl("/me/blocks"), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function MessagingPage({ params }) {
  const { offerId } = await params;
  const token = await getSessionToken();
  if (!token) redirect(`/giris?next=/mesajlar/${offerId}`);
  const sessionUser = await getSessionUser();

  const [offer, messages, blockedIds] = await Promise.all([
    getOffer(offerId, token),
    getMessages(offerId, token),
    getBlockedIds(token),
  ]);

  if (!offer) {
    return (
      <div className="flex min-h-screen flex-col bg-bg">
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <p className="text-sm text-text-muted">Görüşme bulunamadı.</p>
          <Link href="/" className="mt-3 text-sm font-semibold text-primary">
            Ana sayfaya dön
          </Link>
        </div>
      </div>
    );
  }

  const isProvider = sessionUser?.id === offer.provider.id;
  const name = displayName(isProvider ? offer.serviceRequest.customer : offer.provider);
  const otherPartyId = isProvider ? offer.serviceRequest.customerId : offer.provider.id;

  return (
    <div className="flex h-screen flex-col bg-bg">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col overflow-hidden sm:max-w-2xl sm:py-6">
        <div className="flex flex-1 flex-col overflow-hidden sm:rounded-lg sm:border sm:border-border sm:shadow-md">
          <div className="flex items-center gap-2.5 border-b border-border bg-surface px-4 py-3">
            <Link href={`/taleplerim/${offer.serviceRequestId}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M15 5l-7 7 7 7" stroke="var(--color-text)" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </Link>
            <Avatar name={name} size="sm" />
            <div className="flex-1">
              <div className="text-sm font-bold">{name}</div>
              <div className="flex items-center gap-1 text-[11px] text-success">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-success" />
                Çevrimiçi
              </div>
            </div>
            <ReportBlockMenu
              otherUserId={otherPartyId}
              offerId={offer.id}
              initialBlocked={blockedIds.includes(otherPartyId)}
            />
          </div>

          <div className="flex flex-col gap-2 px-4 py-3">
            <div className="rounded-md border border-border bg-surface-raised px-3 py-2.5 text-xs text-text-muted">
              {offer.serviceRequest.category?.name} talebi · {offer.serviceRequest.city}
            </div>
            <OfferStatusBar
              offerId={offer.id}
              status={offer.status}
              canWithdraw={isProvider && offer.status === "PENDING"}
            />
          </div>

          <MessageThread
            offerId={offer.id}
            initialMessages={messages}
            customerId={offer.serviceRequest.customerId}
            viewerId={sessionUser?.id}
          />
        </div>
      </div>
    </div>
  );
}
