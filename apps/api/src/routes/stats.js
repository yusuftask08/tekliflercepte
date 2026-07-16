import { prisma } from "@tekliflercepte/db";

/** Public, unauthenticated homepage stats — real numbers only, computed
 *  live from the database. No fabricated placeholders. */
export default async function statsRoutes(app) {
  app.get("/stats/public", async () => {
    const [completedJobsCount, providerCount, ratingAgg] = await Promise.all([
      prisma.offer.count({ where: { status: "SELECTED" } }),
      prisma.providerProfile.count(),
      prisma.providerProfile.aggregate({
        where: { reviewCount: { gt: 0 } },
        _avg: { avgRating: true },
      }),
    ]);

    return {
      completedJobsCount,
      providerCount,
      avgRating: ratingAgg._avg.avgRating ? Number(ratingAgg._avg.avgRating) : null,
    };
  });
}
