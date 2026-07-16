const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tekliflercepte.com";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/profil",
        "/taleplerim",
        "/mesajlar",
        "/talep-olustur",
        "/usta/panel",
        "/usta/kurulum",
        "/giris",
        "/kayit",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
