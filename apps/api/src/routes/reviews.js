import { prisma } from "@tekliflercepte/db";
import { requireAuth } from "../lib/auth.js";

export default async function reviewRoutes(app) {
  app.post("/requests/:id/review", { preHandler: requireAuth }, async (req, reply) => {
    const { rating, comment, photos } = req.body ?? {};
    if (!rating || rating < 1 || rating > 5) {
      return reply.code(400).send({ error: "rating 1-5 arasında olmalı" });
    }
    if (photos !== undefined && (!Array.isArray(photos) || photos.length > 3 || photos.some((p) => typeof p !== "string"))) {
      return reply.code(400).send({ error: "photos en fazla 3 fotoğraf URL'si içeren bir dizi olmalı" });
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

    const [review] = await prisma.$transaction([
      prisma.review.create({
        data: {
          serviceRequestId: request.id,
          authorId: req.user.sub,
          targetId: selectedOffer.providerId,
          rating,
          comment,
          photos: photos ?? [],
        },
      }),
      prisma.serviceRequest.update({ where: { id: request.id }, data: { status: "CLOSED" } }),
    ]);

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
