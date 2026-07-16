import { prisma } from "@tekliflercepte/db";
import { requireAuth } from "../lib/auth.js";
import { safeUserSelect } from "../lib/selects.js";

export default async function conversationRoutes(app) {
  app.get("/me/conversations", { preHandler: requireAuth }, async (req) => {
    const isProvider = req.user.role === "PROVIDER";
    const offers = await prisma.offer.findMany({
      where: isProvider
        ? { providerId: req.user.sub }
        : { serviceRequest: { customerId: req.user.sub } },
      include: {
        serviceRequest: { include: { category: true, customer: { select: safeUserSelect } } },
        provider: { select: safeUserSelect },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
    });

    const unreadCounts = await prisma.message.groupBy({
      by: ["offerId"],
      where: {
        offerId: { in: offers.map((o) => o.id) },
        senderId: { not: req.user.sub },
        readAt: null,
      },
      _count: true,
    });
    const unreadByOffer = new Map(unreadCounts.map((row) => [row.offerId, row._count]));

    return offers.map((offer) => {
      const otherParty = isProvider ? offer.serviceRequest.customer : offer.provider;
      return {
        offerId: offer.id,
        category: offer.serviceRequest.category?.name,
        otherPartyName: `${otherParty.firstName} ${otherParty.lastName}`,
        lastMessage: offer.messages[0]?.body ?? null,
        lastMessageAt: offer.messages[0]?.createdAt ?? offer.createdAt,
        unreadCount: unreadByOffer.get(offer.id) ?? 0,
      };
    });
  });

  app.get("/me/unread-count", { preHandler: requireAuth }, async (req) => {
    const isProvider = req.user.role === "PROVIDER";
    const count = await prisma.message.count({
      where: {
        senderId: { not: req.user.sub },
        readAt: null,
        offer: isProvider
          ? { providerId: req.user.sub }
          : { serviceRequest: { customerId: req.user.sub } },
      },
    });
    return { count };
  });
}
