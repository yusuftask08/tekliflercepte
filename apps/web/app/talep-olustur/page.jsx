import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { RequestWizard } from "./request-wizard";

async function getCategories() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  try {
    const res = await fetch(`${apiUrl}/categories`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function TalepOlusturPage({ searchParams }) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/giris?next=/talep-olustur");
  }
  if (user.role === "PROVIDER") {
    redirect("/usta/panel");
  }

  const categories = await getCategories();
  const params = await searchParams;
  const preselectedSlug = params?.kategori ?? null;
  const preselectedLeafSlug = params?.hizmet ?? null;

  return (
    <RequestWizard
      categories={categories}
      preselectedSlug={preselectedSlug}
      preselectedLeafSlug={preselectedLeafSlug}
    />
  );
}
