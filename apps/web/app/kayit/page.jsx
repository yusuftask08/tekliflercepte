import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { RegisterForm } from "./register-form";

export default async function KayitPage({ searchParams }) {
  const user = await getSessionUser();
  const params = await searchParams;
  if (user) {
    redirect(params?.next || "/");
  }
  const defaultRole = params?.rol === "usta" ? "PROVIDER" : "CUSTOMER";

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10 sm:py-16">
        <h1 className="mb-6 text-2xl font-bold">Kayıt Ol</h1>
        <RegisterForm next={params?.next} defaultRole={defaultRole} />
      </div>
    </div>
  );
}
