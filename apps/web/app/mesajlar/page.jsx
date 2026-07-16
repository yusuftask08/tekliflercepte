import { redirect } from "next/navigation";
import Link from "next/link";
import { Button, EmptyState } from "@tekliflercepte/ui";
import { SiteHeader } from "../site-header";
import { apiUrl } from "@/lib/api";
import { getSessionToken, getSessionUser } from "@/lib/session";
import { EmptyIcon } from "../empty-icons";

async function getConversations(token) {
  const res = await fetch(apiUrl("/me/conversations"), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function MesajlarimPage() {
  const user = await getSessionUser();
  if (!user) redirect("/giris?next=/mesajlar");

  const token = await getSessionToken();
  const conversations = await getConversations(token);
  const isProvider = user.role === "PROVIDER";

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <SiteHeader />
      <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:max-w-4xl">
        <h1 className="text-2xl font-bold sm:text-3xl">Mesajlarım</h1>

        {conversations.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              icon={<EmptyIcon name="chat" />}
              title="Henüz bir görüşmen yok"
              description={
                isProvider
                  ? "Bir talebe teklif verdiğinde, müşteriyle buradan mesajlaşabilirsin."
                  : "Bir talep oluşturup teklif aldığında, ustayla buradan mesajlaşabilirsin."
              }
              action={
                <Link href={isProvider ? "/usta/panel" : "/talep-olustur"}>
                  <Button size="md">{isProvider ? "Talepleri Gör" : "Talep Oluştur"}</Button>
                </Link>
              }
            />
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-2">
            {conversations.map((conversation) => (
              <Link
                key={conversation.offerId}
                href={`/mesajlar/${conversation.offerId}`}
                className="flex items-center justify-between rounded-md border border-border bg-surface px-4 py-3.5 shadow-sm"
              >
                <div>
                  <div className="text-sm font-semibold">{conversation.otherPartyName}</div>
                  <div className="text-xs text-text-muted">{conversation.category}</div>
                </div>
                {conversation.lastMessage && (
                  <div className="max-w-[50%] truncate text-xs text-text-muted">
                    {conversation.lastMessage}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
