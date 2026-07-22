import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@tekliflercepte/ui";
import { HowItWorksIcon } from "../how-it-works-icon";
import { TrustIcon } from "../trust-icon";
import { SiteFooter } from "../site-footer";
import { getSessionUser } from "@/lib/session";

export const metadata = {
  title: "Hizmet Ver — Teklifler Cepte",
  description:
    "Teklifler Cepte'de usta olarak teklif vermek tamamen ücretsiz, komisyon yok. Ücretsiz kayıt ol, sana uygun taleplere teklif ver.",
};

const BENEFITS = [
  {
    icon: "free",
    title: "Teklif vermek ücretsiz",
    body: "Diğer platformların aksine teklif verme ücreti almıyoruz — sınırsız teklif ver.",
  },
  {
    icon: "shield",
    title: "Komisyon yok",
    body: "İşi kazandığında da bir kesinti yok. Kazandığın ücret tamamen sana kalır.",
  },
  {
    icon: "phone",
    title: "Güvenilir profil",
    body: "Telefon doğrulama, puan ve tamamlanan iş sayınla müşterilerin gözünde öne çık.",
  },
];

const STEPS = [
  {
    icon: "request",
    title: "Ücretsiz kayıt ol",
    body: "Birkaç adımda hesabını oluştur, hizmet verdiğin kategorileri seç.",
  },
  {
    icon: "compare",
    title: "Sana uygun talepleri gör",
    body: "Kategorine ve bölgene uygun açık talepler önüne gelsin.",
  },
  {
    icon: "choose",
    title: "Teklif ver, işi kazan",
    body: "Fiyatını ve mesajını gönder, müşteri seni seçerse doğrudan anlaşın.",
  },
];

export default async function HizmetVerPage() {
  const user = await getSessionUser();
  if (user) {
    redirect(user.role === "PROVIDER" ? "/usta/panel" : "/");
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg">

      <section className="py-10 sm:py-16 lg:py-24">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 text-center sm:px-6 lg:flex-row lg:px-8 lg:text-left">
          <div className="lg:max-w-xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand-100 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide text-brand-700">
              Ustalar için
            </div>
            <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
              Müşteri bul, <span className="text-primary">ücretsiz teklif ver</span>
            </h1>
            <p className="mt-4 text-base text-text-muted sm:text-lg">
              Teklif vermek de komisyon ödemek de yok. Kazandığın iş tamamen senin — ödemeyi de
              müşteriden doğrudan alırsın.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Link href="/kayit?rol=usta">
                <Button size="lg" className="w-full shadow-lg sm:w-auto">
                  Ücretsiz kayıt ol
                </Button>
              </Link>
            </div>
          </div>

          <div className="w-full max-w-md rounded-lg border border-border bg-surface p-6 shadow-lg sm:p-8 lg:flex-1">
            <div className="grid grid-cols-2 gap-4 border-b border-border pb-6 text-center">
              <div>
                <div className="text-2xl font-extrabold text-primary sm:text-3xl">%0</div>
                <div className="mt-1 text-xs text-text-muted sm:text-sm">teklif ücreti</div>
              </div>
              <div>
                <div className="text-2xl font-extrabold text-primary sm:text-3xl">%0</div>
                <div className="mt-1 text-xs text-text-muted sm:text-sm">komisyon</div>
              </div>
            </div>
            <div className="mt-5 flex flex-col gap-3 text-left">
              {["Telefon doğrulama ile profilini güçlendir", "Bölgene uygun talepler önüne gelsin", "Kazandığın ücret tamamen sana kalır"].map(
                (text) => (
                  <div key={text} className="flex items-center gap-2.5 text-sm">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 text-success">
                      <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.15" />
                      <path d="M8 12.5l2.5 2.5L16 9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-text-muted">{text}</span>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-surface py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">Nasıl Çalışır?</h2>
          <div className="relative mt-12 grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-8">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-6 hidden border-t border-dashed border-border sm:block"
            />
            {STEPS.map((step, i) => (
              <div key={step.title} className="relative text-center sm:text-left">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary bg-bg text-sm font-extrabold text-primary sm:mx-0">
                  {i + 1}
                </div>
                <div className="mt-4 flex items-center justify-center gap-2.5 sm:justify-start">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-100 text-brand-600">
                    <HowItWorksIcon name={step.icon} />
                  </span>
                  <div className="text-lg font-bold">{step.title}</div>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">Neden Teklifler Cepte?</h2>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {BENEFITS.map((item) => (
              <div
                key={item.title}
                className="rounded-lg border border-border bg-surface p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-100 text-brand-600">
                  <TrustIcon name={item.icon} />
                </div>
                <div className="mt-4 text-lg font-bold">{item.title}</div>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-surface px-4 py-12 text-center sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold sm:text-3xl">Hemen ücretsiz kayıt ol</h2>
        <p className="mx-auto mt-2 max-w-xl text-text-muted">
          Kayıt olmak bir dakikadan az sürer, hiçbir ücret ödemezsin.
        </p>
        <Link href="/kayit?rol=usta" className="mt-6 inline-block">
          <Button size="lg">Ücretsiz kayıt ol</Button>
        </Link>
      </section>

      <SiteFooter />
    </div>
  );
}
