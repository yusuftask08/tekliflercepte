import Link from "next/link";
import { AuthShell } from "../auth-shell";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata = {
  title: "Şifreyi Sıfırla — Teklifler Cepte",
};

export default async function SifremiSifirlaPage({ searchParams }) {
  const params = await searchParams;
  const token = params?.token ?? "";

  return (
    <AuthShell
      title="Yeni Şifre Belirle"
      footer={
        <Link href="/giris" className="font-semibold text-primary">
          Giriş sayfasına dön
        </Link>
      }
    >
      {token ? (
        <ResetPasswordForm token={token} />
      ) : (
        <p className="text-sm text-danger">Bağlantı geçersiz. Lütfen email&apos;deki bağlantıyı kullan.</p>
      )}
    </AuthShell>
  );
}
