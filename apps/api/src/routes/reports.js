import { prisma } from "@tekliflercepte/db";
import { requireAuth } from "../lib/auth.js";

const VALID_REASONS = new Set(["HARASSMENT", "SPAM", "FRAUD", "OTHER"]);

export default async function reportRoutes(app) {
  app.post("/reports", { preHandler: requireAuth }, async (req, reply) => {
    const { reportedUserId, offerId, reason, details } = req.body ?? {};
    if (!reportedUserId || !VALID_REASONS.has(reason)) {
      return reply.code(400).send({ error: "reportedUserId ve geçerli bir reason zorunlu" });
    }
    if (reportedUserId === req.user.sub) {
      return reply.code(400).send({ error: "Kendini raporlayamazsın" });
    }

    const report = await prisma.report.create({
      data: { reporterId: req.user.sub, reportedUserId, offerId, reason, details },
    });
    return reply.code(201).send(report);
  });
}
