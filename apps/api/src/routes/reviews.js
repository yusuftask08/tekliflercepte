import { prisma } from "@tekliflercepte/db";
import { requireAuth } from "../lib/auth.js";

export default async function reviewRoutes(app) {
  app.post("/requests/:id/review", { preHandler: requireAuth }, async (req, reply) => {
    const { rating, comment } = req.body ?? {};
    if (!rating || rating < 1 || rating > 5) {
      return reply.code(400).send({ error: "rating 1-5 arasında olmalı" });
    }

    const request = await prisma.serviceRequest.findUnique({
      where: { id: req.params.id },
      include: { offers: { where: { status: "SELECTED" } }, review: true },
    });
    if (!request) return reply.code(404).send({ error: "Talep bulunamadı" });
    if (request.customerId !== req.user.sub) {
      return reply.code(403).send({ error: "Bu talebin sahibi değilsin" });
    }
    if (request.review) return reply.code(409).send({ error: "Bu talep için zaten değerlendirme yapılmış" });
    const selectedOffer = request.offers[0];
    if (!selectedOffer) {
      return reply.code(400).send({ error: "Değerlendirme yapabilmek için seçilmiş bir teklif olmalı" });
    }

    const review = await prisma.review.create({
      data: {
        serviceRequestId: request.id,
        authorId: req.user.sub,
        targetId: selectedOffer.providerId,
        rating,
        comment,
      },
    });

    const providerProfile = await prisma.providerProfile.findUnique({
      where: { userId: selectedOffer.providerId },
    });
    if (providerProfile) {
      const agg = await prisma.review.aggregate({
        where: { targetId: selectedOffer.providerId },
        _avg: { rating: true },
        _count: true,
      });
      await prisma.providerProfile.update({
        where: { id: providerProfile.id },
        data: { avgRating: agg._avg.rating ?? 0, reviewCount: agg._count },
      });
    }

    return reply.code(201).send(review);
  });
}
