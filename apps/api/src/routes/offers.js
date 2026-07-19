import { prisma } from "@tekliflercepte/db";
import { requireAuth } from "../lib/auth.js";
import { safeUserSelect, publicUserSelect } from "../lib/selects.js";
import { sendEmail, escapeHtml } from "../lib/mailer.js";
import { isBlocked } from "../lib/blocks.js";
import { createNotification, createNotifications } from "../lib/notifications.js";

const DAILY_FREE_OFFER_LIMIT = 3;
const WEB_ORIGIN = process.env.WEB_ORIGIN ?? "http://localhost:3002";

export default async function offerRoutes(app) {
  // Auth required: this returns the negotiated price/message plus both
  // participants' info — not something a third party should be able to
  // pull just by knowing/guessing an offer id.
  app.get("/offers/:id", { preHandler: requireAuth }, async (req, reply) => {
    const offer = await prisma.offer.findUnique({
      where: { id: req.params.id },
      include: {
        provider: { select: { ...publicUserSelect, providerProfile: true } },
        serviceRequest: { include: { category: true, customer: { select: publicUserSelect } } },
      },
    });
    if (!offer) return reply.code(404).send({ error: "Teklif bulunamadı" });
    if (req.user.sub !== offer.providerId && req.user.sub !== offer.serviceRequest.customerId) {
      return reply.code(403).send({ error: "Bu teklifin tarafı değilsin" });
    }
    return offer;
  });

  app.post("/requests/:requestId/offers", { preHandler: requireAuth }, async (req, reply) => {
    const { requestId } = req.params;
    const { price, message } = req.body ?? {};

    if (req.user.role !== "PROVIDER") {
      return reply.code(403).send({ error: "Sadece ustalar teklif verebilir" });
    }
    const priceNumber = Number(price);
    if (!Number.isFinite(priceNumber) || priceNumber <= 0) {
      return reply.code(400).send({ error: "Geçerli bir price zorunlu" });
    }

    const targetRequest = await prisma.serviceRequest.findUnique({
      where: { id: requestId },
      select: {
        status: true,
        customerId: true,
        category: { select: { name: true } },
        customer: { select: { firstName: true, email: true } },
      },
    });
    if (!targetRequest) {
      return reply.code(404).send({ error: "Talep bulunamadı" });
    }
    if (targetRequest.status !== "OPEN") {
      return reply.code(409).send({ error: "Bu talep artık teklife açık değil" });
    }
    if (await isBlocked(req.user.sub, targetRequest.customerId)) {
      return reply.code(403).send({ error: "Bu talebe teklif veremezsin" });
    }

    // A provider can withdraw and later change their mind — the unique
    // (serviceRequestId, providerId) constraint means re-offering has to
    // update that same row (upsert below) rather than insert a second one,
    // which would otherwise fail with a constraint violation.
    const existingOffer = await prisma.offer.findUnique({
      where: { serviceRequestId_providerId: { serviceRequestId: requestId, providerId: req.user.sub } },
    });
    if (existingOffer && existingOffer.status !== "WITHDRAWN") {
      return reply.code(409).send({ error: "Bu talebe zaten bir teklifin var" });
    }

    const profile = await prisma.providerProfile.findUnique({
      where: { userId: req.user.sub },
      select: { isPremium: true },
    });
    if (!profile?.isPremium) {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const todayOfferCount = await prisma.offer.count({
        where: { providerId: req.user.sub, createdAt: { gte: startOfToday } },
      });
      if (todayOfferCount >= DAILY_FREE_OFFER_LIMIT) {
        return reply.code(402).send({
          error: `Günlük ücretsiz teklif hakkın (${DAILY_FREE_OFFER_LIMIT}) doldu. Premium ustalar sınırsız teklif verebilir.`,
          limitReached: true,
        });
      }
    }

    const offer = await prisma.offer.upsert({
      where: { serviceRequestId_providerId: { serviceRequestId: requestId, providerId: req.user.sub } },
      create: { serviceRequestId: requestId, providerId: req.user.sub, price: priceNumber, message },
      update: { price: priceNumber, message, status: "PENDING" },
    });

    sendEmail({
      to: targetRequest.customer.email,
      subject: `${targetRequest.category.name} talebine yeni teklif geldi`,
      html: `<p>Merhaba ${escapeHtml(targetRequest.customer.firstName)},</p><p>${escapeHtml(req.user.firstName)} ${escapeHtml(req.user.lastName)} isimli usta, "${escapeHtml(targetRequest.category.name)}" talebine ${priceNumber} ₺ teklif verdi.</p><p><a href="${WEB_ORIGIN}/taleplerim/${requestId}">Teklifi görüntüle</a></p>`,
    });

    await createNotification({
      userId: targetRequest.customerId,
      type: "NEW_OFFER",
      title: "Yeni teklif geldi",
      body: `${req.user.firstName} ${req.user.lastName}, "${targetRequest.category.name}" talebine ${priceNumber} ₺ teklif verdi.`,
      link: `/taleplerim/${requestId}`,
    });

    return reply.code(201).send(offer);
  });

  app.post("/offers/:id/select", { preHandler: requireAuth }, async (req, reply) => {
    const { id } = req.params;
    const offer = await prisma.offer.findUnique({
      where: { id },
      include: {
        serviceRequest: { include: { category: true } },
        provider: { select: { firstName: true, email: true } },
      },
    });
    if (!offer) return reply.code(404).send({ error: "Teklif bulunamadı" });
    if (offer.serviceRequest.customerId !== req.user.sub) {
      return reply.code(403).send({ error: "Bu talebin sahibi değilsin" });
    }

    // Fetched before the transaction rejects them — need their info to
    // notify them afterward, updateMany doesn't return affected rows.
    const otherOffers = await prisma.offer.findMany({
      where: { serviceRequestId: offer.serviceRequestId, id: { not: id }, status: "PENDING" },
      include: { provider: { select: { id: true, firstName: true, email: true } } },
    });

    const [, selected] = await prisma.$transaction([
      prisma.offer.updateMany({
        where: { serviceRequestId: offer.serviceRequestId, id: { not: id } },
        data: { status: "REJECTED" },
      }),
      prisma.offer.update({ where: { id }, data: { status: "SELECTED" } }),
      prisma.serviceRequest.update({
        where: { id: offer.serviceRequestId },
        data: { status: "OFFER_SELECTED" },
      }),
    ]);

    // Keep ProviderProfile.avgPrice in sync — same pattern as
    // avgRating/reviewCount in reviews.js, needed so /providers can filter
    // by price range at the query level.
    const providerProfile = await prisma.providerProfile.findUnique({
      where: { userId: offer.providerId },
    });
    if (providerProfile) {
      const priceAgg = await prisma.offer.aggregate({
        where: { providerId: offer.providerId, status: "SELECTED" },
        _avg: { price: true },
      });
      await prisma.providerProfile.update({
        where: { id: providerProfile.id },
        data: { avgPrice: priceAgg._avg.price },
      });
    }

    sendEmail({
      to: offer.provider.email,
      subject: `Teklifin kabul edildi — ${offer.serviceRequest.category.name}`,
      html: `<p>Merhaba ${escapeHtml(offer.provider.firstName)},</p><p>"${escapeHtml(offer.serviceRequest.category.name)}" talebine verdiğin teklif kabul edildi.</p><p><a href="${WEB_ORIGIN}/mesajlar/${id}">Mesajlaş</a></p>`,
    });

    // The rejected providers only ever found out by re-opening their panel
    // and noticing the badge — now they actually get told.
    await createNotifications(
      otherOffers.map((o) => ({
        userId: o.provider.id,
        type: "OFFER_REJECTED",
        title: "Teklifin bu sefer seçilmedi",
        body: `"${offer.serviceRequest.category.name}" talebi için başka bir teklif seçildi.`,
        link: "/usta/panel",
      }))
    );
    for (const o of otherOffers) {
      sendEmail({
        to: o.provider.email,
        subject: `Teklifin bu sefer seçilmedi — ${offer.serviceRequest.category.name}`,
        html: `<p>Merhaba ${escapeHtml(o.provider.firstName)},</p><p>"${escapeHtml(offer.serviceRequest.category.name)}" talebi için müşteri başka bir teklifi seçti.</p><p><a href="${WEB_ORIGIN}/usta/panel">Panele git</a></p>`,
      });
    }

    return selected;
  });

  app.post("/offers/:id/withdraw", { preHandler: requireAuth }, async (req, reply) => {
    const { id } = req.params;
    const offer = await prisma.offer.findUnique({ where: { id } });
    if (!offer) return reply.code(404).send({ error: "Teklif bulunamadı" });
    if (offer.providerId !== req.user.sub) {
      return reply.code(403).send({ error: "Bu teklifin sahibi değilsin" });
    }
    if (offer.status !== "PENDING") {
      return reply.code(409).send({ error: "Sadece bekleyen teklifler geri çekilebilir" });
    }
    return prisma.offer.update({ where: { id }, data: { status: "WITHDRAWN" } });
  });
}
