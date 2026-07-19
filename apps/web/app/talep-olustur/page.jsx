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
  // No guest guard here on purpose — filling the form is the whole point of
  // this page, and forcing login first just loses guests before they've
  // seen any value. Auth is only required at actual submit time
  // (RequestWizard's 401 handling below saves the draft and sends them to
  // login, then resumes and auto-submits when they land back here).
  const user = await getSessionUser();
  if (user?.role === "PROVIDER") {
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
