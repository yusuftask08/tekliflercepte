import { apiUrl } from "@/lib/api";
import { getSessionToken, getSessionUser } from "@/lib/session";
import { ContactForm } from "./contact-form";

export const metadata = { title: "İletişim — Teklifler Cepte" };

async function getFullUser(token) {
  const res = await fetch(apiUrl("/auth/me"), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function IletisimPage() {
  const sessionUser = await getSessionUser();
  const token = sessionUser ? await getSessionToken() : null;
  const user = token ? await getFullUser(token) : null;

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <div className="mx-auto w-full max-w-xl flex-1 px-4 py-10 sm:px-6 sm:py-16">
        <h1 className="text-2xl font-bold sm:text-3xl">İletişim</h1>
        <p className="mt-4 text-text-muted">
          Sorunun veya geri bildirimini aşağıdaki formdan gönder, en kısa sürede döneriz. İstersen doğrudan
          e-posta ile de ulaşabilirsin:
        </p>
        <a href="mailto:destek@tekliflercepte.com" className="mt-2 inline-block font-semibold text-primary">
          destek@tekliflercepte.com
        </a>

        <div className="mt-6">
          <ContactForm
            initialName={user ? `${user.firstName} ${user.lastName}` : ""}
            initialEmail={user?.email ?? ""}
          />
        </div>
      </div>
    </div>
  );
}
