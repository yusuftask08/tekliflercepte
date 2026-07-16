import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@tekliflercepte/ui";
import { HowItWorksIcon } from "../how-it-works-icon";
import { SiteHeader } from "../site-header";
import { SiteFooter } from "../site-footer";
import { getSessionUser } from "@/lib/session";

export const metadata = {
  title: "Hizmet Ver — Teklifler Cepte",
  description:
    "Teklifler Cepte'de usta olarak teklif vermek tamamen ücretsiz, komisyon yok. Ücretsiz kayıt ol, sana uygun taleplere teklif ver.",
};

const BENEFITS = [
  {
    title: "Teklif vermek ücretsiz",
    body: "Diğer platformların aksine teklif verme ücreti almıyoruz — sınırsız teklif ver.",
    tone: "bg-brand-100 text-brand-600",
  },
  {
    title: "Komisyon yok",
    body: "İşi kazandığında da bir kesinti yok. Kazandığın ücret tamamen sana kalır.",
    tone: "bg-info/10 text-info",
  },
  {
    title: "Güvenilir profil",
    body: "Telefon doğrulama, puan ve tamamlanan iş sayınla müşterilerin gözünde öne çık.",
    tone: "bg-success/10 text-success",
  },
];

const STEPS = [
  {
    icon: "request",
    tone: "bg-brand-100 text-brand-600",
    title: "Ücretsiz kayıt ol",
    body: "Birkaç adımda hesabını oluştur, hizmet verdiğin kategorileri seç.",
  },
  {
    icon: "compare",
    tone: "bg-info/10 text-info",
    title: "Sana uygun talepleri gör",
    body: "Kategorine ve bölgene uygun açık talepler önüne gelsin.",
  },
  {
    icon: "choose",
    tone: "bg-success/10 text-success",
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
      <SiteHeader />

      <section className="px-4 py-10 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 text-center lg:flex-row lg:text-left">
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
                  Ücretsiz Kayıt Ol
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative w-full max-w-md overflow-hidden rounded-lg bg-gradient-to-br from-primary to-primary-strong p-6 shadow-lg sm:p-10 lg:flex-1">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-white/10"
            />
            <div className="relative grid grid-cols-2 gap-4 text-center text-text-on-brand">
              <div>
                <div className="text-2xl font-extrabold sm:text-3xl">%0</div>
                <div className="mt-1 text-xs opacity-85 sm:text-sm">teklif ücreti</div>
              </div>
              <div>
                <div className="text-2xl font-extrabold sm:text-3xl">%0</div>
                <div className="mt-1 text-xs opacity-85 sm:text-sm">komisyon</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-surface px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">Nasıl Çalışır?</h2>
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.title} className="text-center sm:text-left">
                <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-lg sm:mx-0 ${step.tone}`}>
                  <HowItWorksIcon name={step.icon} />
                </div>
                <div className="mt-4 text-lg font-bold">{step.title}</div>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">Neden Teklifler Cepte?</h2>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {BENEFITS.map((item) => (
              <div
                key={item.title}
                className="rounded-lg border border-border bg-surface p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-lg ${item.tone}`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="text-lg font-bold">{item.title}</div>
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
          <Button size="lg">Ücretsiz Kayıt Ol</Button>
        </Link>
      </section>

      <SiteFooter />
    </div>
  );
}
