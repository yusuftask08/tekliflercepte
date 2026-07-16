import { prisma } from "@tekliflercepte/db";

// Category has no timestamp/sortOrder field, so DB-level ordering can only
// be alphabetical — which puts the "Diğer" catch-all first. Fixed display
// order instead; anything not listed here (shouldn't happen) sorts last.
const CATEGORY_ORDER = ["temizlik", "tadilat", "nakliyat", "tamir", "ozel-ders", "organizasyon", "diger"];

export default async function categoryRoutes(app) {
  app.get("/categories", async () => {
    const categories = await prisma.category.findMany({
      where: { parentId: null },
      include: { children: true },
    });
    return categories.sort((a, b) => {
      const ai = CATEGORY_ORDER.indexOf(a.slug);
      const bi = CATEGORY_ORDER.indexOf(b.slug);
      return (ai === -1 ? CATEGORY_ORDER.length : ai) - (bi === -1 ? CATEGORY_ORDER.length : bi);
    });
  });
}
