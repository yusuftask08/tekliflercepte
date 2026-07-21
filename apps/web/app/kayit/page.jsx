import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { TrustIcon } from "../trust-icon";
import { AuthShell } from "../auth-shell";
import { RegisterForm } from "./register-form";

export default async function KayitPage({ searchParams }) {
  const user = await getSessionUser();
  const params = await searchParams;
  if (user) {
    redirect(params?.next || "/");
  }
  const defaultRole = params?.rol === "usta" ? "PROVIDER" : "CUSTOMER";

  return (
    <AuthShell
      title="Kayıt Ol"
      footer={
        <span className="flex items-center justify-center gap-1.5 text-xs">
          <TrustIcon name="lock" size={14} />
          Bilgilerin KVKK kapsamında korunur.
        </span>
      }
    >
      <RegisterForm next={params?.next} defaultRole={defaultRole} />
    </AuthShell>
  );
}
