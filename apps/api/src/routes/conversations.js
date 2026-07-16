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

    return offers.map((offer) => {
      const otherParty = isProvider ? offer.serviceRequest.customer : offer.provider;
      return {
        offerId: offer.id,
        category: offer.serviceRequest.category?.name,
        otherPartyName: `${otherParty.firstName} ${otherParty.lastName}`,
        lastMessage: offer.messages[0]?.body ?? null,
        lastMessageAt: offer.messages[0]?.createdAt ?? offer.createdAt,
      };
    });
  });
}
