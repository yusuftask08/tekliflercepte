import { prisma } from "@tekliflercepte/db";
import { requireAuth } from "../lib/auth.js";
import { safeUserSelect } from "../lib/selects.js";

export default async function favoriteRoutes(app) {
  app.get("/me/favorites", { preHandler: requireAuth }, async (req) => {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user.sub },
      include: {
        provider: {
          select: {
            ...safeUserSelect,
            providerProfile: {
              include: { categories: { include: { category: true } } },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return favorites.map((f) => f.provider);
  });

  app.post("/me/favorites/:providerId", { preHandler: requireAuth }, async (req, reply) => {
    const { providerId } = req.params;
    const provider = await prisma.user.findUnique({ where: { id: providerId, role: "PROVIDER" } });
    if (!provider) return reply.code(404).send({ error: "Usta bulunamadı" });

    await prisma.favorite.upsert({
      where: { userId_providerId: { userId: req.user.sub, providerId } },
      update: {},
      create: { userId: req.user.sub, providerId },
    });
    return reply.code(201).send({ favorited: true });
  });

  app.delete("/me/favorites/:providerId", { preHandler: requireAuth }, async (req) => {
    await prisma.favorite
      .delete({
        where: { userId_providerId: { userId: req.user.sub, providerId: req.params.providerId } },
      })
      .catch(() => null);
    return { favorited: false };
  });
}
