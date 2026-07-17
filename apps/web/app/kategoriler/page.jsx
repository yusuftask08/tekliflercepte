import Link from "next/link";
import { SiteFooter } from "../site-footer";

export const metadata = {
  title: "Tüm Kategoriler — Teklifler Cepte",
  description:
    "Teklifler Cepte'deki tüm hizmet kategorileri ve alt kategorileri: temizlik, tadilat, nakliyat, tamir, özel ders, organizasyon ve daha fazlası. Ücretsiz teklif al.",
};

async function getCategories() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  try {
    const res = await fetch(`${apiUrl}/categories`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function KategorilerPage() {
  const categories = await getCategories();

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
        <h1 className="text-3xl font-extrabold sm:text-4xl">Tüm Kategoriler</h1>
        <p className="mt-3 max-w-2xl text-text-muted">
          Teklifler Cepte&apos;de yer alan tüm hizmet kategorileri. Herhangi birine tıkla, talebini
          ücretsiz oluştur.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((group) => (
            <section key={group.id}>
              <Link
                href={`/talep-olustur?kategori=${group.slug}`}
                className="text-lg font-bold hover:text-primary"
              >
                {group.name}
              </Link>
              <ul className="mt-3 flex flex-col gap-2">
                {group.children.map((sub) => (
                  <li key={sub.id}>
                    <Link
                      href={`/talep-olustur?kategori=${group.slug}&hizmet=${sub.slug}`}
                      className="text-sm text-text-muted hover:text-primary hover:underline"
                    >
                      {sub.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
