import { prisma } from "@tekliflercepte/db";
import { publicUserSelect } from "../lib/selects.js";

/** Response speed + offer-acceptance trust signals, computed from real offer
 *  history (no fabricated stats) — how fast a provider typically sends an
 *  offer after a matching request appears, and what share of their offers
 *  customers go on to select. */
async function getTrustStats(providerIds) {
  const offers = await prisma.offer.findMany({
    where: { providerId: { in: providerIds } },
    select: {
      providerId: true,
      status: true,
      createdAt: true,
      serviceRequest: { select: { createdAt: true } },
    },
  });

  const buckets = new Map(
    providerIds.map((id) => [id, { responseMinutesSum: 0, responseCount: 0, total: 0, selected: 0 }])
  );

  for (const offer of offers) {
    const bucket = buckets.get(offer.providerId);
    if (!bucket) continue;
    bucket.total += 1;
    if (offer.status === "SELECTED") bucket.selected += 1;
    const minutes = (offer.createdAt.getTime() - offer.serviceRequest.createdAt.getTime()) / 60000;
    if (minutes >= 0) {
      bucket.responseMinutesSum += minutes;
      bucket.responseCount += 1;
    }
  }

  const result = new Map();
  for (const [id, bucket] of buckets) {
    result.set(id, {
      avgResponseMinutes:
        bucket.responseCount > 0 ? Math.round(bucket.responseMinutesSum / bucket.responseCount) : null,
      acceptanceRate: bucket.total > 0 ? Math.round((bucket.selected / bucket.total) * 100) : null,
      offerCount: bucket.total,
    });
  }
  return result;
}

export default async function providerRoutes(app) {
  app.get("/providers", async (req) => {
    const { city, kategori, q } = req.query ?? {};

    const providers = await prisma.user.findMany({
      where: {
        role: "PROVIDER",
        providerProfile: {
          is: {
            isAvailable: true,
            ...(city ? { OR: [{ city }, { serviceCities: { has: city } }] } : {}),
            ...(kategori
              ? {
                  categories: {
                    some: {
                      category: { OR: [{ slug: kategori }, { parent: { slug: kategori } }] },
                    },
                  },
                }
              : {}),
          },
        },
        ...(q
          ? {
              OR: [
                { firstName: { contains: q, mode: "insensitive" } },
                { lastName: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      select: {
        ...publicUserSelect,
        providerProfile: {
          include: { categories: { include: { category: true } } },
        },
      },
      orderBy: { providerProfile: { avgRating: "desc" } },
      take: 60,
    });

    const withProfile = providers.filter((p) => p.providerProfile);
    const trustStats = await getTrustStats(withProfile.map((p) => p.id));
    return withProfile.map((p) => ({ ...p, trust: trustStats.get(p.id) }));
  });

  /** (city, category-slug) combinations that have at least one provider —
   *  used to build SEO landing-page URLs for the sitemap without indexing
   *  empty, thin-content pages. */
  app.get("/providers/coverage", async () => {
    const profiles = await prisma.providerProfile.findMany({
      where: { isAvailable: true },
      select: {
        city: true,
        categories: { select: { category: { select: { slug: true } } } },
      },
    });

    const counts = new Map();
    for (const profile of profiles) {
      for (const { category } of profile.categories) {
        const key = `${profile.city}::${category.slug}`;
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
    }

    return Array.from(counts.entries()).map(([key, count]) => {
      const [city, kategori] = key.split("::");
      return { city, kategori, count };
    });
  });

  app.get("/providers/:id", async (req, reply) => {
    const provider = await prisma.user.findUnique({
      where: { id: req.params.id, role: "PROVIDER" },
      select: {
        ...publicUserSelect,
        providerProfile: {
          include: { categories: { include: { category: true } } },
        },
        reviewsReceived: {
          include: { author: { select: publicUserSelect } },
          orderBy: { createdAt: "desc" },
        },
      },
    });
    if (!provider) return reply.code(404).send({ error: "Usta bulunamadı" });

    const completedJobsCount = await prisma.offer.count({
      where: { providerId: provider.id, status: "SELECTED" },
    });
    const priceStats = await prisma.offer.aggregate({
      where: { providerId: provider.id, status: "SELECTED" },
      _avg: { price: true },
    });
    const trustStats = await getTrustStats([provider.id]);

    return {
      ...provider,
      completedJobsCount,
      avgPrice: priceStats._avg.price,
      trust: trustStats.get(provider.id),
    };
  });
}
