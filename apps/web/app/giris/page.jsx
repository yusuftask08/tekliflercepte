import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { TrustIcon } from "../trust-icon";
import { AuthShell } from "../auth-shell";
import { LoginForm } from "./login-form";

export default async function GirisPage({ searchParams }) {
  const user = await getSessionUser();
  const params = await searchParams;
  if (user) {
    redirect(params?.next || "/");
  }

  return (
    <AuthShell
      icon="lock"
      title="Giriş Yap"
      footer={
        <span className="flex items-center justify-center gap-1.5 text-xs">
          <TrustIcon name="lock" size={14} />
          Bilgilerin KVKK kapsamında korunur.
        </span>
      }
    >
      <LoginForm next={params?.next} />
    </AuthShell>
  );
}
