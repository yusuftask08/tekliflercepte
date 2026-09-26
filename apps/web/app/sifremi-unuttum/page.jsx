import Link from "next/link";
import { AuthShell } from "../auth-shell";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata = {
  title: "Şifremi Unuttum — Teklifler Cepte",
};

export default function SifremiUnuttumPage() {
  return (
    <AuthShell
      title="Şifremi Unuttum"
      subtitle="Hesabına kayıtlı email adresini gir, şifre sıfırlama bağlantısı gönderelim."
      footer={
        <Link href="/giris" className="font-semibold text-primary">
          Giriş sayfasına dön
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
