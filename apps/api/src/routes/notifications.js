import { prisma } from "@tekliflercepte/db";
import { requireAuth } from "../lib/auth.js";

export default async function notificationRoutes(app) {
  app.get("/me/notifications", { preHandler: requireAuth }, async (req) => {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.sub },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    // Opening the notification list is what "seeing" it means — same
    // convention as opening a message thread marking its messages read.
    await prisma.notification.updateMany({
      where: { userId: req.user.sub, readAt: null },
      data: { readAt: new Date() },
    });

    return notifications;
  });

  app.get("/me/notifications/unread-count", { preHandler: requireAuth }, async (req) => {
    const count = await prisma.notification.count({
      where: { userId: req.user.sub, readAt: null },
    });
    return { count };
  });
}
