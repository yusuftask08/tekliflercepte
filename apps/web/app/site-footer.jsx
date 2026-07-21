import Link from "next/link";
import { getSessionUser } from "@/lib/session";
import { apiUrl } from "@/lib/api";
import { slugifyTr } from "@/lib/turkey-locations";

async function getCategories() {
  try {
    const res = await fetch(apiUrl("/categories"), { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

async function getCoverage() {
  try {
    const res = await fetch(apiUrl("/providers/coverage"), { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

function getColumns(isLoggedIn, categories, popularSearches) {
  return [
    {
      title: "Şirket",
      links: [
        { href: "/#nasil-calisir", label: "Nasıl Çalışır" },
        { href: "/hakkimizda", label: "Hakkımızda" },
        // Recruitment CTA for non-members only — same rule as the header nav.
        ...(isLoggedIn ? [] : [{ href: "/hizmet-ver", label: "Hizmet Ver" }]),
        { href: "/iletisim", label: "İletişim" },
      ],
    },
    {
      title: "Hizmetler",
      links: categories.map((c) => ({ href: `/ustalar?kategori=${c.slug}`, label: c.name })),
    },
    // Real, currently-served city+category combinations only — no
    // fabricated "popular" searches for places we don't actually have
    // providers in yet. Naturally fills out as more providers sign up.
    ...(popularSearches.length > 0
      ? [
          {
            title: "Popüler Aramalar",
            links: popularSearches,
          },
        ]
      : []),
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
  const [user, categories, coverage] = await Promise.all([
    getSessionUser(),
    getCategories(),
    getCoverage(),
  ]);

  const categoryNameBySlug = new Map();
  for (const group of categories) {
    categoryNameBySlug.set(group.slug, group.name);
    for (const child of group.children) categoryNameBySlug.set(child.slug, child.name);
  }
  const popularSearches = coverage
    .slice()
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
    .map(({ city, kategori }) => ({
      href: `/hizmet/${kategori}/${slugifyTr(city)}`,
      label: `${city} ${categoryNameBySlug.get(kategori) ?? kategori}`,
    }));

  const COLUMNS = getColumns(Boolean(user), categories, popularSearches);

  return (
    <footer className="mt-auto border-t border-border py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
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
