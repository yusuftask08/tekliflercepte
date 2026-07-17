import { prisma } from "@tekliflercepte/db";
import { requireAuth } from "../lib/auth.js";
import { safeUserSelect } from "../lib/selects.js";
import { sendEmail, escapeHtml } from "../lib/mailer.js";
import { isBlocked } from "../lib/blocks.js";
import { createNotification } from "../lib/notifications.js";
import { subscribe, unsubscribe, publish } from "../lib/message-broadcaster.js";

const HEARTBEAT_MS = 20000;
const DEFAULT_TAKE = 30;
const MAX_TAKE = 50;
const MAX_BODY_LENGTH = 2000;

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

    const { before, since } = req.query ?? {};
    const take = Math.min(Number(req.query?.take) || DEFAULT_TAKE, MAX_TAKE);

    // Reconnect resync: everything strictly newer than the last message the
    // client already has, oldest-first (small set, no pagination needed).
    if (since) {
      return prisma.message.findMany({
        where: { offerId: req.params.offerId, createdAt: { gt: new Date(since) } },
        include: { sender: { select: safeUserSelect } },
        orderBy: { createdAt: "asc" },
        take: MAX_TAKE,
      });
    }

    // "Load older" pagination: strictly older than a given message, most
    // recent first internally so `take` grabs the right window, then
    // reversed back to chronological order for the client.
    let cursorDate;
    if (before) {
      const cursor = await prisma.message.findUnique({
        where: { id: before },
        select: { createdAt: true },
      });
      cursorDate = cursor?.createdAt;
    }

    const messages = await prisma.message.findMany({
      where: {
        offerId: req.params.offerId,
        ...(cursorDate ? { createdAt: { lt: cursorDate } } : {}),
      },
      include: { sender: { select: safeUserSelect } },
      orderBy: { createdAt: "desc" },
      take,
    });

    return messages.reverse();
  });

  app.post(
    "/offers/:offerId/messages",
    // Tighter than the global 100/min — stops one conversation from being
    // used to spam a single recipient.
    { preHandler: requireAuth, config: { rateLimit: { max: 20, timeWindow: "1 minute" } } },
    async (req, reply) => {
      const offer = await assertParticipant(req, reply, req.params.offerId);
      if (!offer) return;

      const { body, imageUrl } = req.body ?? {};
      if (!body && !imageUrl) {
        return reply.code(400).send({ error: "body veya imageUrl zorunlu" });
      }
      if (body && body.length > MAX_BODY_LENGTH) {
        return reply.code(400).send({ error: `Mesaj en fazla ${MAX_BODY_LENGTH} karakter olabilir` });
      }
      const otherPartyId =
        req.user.sub === offer.providerId ? offer.serviceRequest.customerId : offer.providerId;
      if (await isBlocked(req.user.sub, otherPartyId)) {
        return reply.code(403).send({ error: "Bu kullanıcıyla mesajlaşamazsın" });
      }
      const message = await prisma.message.create({
        data: { offerId: req.params.offerId, senderId: req.user.sub, body: body || null, imageUrl: imageUrl || null },
        include: { sender: { select: safeUserSelect } },
      });

      const isSenderProvider = req.user.sub === offer.providerId;
      const recipient = isSenderProvider ? offer.serviceRequest.customer : offer.provider;
      const senderName = isSenderProvider ? offer.provider.firstName : offer.serviceRequest.customer.firstName;
      const previewText = body || "📷 Fotoğraf gönderdi";
      sendEmail({
        to: recipient.email,
        subject: `${senderName} sana yeni bir mesaj gönderdi`,
        html: `<p>Merhaba ${escapeHtml(recipient.firstName)},</p><p>${escapeHtml(senderName)}: "${escapeHtml(previewText)}"</p><p><a href="${WEB_ORIGIN}/mesajlar/${req.params.offerId}">Yanıtla</a></p>`,
      });

      await createNotification({
        userId: otherPartyId,
        type: "NEW_MESSAGE",
        title: `${senderName} sana mesaj gönderdi`,
        body: previewText,
        link: `/mesajlar/${req.params.offerId}`,
      });

      publish(req.params.offerId, { kind: "message", ...message });

      return reply.code(201).send(message);
    }
  );

  // No persistence — just a live "someone is typing" ping over the same SSE
  // channel messages use, distinguished by `kind`.
  app.post("/offers/:offerId/typing", { preHandler: requireAuth }, async (req, reply) => {
    const offer = await assertParticipant(req, reply, req.params.offerId);
    if (!offer) return;

    publish(req.params.offerId, { kind: "typing", userId: req.user.sub });
    // 200 + body, not 204 — the web app's proxy route (proxyAuthed) always
    // calls res.json() on the response, which throws on an empty body.
    return { ok: true };
  });

  // Server-Sent Events push for the open thread — no polling. Proxied
  // through a Next.js route handler (which attaches the Bearer token
  // server-side), so the browser's EventSource just points at same-origin
  // /api/... and never needs the JWT itself.
  app.get("/offers/:offerId/messages/stream", { preHandler: requireAuth }, async (req, reply) => {
    const offer = await assertParticipant(req, reply, req.params.offerId);
    if (!offer) return;

    reply.hijack();
    reply.raw.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    });
    reply.raw.write(":ok\n\n");

    subscribe(req.params.offerId, reply.raw);
    const heartbeat = setInterval(() => reply.raw.write(":hb\n\n"), HEARTBEAT_MS);

    req.raw.on("close", () => {
      clearInterval(heartbeat);
      unsubscribe(req.params.offerId, reply.raw);
    });
  });
}
