import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { LoginForm } from "./login-form";

export default async function GirisPage() {
  const user = await getSessionUser();
  if (user?.role === "ADMIN") redirect("/");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-bg px-4">
      <div className="text-xl font-extrabold">Teklifler Cepte — Panel</div>
      <LoginForm />
    </div>
  );
}
