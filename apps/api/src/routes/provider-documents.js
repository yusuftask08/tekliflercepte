import { prisma } from "@tekliflercepte/db";
import { requireAuth } from "../lib/auth.js";

const VALID_TYPES = new Set(["CERTIFICATE", "INSURANCE"]);

async function getOwnProfile(userId) {
  return prisma.providerProfile.findUnique({ where: { userId } });
}

export default async function providerDocumentRoutes(app) {
  app.get("/me/provider-documents", { preHandler: requireAuth }, async (req, reply) => {
    const profile = await getOwnProfile(req.user.sub);
    if (!profile) return reply.code(404).send({ error: "Usta profili bulunamadı" });
    return prisma.providerDocument.findMany({
      where: { providerProfileId: profile.id },
      orderBy: { createdAt: "desc" },
    });
  });

  app.post("/me/provider-documents", { preHandler: requireAuth }, async (req, reply) => {
    const { type, fileUrl, label } = req.body ?? {};
    if (!VALID_TYPES.has(type) || !fileUrl) {
      return reply.code(400).send({ error: "type (CERTIFICATE veya INSURANCE) ve fileUrl zorunlu" });
    }
    const profile = await getOwnProfile(req.user.sub);
    if (!profile) return reply.code(404).send({ error: "Önce usta profilini tamamlamalısın" });

    return reply.code(201).send(
      await prisma.providerDocument.create({
        data: { providerProfileId: profile.id, type, fileUrl, label: label?.trim() || null },
      })
    );
  });

  app.delete("/me/provider-documents/:id", { preHandler: requireAuth }, async (req, reply) => {
    const profile = await getOwnProfile(req.user.sub);
    if (!profile) return reply.code(404).send({ error: "Usta profili bulunamadı" });
    const doc = await prisma.providerDocument.findUnique({ where: { id: req.params.id } });
    if (!doc || doc.providerProfileId !== profile.id) {
      return reply.code(404).send({ error: "Belge bulunamadı" });
    }
    // Only a still-pending submission can be withdrawn — once admin has
    // reviewed it (approved or rejected), it stays as a real history
    // record instead of quietly disappearing.
    if (doc.status !== "PENDING") {
      return reply.code(409).send({ error: "İncelenmiş bir belge silinemez" });
    }
    await prisma.providerDocument.delete({ where: { id: doc.id } });
    return { ok: true };
  });
}
