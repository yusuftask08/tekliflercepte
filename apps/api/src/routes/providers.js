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

const PAGE_SIZE = 20;

function buildProvidersWhere({ city, kategori, q, minRating, minPrice, maxPrice }) {
  return {
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
        ...(minRating ? { avgRating: { gte: Number(minRating) } } : {}),
        ...(minPrice || maxPrice
          ? {
              avgPrice: {
                ...(minPrice ? { gte: Number(minPrice) } : {}),
                ...(maxPrice ? { lte: Number(maxPrice) } : {}),
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
            { providerProfile: { is: { businessName: { contains: q, mode: "insensitive" } } } },
            { providerProfile: { is: { bio: { contains: q, mode: "insensitive" } } } },
          ],
        }
      : {}),
  };
}

// Most providers sit at avgRating 0 (new/unrated) — sorting by rating alone
// leaves them in undefined order, permanently buried. reviewCount/createdAt
// tiebreak keeps that group stable and gives new providers a fair position.
function buildProvidersOrderBy(sort) {
  if (sort === "new") return { providerProfile: { createdAt: "desc" } };
  // isPremium boost only applies to the default/rating sort — "new" is
  // meant to show genuinely newest providers, boosting would defeat that.
  return [
    { providerProfile: { isPremium: "desc" } },
    { providerProfile: { avgRating: "desc" } },
    { providerProfile: { reviewCount: "desc" } },
    { providerProfile: { createdAt: "desc" } },
  ];
}

export default async function providerRoutes(app) {
  app.get("/providers", async (req) => {
    const { city, kategori, q, sort, minRating, minPrice, maxPrice, page } = req.query ?? {};
    const where = buildProvidersWhere({ city, kategori, q, minRating, minPrice, maxPrice });
    const pageNum = Math.max(1, Number(page) || 1);
    const skip = (pageNum - 1) * PAGE_SIZE;

    const [providers, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          ...publicUserSelect,
          providerProfile: {
            include: { categories: { include: { category: true } } },
          },
        },
        orderBy: buildProvidersOrderBy(sort),
        take: PAGE_SIZE,
        skip,
      }),
      prisma.user.count({ where }),
    ]);

    const withProfile = providers.filter((p) => p.providerProfile);
    const trustStats = await getTrustStats(withProfile.map((p) => p.id));
    return {
      providers: withProfile.map((p) => ({ ...p, trust: trustStats.get(p.id) })),
      total,
      hasMore: skip + PAGE_SIZE < total,
    };
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

  const REVIEW_PAGE_SIZE = 10;

  function reviewOrderBy(reviewSirala) {
    if (reviewSirala === "puan-yuksek") return { rating: "desc" };
    if (reviewSirala === "puan-dusuk") return { rating: "asc" };
    return { createdAt: "desc" };
  }

  app.get("/providers/:id", async (req, reply) => {
    const { reviewSayfa, reviewSirala } = req.query ?? {};
    const reviewPageNum = Math.max(1, Number(reviewSayfa) || 1);
    const reviewSkip = (reviewPageNum - 1) * REVIEW_PAGE_SIZE;

    const provider = await prisma.user.findUnique({
      where: { id: req.params.id, role: "PROVIDER" },
      select: {
        ...publicUserSelect,
        providerProfile: {
          include: { categories: { include: { category: true } } },
        },
        reviewsReceived: {
          include: { author: { select: publicUserSelect } },
          orderBy: reviewOrderBy(reviewSirala),
          take: REVIEW_PAGE_SIZE,
          skip: reviewSkip,
        },
      },
    });
    if (!provider) return reply.code(404).send({ error: "Usta bulunamadı" });

    const completedJobsCount = await prisma.offer.count({
      where: { providerId: provider.id, status: "SELECTED" },
    });
    const reviewTotal = await prisma.review.count({ where: { targetId: provider.id } });
    const trustStats = await getTrustStats([provider.id]);

    return {
      ...provider,
      completedJobsCount,
      reviewTotal,
      reviewHasMore: reviewSkip + REVIEW_PAGE_SIZE < reviewTotal,
      // Denormalized on ProviderProfile, kept in sync in POST
      // /offers/:id/select — no need for a fresh aggregate here.
      avgPrice: provider.providerProfile?.avgPrice ?? null,
      trust: trustStats.get(provider.id),
    };
  });
}
