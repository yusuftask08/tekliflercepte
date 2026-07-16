import { prisma } from "@tekliflercepte/db";

export function createNotification({ userId, type, title, body, link }) {
  return prisma.notification.create({ data: { userId, type, title, body, link } });
}

export function createNotifications(rows) {
  if (rows.length === 0) return Promise.resolve();
  return prisma.notification.createMany({ data: rows });
}

/** Same matching rule as GET /me/matching-requests: category overlap + the
 *  request's city being one of the provider's home city or extra service
 *  cities, restricted to providers currently taking work. */
export async function findMatchingProviderIds({ categoryId, city }) {
  const profiles = await prisma.providerProfile.findMany({
    where: {
      isAvailable: true,
      categories: { some: { categoryId } },
      OR: [{ city }, { serviceCities: { has: city } }],
    },
    select: { userId: true },
  });
  return profiles.map((p) => p.userId);
}
