import { prisma } from "@tekliflercepte/db";
import { requireAuth } from "../lib/auth.js";

export default async function blockRoutes(app) {
  app.get("/me/blocks", { preHandler: requireAuth }, async (req) => {
    const blocks = await prisma.block.findMany({
      where: { blockerId: req.user.sub },
      select: { blockedUserId: true },
    });
    return blocks.map((b) => b.blockedUserId);
  });

  app.post("/me/blocks/:userId", { preHandler: requireAuth }, async (req, reply) => {
    const { userId } = req.params;
    if (userId === req.user.sub) {
      return reply.code(400).send({ error: "Kendini engelleyemezsin" });
    }
    await prisma.block.upsert({
      where: { blockerId_blockedUserId: { blockerId: req.user.sub, blockedUserId: userId } },
      update: {},
      create: { blockerId: req.user.sub, blockedUserId: userId },
    });
    return reply.code(201).send({ blocked: true });
  });

  app.delete("/me/blocks/:userId", { preHandler: requireAuth }, async (req) => {
    await prisma.block
      .delete({
        where: { blockerId_blockedUserId: { blockerId: req.user.sub, blockedUserId: req.params.userId } },
      })
      .catch(() => null);
    return { blocked: false };
  });
}
