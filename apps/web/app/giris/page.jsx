import { redirect } from "next/navigation";
import { SiteHeader } from "../site-header";
import { getSessionUser } from "@/lib/session";
import { LoginForm } from "./login-form";

export default async function GirisPage({ searchParams }) {
  const user = await getSessionUser();
  const params = await searchParams;
  if (user) {
    redirect(params?.next || "/");
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10 sm:py-16">
        <h1 className="mb-6 text-2xl font-bold">Giriş Yap</h1>
        <LoginForm next={params?.next} />
      </div>
    </div>
  );
}
