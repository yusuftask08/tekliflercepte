import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata = {
  title: "Şifremi Unuttum — Teklifler Cepte",
};

export default function SifremiUnuttumPage() {
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10 sm:py-16">
        <h1 className="mb-2 text-2xl font-bold">Şifremi Unuttum</h1>
        <p className="mb-6 text-sm text-text-muted">
          Hesabına kayıtlı email adresini gir, şifre sıfırlama bağlantısı gönderelim.
        </p>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
