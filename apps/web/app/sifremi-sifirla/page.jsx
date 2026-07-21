import Link from "next/link";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata = {
  title: "Şifreyi Sıfırla — Teklifler Cepte",
};

export default async function SifremiSifirlaPage({ searchParams }) {
  const params = await searchParams;
  const token = params?.token ?? "";

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10 sm:py-16">
        <div className="rounded-lg border border-border bg-surface p-6 shadow-md sm:p-8">
          <h1 className="mb-6 text-2xl font-bold">Yeni Şifre Belirle</h1>
          {token ? (
            <ResetPasswordForm token={token} />
          ) : (
            <p className="text-sm text-danger">Bağlantı geçersiz. Lütfen email&apos;deki bağlantıyı kullan.</p>
          )}
        </div>
        <p className="mt-5 text-center text-sm text-text-muted">
          <Link href="/giris" className="font-semibold text-primary">
            Giriş sayfasına dön
          </Link>
        </p>
      </div>
    </div>
  );
}
