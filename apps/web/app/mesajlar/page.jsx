import { redirect } from "next/navigation";
import Link from "next/link";
import { Avatar, Button, EmptyState } from "@tekliflercepte/ui";
import { apiUrl } from "@/lib/api";
import { getSessionToken, getSessionUser } from "@/lib/session";
import { EmptyIcon } from "../empty-icons";
import { AccountShell } from "../account-shell";

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
  const apiOrigin = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

  return (
    <AccountShell
      user={user}
      title="Mesajlarım"
      description={
        isProvider
          ? "Teklif verdiğin müşterilerle olan görüşmelerin."
          : "Teklif aldığın ustalarla olan görüşmelerin."
      }
    >

        {conversations.length === 0 ? (
          <div>
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
          <div className="flex flex-col gap-2">
            {conversations.map((conversation) => (
              <Link
                key={conversation.offerId}
                href={`/mesajlar/${conversation.offerId}`}
                className="flex items-center gap-3 rounded-md border border-border bg-surface px-4 py-3.5 shadow-sm"
              >
                <Avatar
                  name={conversation.otherPartyName}
                  src={conversation.otherPartyAvatarUrl ? `${apiOrigin}${conversation.otherPartyAvatarUrl}` : null}
                  size="sm"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    {conversation.otherPartyName}
                    {conversation.unreadCount > 0 && (
                      <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
                        {conversation.unreadCount > 9 ? "9+" : conversation.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-text-muted">{conversation.category}</div>
                </div>
                {conversation.lastMessage && (
                  <div className="max-w-[40%] flex-shrink-0 truncate text-xs text-text-muted">
                    {conversation.lastMessage}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
    </AccountShell>
  );
}
