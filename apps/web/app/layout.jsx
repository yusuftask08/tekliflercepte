import { ThemeProvider } from "@tekliflercepte/ui";
import { ToastProvider } from "./toast-provider";
import { BottomNavWrapper } from "./bottom-nav-wrapper";
import { SiteHeaderWrapper } from "./site-header-wrapper";
import { getUnreadCount } from "@/lib/api";
import { getSessionToken, getSessionUser } from "@/lib/session";
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
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Teklifler Cepte",
  },
};

export const viewport = {
  themeColor: "#0c7c67",
};

export default async function RootLayout({ children }) {
  const user = await getSessionUser();
  const unreadCount = user ? await getUnreadCount(await getSessionToken()) : 0;

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
      <body className="min-h-screen bg-bg pb-16 font-sans text-text lg:pb-0" suppressHydrationWarning>
        <ThemeProvider>
          <SiteHeaderWrapper user={user} unreadCount={unreadCount} />
          {children}
        </ThemeProvider>
        <ToastProvider />
        <BottomNavWrapper user={user} unreadCount={unreadCount} />
      </body>
    </html>
  );
}
