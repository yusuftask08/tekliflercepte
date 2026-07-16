import Link from "next/link";
import { Button } from "@tekliflercepte/ui";
import { getSessionUser } from "@/lib/session";
import { AccountMenu } from "./account-menu";
import { MobileMenu } from "./mobile-menu";

const NAV_LINKS = [
  { href: "#nasil-calisir", label: "Nasıl Çalışır" },
  { href: "#kategoriler", label: "Kategoriler" },
  { href: "/ustalar", label: "Usta Ara" },
  { href: "/hizmet-ver", label: "Hizmet Ver" },
];

export async function SiteHeader() {
  const user = await getSessionUser();

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-surface/90 backdrop-blur">
      <div className="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-lg font-extrabold sm:text-xl">
          Teklifler Cepte
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-text-muted lg:flex">
          {NAV_LINKS.map((link) =>
            link.href.startsWith("#") ? (
              <a key={link.label} href={link.href} className="hover:text-text">
                {link.label}
              </a>
            ) : (
              <Link key={link.label} href={link.href} className="hover:text-text">
                {link.label}
              </Link>
            )
          )}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          {user ? (
            <>
              <Link
                href={user.role === "PROVIDER" ? "/usta/panel" : "/taleplerim"}
                className="text-sm font-semibold"
              >
                {user.role === "PROVIDER" ? "Usta Paneli" : "Taleplerim"}
              </Link>
              {user.role !== "PROVIDER" && (
                <Link href="/favorilerim" className="text-sm font-semibold">
                  Favorilerim
                </Link>
              )}
              <Link href="/mesajlar" className="text-sm font-semibold">
                Mesajlar
              </Link>
              <AccountMenu user={user} />
            </>
          ) : (
            <>
              <Link href="/giris" className="text-sm font-semibold">
                Giriş Yap
              </Link>
              <Link href="/talep-olustur">
                <Button size="md">Talep Oluştur</Button>
              </Link>
            </>
          )}
        </div>

        <MobileMenu links={NAV_LINKS} user={user} />
      </div>
    </header>
  );
}
