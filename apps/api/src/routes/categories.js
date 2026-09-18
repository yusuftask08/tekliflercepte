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

  // Real accepted-offer prices, never a fabricated/guessed number — see
  // MIN_SAMPLE_SIZE below for why a thin sample returns unavailable instead
  // of a misleading range.
  const MIN_SAMPLE_SIZE = 5;

  app.get("/categories/:id/price-estimate", async (req) => {
    const { city } = req.query ?? {};
    const baseWhere = { status: "SELECTED", serviceRequest: { categoryId: req.params.id } };

    async function aggregate(where) {
      const [agg, sampleSize] = await Promise.all([
        prisma.offer.aggregate({ where, _min: { price: true }, _max: { price: true }, _avg: { price: true } }),
        prisma.offer.count({ where }),
      ]);
      return { agg, sampleSize };
    }

    // City-scoped estimate is more useful (prices vary a lot by region) —
    // only fall back to the category-wide number when there isn't enough
    // local data yet, rather than never showing anything for smaller cities.
    let { agg, sampleSize } = city
      ? await aggregate({ ...baseWhere, serviceRequest: { ...baseWhere.serviceRequest, city } })
      : { agg: null, sampleSize: 0 };
    let scope = "city";
    if (sampleSize < MIN_SAMPLE_SIZE) {
      ({ agg, sampleSize } = await aggregate(baseWhere));
      scope = "category";
    }

    if (sampleSize < MIN_SAMPLE_SIZE) {
      return { available: false, sampleSize };
    }
    return {
      available: true,
      scope,
      sampleSize,
      min: Math.round(Number(agg._min.price)),
      max: Math.round(Number(agg._max.price)),
      avg: Math.round(Number(agg._avg.price)),
    };
  });
}
