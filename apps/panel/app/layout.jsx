import { ThemeProvider } from "@tekliflercepte/ui";
import "./globals.css";

export const metadata = {
  title: "Teklifler Cepte — Panel",
  description: "Yönetim paneli",
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
      </body>
    </html>
  );
}
