import { apiUrl } from "@/lib/api";

async function getCategories() {
  const res = await fetch(apiUrl("/categories"), { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export default async function KategorilerPage() {
  const categories = await getCategories();

  return (
    <div>
      <div className="mb-5">
        <div className="text-xl font-bold">Kategoriler</div>
        <div className="text-sm text-text-muted">
          {categories.length} ana kategori,{" "}
          {categories.reduce((sum, c) => sum + c.children.length, 0)} alt kategori
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((group) => (
          <div key={group.id} className="rounded-lg border border-border bg-surface p-4 shadow-sm">
            <div className="font-bold">{group.name}</div>
            <div className="mt-1 text-xs text-text-muted">{group.children.length} alt kategori</div>
            {group.questions && (
              <div className="mt-1 text-xs text-text-muted">{group.questions.length} kalifikasyon sorusu</div>
            )}
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {group.children.map((sub) => (
                <li
                  key={sub.id}
                  className="rounded-full bg-brand-50 px-2.5 py-1 text-xs text-brand-700"
                >
                  {sub.name}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
