import Link from "next/link";
import { getSessionUser } from "@/lib/session";

function getColumns(isLoggedIn) {
  return [
    {
      title: "Şirket",
      links: [
        { href: "/#nasil-calisir", label: "Nasıl Çalışır" },
        // Recruitment CTA for non-members only — same rule as the header nav.
        ...(isLoggedIn ? [] : [{ href: "/hizmet-ver", label: "Hizmet Ver" }]),
        { href: "/iletisim", label: "İletişim" },
      ],
    },
    {
      title: "Kategoriler",
      links: [{ href: "/kategoriler", label: "Tüm Kategoriler" }],
    },
    {
      title: "Yasal",
      links: [
        { href: "/kullanici-sozlesmesi", label: "Kullanıcı Sözleşmesi" },
        { href: "/gizlilik-politikasi", label: "Gizlilik Politikası" },
        { href: "/kvkk", label: "KVKK Aydınlatma Metni" },
      ],
    },
  ];
}

export async function SiteFooter() {
  const user = await getSessionUser();
  const COLUMNS = getColumns(Boolean(user));

  return (
    <footer className="mt-auto border-t border-border px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <div className="text-lg font-extrabold">Teklifler Cepte</div>
            <p className="mt-2 text-sm text-text-muted">
              Teklif vermek ücretsiz, komisyon yok.
            </p>
          </div>
          {COLUMNS.map((column) => (
            <div key={column.title}>
              <div className="text-sm font-bold">{column.title}</div>
              <ul className="mt-3 flex flex-col gap-2">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-text-muted hover:text-primary">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 border-t border-border pt-6 text-sm text-text-muted">
          © {new Date().getFullYear()} Teklifler Cepte
        </div>
      </div>
    </footer>
  );
}
