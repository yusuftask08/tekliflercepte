import { prisma } from "@tekliflercepte/db";
import { requireAuth } from "../lib/auth.js";
import { safeUserSelect } from "../lib/selects.js";
import { sendEmail, escapeHtml } from "../lib/mailer.js";
import { isBlocked } from "../lib/blocks.js";

const WEB_ORIGIN = process.env.WEB_ORIGIN ?? "http://localhost:3002";

async function assertParticipant(req, reply, offerId) {
  const offer = await prisma.offer.findUnique({
    where: { id: offerId },
    select: {
      providerId: true,
      provider: { select: { firstName: true, email: true } },
      serviceRequest: {
        select: { customerId: true, customer: { select: { firstName: true, email: true } } },
      },
    },
  });
  if (!offer) {
    reply.code(404).send({ error: "Teklif bulunamadı" });
    return null;
  }
  if (req.user.sub !== offer.providerId && req.user.sub !== offer.serviceRequest.customerId) {
    reply.code(403).send({ error: "Bu görüşmenin tarafı değilsin" });
    return null;
  }
  return offer;
}

export default async function messageRoutes(app) {
  app.get("/offers/:offerId/messages", { preHandler: requireAuth }, async (req, reply) => {
    const offer = await assertParticipant(req, reply, req.params.offerId);
    if (!offer) return;

    // Viewing the thread marks the other party's messages as read — the
    // read receipt reflects "they opened this conversation", not per-message.
    await prisma.message.updateMany({
      where: { offerId: req.params.offerId, senderId: { not: req.user.sub }, readAt: null },
      data: { readAt: new Date() },
    });

    return prisma.message.findMany({
      where: { offerId: req.params.offerId },
      include: { sender: { select: safeUserSelect } },
      orderBy: { createdAt: "asc" },
    });
  });

  app.post("/offers/:offerId/messages", { preHandler: requireAuth }, async (req, reply) => {
    const offer = await assertParticipant(req, reply, req.params.offerId);
    if (!offer) return;

    const { body } = req.body ?? {};
    if (!body) {
      return reply.code(400).send({ error: "body zorunlu" });
    }
    const otherPartyId =
      req.user.sub === offer.providerId ? offer.serviceRequest.customerId : offer.providerId;
    if (await isBlocked(req.user.sub, otherPartyId)) {
      return reply.code(403).send({ error: "Bu kullanıcıyla mesajlaşamazsın" });
    }
    const message = await prisma.message.create({
      data: { offerId: req.params.offerId, senderId: req.user.sub, body },
      include: { sender: { select: safeUserSelect } },
    });

    const isSenderProvider = req.user.sub === offer.providerId;
    const recipient = isSenderProvider ? offer.serviceRequest.customer : offer.provider;
    const senderName = isSenderProvider ? offer.provider.firstName : offer.serviceRequest.customer.firstName;
    sendEmail({
      to: recipient.email,
      subject: `${senderName} sana yeni bir mesaj gönderdi`,
      html: `<p>Merhaba ${escapeHtml(recipient.firstName)},</p><p>${escapeHtml(senderName)}: "${escapeHtml(body)}"</p><p><a href="${WEB_ORIGIN}/mesajlar/${req.params.offerId}">Yanıtla</a></p>`,
    });

    return reply.code(201).send(message);
  });
}
