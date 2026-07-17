export const metadata = { title: "İletişim — Teklifler Cepte" };

export default function IletisimPage() {
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <div className="mx-auto w-full max-w-xl flex-1 px-4 py-10 sm:px-6 sm:py-16">
        <h1 className="text-2xl font-bold sm:text-3xl">İletişim</h1>
        <p className="mt-4 text-text-muted">
          Sorularınız veya geri bildirimleriniz için bize e-posta ile ulaşabilirsiniz.
        </p>
        <a
          href="mailto:destek@tekliflercepte.com"
          className="mt-4 inline-block text-lg font-semibold text-primary"
        >
          destek@tekliflercepte.com
        </a>
      </div>
    </div>
  );
}
