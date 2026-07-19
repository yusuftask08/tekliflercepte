import { redirect } from "next/navigation";
import { apiUrl } from "@/lib/api";
import { getSessionUser, getSessionToken } from "@/lib/session";
import { CategoryManager } from "./category-manager";

async function getCategories(token) {
  try {
    const res = await fetch(apiUrl("/categories"), {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return { categories: [], error: true };
    return { categories: await res.json(), error: false };
  } catch {
    return { categories: [], error: true };
  }
}

export default async function KategorilerPage() {
  const user = await getSessionUser();
  if (user.role !== "ADMIN") redirect("/");

  const token = await getSessionToken();
  const { categories, error } = await getCategories(token);

  return (
    <div>
      <div className="mb-5">
        <div className="text-xl font-bold">Kategoriler</div>
        <div className="text-sm text-text-muted">
          {categories.length} ana kategori,{" "}
          {categories.reduce((sum, c) => sum + c.children.length, 0)} alt kategori
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-danger/30 bg-danger/10 px-5 py-4 text-sm text-danger">
          Veriler yüklenemedi, tekrar dene.
        </div>
      ) : (
        <CategoryManager categories={categories} />
      )}
    </div>
  );
}
