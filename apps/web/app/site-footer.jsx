import Link from "next/link";
import { getSessionUser } from "@/lib/session";
import { apiUrl } from "@/lib/api";
import { slugifyTr } from "@/lib/turkey-locations";
import { BrandLogo } from "./brand-logo";
import { TrustIcon } from "./trust-icon";

async function getCategories() {
  try {
    const res = await fetch(apiUrl("/categories"), { next: { revalidate: 300 } });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

async function getCoverage() {
  try {
    const res = await fetch(apiUrl("/providers/coverage"), { next: { revalidate: 300 } });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

const LEGAL_LINKS = [
  { href: "/kullanici-sozlesmesi", label: "Kullanıcı Sözleşmesi" },
  { href: "/gizlilik-politikasi", label: "Gizlilik Politikası" },
  { href: "/kvkk", label: "KVKK Aydınlatma Metni" },
];

const TRUST_POINTS = [
  { icon: "free", label: "Ücretsiz teklif" },
  { icon: "lock", label: "%0 komisyon" },
  { icon: "shield", label: "Onaylı talepler" },
];

function getColumns(isLoggedIn, categories, popularSearches) {
  return [
    {
      title: "Platform",
      links: [
        { href: "/#nasil-calisir", label: "Nasıl Çalışır" },
        { href: "/ustalar", label: "Usta Ara" },
        { href: "/kategoriler", label: "Tüm Kategoriler" },
        // Recruitment CTA for non-members only — same rule as the header nav.
        ...(isLoggedIn ? [] : [{ href: "/hizmet-ver", label: "Hizmet Ver" }]),
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
      title: "Kurumsal",
      links: [
        { href: "/hakkimizda", label: "Hakkımızda" },
        { href: "/iletisim", label: "İletişim" },
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
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-[1.5fr_repeat(4,1fr)] lg:gap-12">
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <BrandLogo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-text-muted">
              Hizmet almak isteyenleri, hizmet verenlerle ücretsiz buluşturan platform. Teklif vermek ücretsiz,
              komisyon yok.
            </p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {TRUST_POINTS.map((point) => (
                <li
                  key={point.label}
                  className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700"
                >
                  <TrustIcon name={point.icon} size={14} />
                  {point.label}
                </li>
              ))}
            </ul>
            <a
              href="mailto:destek@tekliflercepte.com"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold hover:text-primary"
            >
              <TrustIcon name="mail" size={16} />
              destek@tekliflercepte.com
            </a>
          </div>
          {COLUMNS.map((column) => (
            <div key={column.title}>
              <div className="text-xs font-bold uppercase tracking-wider text-text-muted">{column.title}</div>
              <ul className="mt-4 flex flex-col gap-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-text hover:text-primary">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-sm text-text-muted sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>© {new Date().getFullYear()} Teklifler Cepte. Tüm hakları saklıdır.</div>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {LEGAL_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-primary">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
