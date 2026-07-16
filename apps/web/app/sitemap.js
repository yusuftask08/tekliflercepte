import { slugifyTr } from "../lib/turkey-locations";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tekliflercepte.com";

async function getProviderIds() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  try {
    const res = await fetch(`${apiUrl}/providers`, { cache: "no-store" });
    if (!res.ok) return [];
    const providers = await res.json();
    return providers.map((p) => p.id);
  } catch {
    return [];
  }
}

async function getCoverage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  try {
    const res = await fetch(`${apiUrl}/providers/coverage`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

const STATIC_ROUTES = [
  { path: "", changeFrequency: "daily", priority: 1 },
  { path: "/kategoriler", changeFrequency: "weekly", priority: 0.8 },
  { path: "/ustalar", changeFrequency: "daily", priority: 0.8 },
  { path: "/hizmet-ver", changeFrequency: "monthly", priority: 0.6 },
  { path: "/iletisim", changeFrequency: "yearly", priority: 0.3 },
  { path: "/gizlilik-politikasi", changeFrequency: "yearly", priority: 0.2 },
  { path: "/kullanici-sozlesmesi", changeFrequency: "yearly", priority: 0.2 },
  { path: "/kvkk", changeFrequency: "yearly", priority: 0.2 },
];

export default async function sitemap() {
  const [providerIds, coverage] = await Promise.all([getProviderIds(), getCoverage()]);
  const now = new Date();

  return [
    ...STATIC_ROUTES.map((route) => ({
      url: `${SITE_URL}${route.path}`,
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...providerIds.map((id) => ({
      url: `${SITE_URL}/usta/${id}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5,
    })),
    ...coverage.map(({ city, kategori }) => ({
      url: `${SITE_URL}/hizmet/${kategori}/${slugifyTr(city)}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    })),
  ];
}
