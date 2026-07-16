import { randomBytes } from "node:crypto";
import { prisma } from "@tekliflercepte/db";
import { requireAdmin, hashPassword } from "../lib/auth.js";
import { safeUserSelect } from "../lib/selects.js";
import { sendEmail, escapeHtml } from "../lib/mailer.js";

const WEB_ORIGIN = process.env.WEB_ORIGIN ?? "http://localhost:3002";

export default async function adminRoutes(app) {
  app.post("/admin/requests/:id/approve", { preHandler: requireAdmin }, async (req, reply) => {
    const request = await prisma.serviceRequest.findUnique({
      where: { id: req.params.id },
      include: { category: true, customer: { select: { firstName: true, email: true } } },
    });
    if (!request) return reply.code(404).send({ error: "Talep bulunamadı" });
    if (request.status !== "PENDING_REVIEW") {
      return reply.code(409).send({ error: "Bu talep zaten incelenmiş" });
    }
    const updated = await prisma.serviceRequest.update({
      where: { id: request.id },
      data: { status: "OPEN" },
    });

    sendEmail({
      to: request.customer.email,
      subject: "Talebin onaylandı ve ustalara gönderildi",
      html: `<p>Merhaba ${escapeHtml(request.customer.firstName)},</p><p>"${escapeHtml(request.category.name)}" talebin onaylandı, uygun ustalar artık talebini görebiliyor.</p><p><a href="${WEB_ORIGIN}/taleplerim/${request.id}">Talebini görüntüle</a></p>`,
    });

    return updated;
  });

  app.post("/admin/requests/:id/reject", { preHandler: requireAdmin }, async (req, reply) => {
    const request = await prisma.serviceRequest.findUnique({ where: { id: req.params.id } });
    if (!request) return reply.code(404).send({ error: "Talep bulunamadı" });
    if (request.status !== "PENDING_REVIEW") {
      return reply.code(409).send({ error: "Bu talep zaten incelenmiş" });
    }
    return prisma.serviceRequest.update({ where: { id: request.id }, data: { status: "REJECTED" } });
  });

  app.get("/admin/requests/:id", { preHandler: requireAdmin }, async (req, reply) => {
    const request = await prisma.serviceRequest.findUnique({
      where: { id: req.params.id },
      include: {
        category: true,
        customer: { select: safeUserSelect },
        offers: {
          include: { provider: { select: safeUserSelect } },
          orderBy: { createdAt: "asc" },
        },
      },
    });
    if (!request) return reply.code(404).send({ error: "Talep bulunamadı" });
    return request;
  });

  app.post("/admin/requests/:id/cancel", { preHandler: requireAdmin }, async (req, reply) => {
    const request = await prisma.serviceRequest.findUnique({ where: { id: req.params.id } });
    if (!request) return reply.code(404).send({ error: "Talep bulunamadı" });
    if (request.status === "CLOSED" || request.status === "CANCELLED" || request.status === "REJECTED") {
      return reply.code(409).send({ error: "Bu talep zaten kapalı" });
    }

    const [, updated] = await prisma.$transaction([
      prisma.offer.updateMany({
        where: { serviceRequestId: request.id, status: "PENDING" },
        data: { status: "REJECTED" },
      }),
      prisma.serviceRequest.update({ where: { id: request.id }, data: { status: "CANCELLED" } }),
    ]);
    return updated;
  });

  app.get("/admin/reports", { preHandler: requireAdmin }, async () => {
    return prisma.report.findMany({
      include: {
        reporter: { select: safeUserSelect },
        reportedUser: { select: safeUserSelect },
      },
      orderBy: { createdAt: "desc" },
    });
  });

  app.post("/admin/reports/:id/resolve", { preHandler: requireAdmin }, async (req, reply) => {
    const report = await prisma.report.findUnique({ where: { id: req.params.id } });
    if (!report) return reply.code(404).send({ error: "Rapor bulunamadı" });
    return prisma.report.update({ where: { id: report.id }, data: { status: "REVIEWED" } });
  });

  app.get("/admin/users", { preHandler: requireAdmin }, async () => {
    return prisma.user.findMany({
      where: { role: "CUSTOMER" },
      select: { ...safeUserSelect, _count: { select: { serviceRequests: true } } },
      orderBy: { createdAt: "desc" },
    });
  });

  app.get("/admin/providers", { preHandler: requireAdmin }, async () => {
    return prisma.user.findMany({
      where: { role: "PROVIDER" },
      select: {
        ...safeUserSelect,
        providerProfile: {
          include: { categories: { include: { category: true } } },
        },
        _count: { select: { offers: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  });

  app.get("/admin/stats", { preHandler: requireAdmin }, async () => {
    const [customerCount, providerCount, requestsByStatus, offerCount, reviewCount] = await Promise.all([
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.user.count({ where: { role: "PROVIDER" } }),
      prisma.serviceRequest.groupBy({ by: ["status"], _count: true }),
      prisma.offer.count(),
      prisma.review.count(),
    ]);

    return {
      customerCount,
      providerCount,
      offerCount,
      reviewCount,
      requestsByStatus: Object.fromEntries(requestsByStatus.map((r) => [r.status, r._count])),
    };
  });

  // Password recovery has no self-serve flow yet (no SMS/email sender is
  // wired up) — this is the stopgap so support can unblock a locked-out user
  // over a phone call without ever seeing their old password.
  app.post("/admin/users/:id/reset-password", { preHandler: requireAdmin }, async (req, reply) => {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return reply.code(404).send({ error: "Kullanıcı bulunamadı" });

    const tempPassword = randomBytes(5).toString("hex");
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: await hashPassword(tempPassword) },
    });
    return { tempPassword };
  });

  // Manual admin toggle, not an automated ID-check pipeline — see the schema
  // comment on ProviderProfile.identityVerifiedAt.
  app.post("/admin/providers/:id/verify-identity", { preHandler: requireAdmin }, async (req, reply) => {
    const profile = await prisma.providerProfile.findUnique({ where: { userId: req.params.id } });
    if (!profile) return reply.code(404).send({ error: "Usta profili bulunamadı" });

    return prisma.providerProfile.update({
      where: { id: profile.id },
      data: { identityVerifiedAt: profile.identityVerifiedAt ? null : new Date() },
    });
  });

  app.post("/admin/providers/:id/toggle-premium", { preHandler: requireAdmin }, async (req, reply) => {
    const profile = await prisma.providerProfile.findUnique({ where: { userId: req.params.id } });
    if (!profile) return reply.code(404).send({ error: "Usta profili bulunamadı" });

    return prisma.providerProfile.update({
      where: { id: profile.id },
      data: { isPremium: !profile.isPremium },
    });
  });
}
