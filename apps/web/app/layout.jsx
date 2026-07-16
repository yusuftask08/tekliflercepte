import { ThemeProvider } from "@tekliflercepte/ui";
import { ToastProvider } from "./toast-provider";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tekliflercepte.com";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Teklifler Cepte — Ustanı Bul, Ücretsiz Teklif Al",
    template: "%s | Teklifler Cepte",
  },
  description:
    "Hizmet almak isteyenleri, hizmet verenlerle ücretsiz buluşturan platform. Teklif vermek ücretsiz, komisyon yok.",
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "Teklifler Cepte",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-bg font-sans text-text">
        <ThemeProvider>{children}</ThemeProvider>
        <ToastProvider />
      </body>
    </html>
  );
}
