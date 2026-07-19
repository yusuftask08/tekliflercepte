import { randomBytes } from "node:crypto";
import { prisma } from "@tekliflercepte/db";
import { requireAdmin, requireStaff, hashPassword } from "../lib/auth.js";
import { safeUserSelect } from "../lib/selects.js";
import { sendEmail, escapeHtml } from "../lib/mailer.js";
import { createNotification, createNotifications, findMatchingProviderIds } from "../lib/notifications.js";
import { logAdminAction } from "../lib/audit.js";

const WEB_ORIGIN = process.env.WEB_ORIGIN ?? "http://localhost:3002";
const PAGE_SIZE = 25;

function slugifyTr(str) {
  return str
    .toLocaleLowerCase("tr")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function uniqueSlug(name) {
  const base = slugifyTr(name);
  let slug = base;
  let n = 2;
  // eslint-disable-next-line no-await-in-loop
  while (await prisma.category.findUnique({ where: { slug } })) {
    slug = `${base}-${n}`;
    n += 1;
  }
  return slug;
}

export default async function adminRoutes(app) {
  app.post("/admin/requests/:id/approve", { preHandler: requireStaff }, async (req, reply) => {
    const request = await prisma.serviceRequest.findUnique({
      where: { id: req.params.id },
      include: { category: true, customer: { select: { id: true, firstName: true, email: true } } },
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

    await createNotification({
      userId: request.customer.id,
      type: "REQUEST_APPROVED",
      title: "Talebin onaylandı",
      body: `"${request.category.name}" talebin ustalara gönderildi.`,
      link: `/taleplerim/${request.id}`,
    });

    const matchingProviderIds = await findMatchingProviderIds({
      categoryId: request.categoryId,
      city: request.city,
    });
    await createNotifications(
      matchingProviderIds.map((userId) => ({
        userId,
        type: "NEW_MATCHING_REQUEST",
        title: "Sana uygun yeni bir talep var",
        body: `${request.city} bölgesinde "${request.category.name}" talebi geldi.`,
        link: "/usta/panel",
      }))
    );

    logAdminAction({ adminId: req.user.sub, action: "request.approve", targetId: request.id, targetType: "ServiceRequest" });

    return updated;
  });

  app.post("/admin/requests/:id/reject", { preHandler: requireStaff }, async (req, reply) => {
    const request = await prisma.serviceRequest.findUnique({ where: { id: req.params.id } });
    if (!request) return reply.code(404).send({ error: "Talep bulunamadı" });
    if (request.status !== "PENDING_REVIEW") {
      return reply.code(409).send({ error: "Bu talep zaten incelenmiş" });
    }
    const updated = await prisma.serviceRequest.update({ where: { id: request.id }, data: { status: "REJECTED" } });
    logAdminAction({ adminId: req.user.sub, action: "request.reject", targetId: request.id, targetType: "ServiceRequest" });
    return updated;
  });

  app.get("/admin/requests/:id", { preHandler: requireStaff }, async (req, reply) => {
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

  app.post("/admin/requests/:id/cancel", { preHandler: requireStaff }, async (req, reply) => {
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
    logAdminAction({ adminId: req.user.sub, action: "request.cancel", targetId: request.id, targetType: "ServiceRequest" });
    return updated;
  });

  app.get("/admin/reports", { preHandler: requireStaff }, async (req) => {
    const { q } = req.query ?? {};
    // Reports are a moderation queue, not an ever-growing dataset like
    // users/providers — filtered but not paginated.
    return prisma.report.findMany({
      where: q
        ? {
            OR: [
              { reporter: { firstName: { contains: q, mode: "insensitive" } } },
              { reporter: { lastName: { contains: q, mode: "insensitive" } } },
              { reportedUser: { firstName: { contains: q, mode: "insensitive" } } },
              { reportedUser: { lastName: { contains: q, mode: "insensitive" } } },
            ],
          }
        : undefined,
      include: {
        reporter: { select: safeUserSelect },
        reportedUser: { select: safeUserSelect },
      },
      orderBy: { createdAt: "desc" },
    });
  });

  app.post("/admin/reports/:id/resolve", { preHandler: requireStaff }, async (req, reply) => {
    const report = await prisma.report.findUnique({ where: { id: req.params.id } });
    if (!report) return reply.code(404).send({ error: "Rapor bulunamadı" });
    const updated = await prisma.report.update({ where: { id: report.id }, data: { status: "REVIEWED" } });
    logAdminAction({ adminId: req.user.sub, action: "report.resolve", targetId: report.id, targetType: "Report" });
    return updated;
  });

  app.get("/admin/users", { preHandler: requireAdmin }, async (req) => {
    const { q, page } = req.query ?? {};
    const pageNum = Math.max(1, Number(page) || 1);
    const where = {
      role: "CUSTOMER",
      ...(q
        ? {
            OR: [
              { firstName: { contains: q, mode: "insensitive" } },
              { lastName: { contains: q, mode: "insensitive" } },
              { phone: { contains: q } },
            ],
          }
        : {}),
    };
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: { ...safeUserSelect, _count: { select: { serviceRequests: true } } },
        orderBy: { createdAt: "desc" },
        take: PAGE_SIZE,
        skip: (pageNum - 1) * PAGE_SIZE,
      }),
      prisma.user.count({ where }),
    ]);
    return { users, total, hasMore: pageNum * PAGE_SIZE < total };
  });

  app.get("/admin/providers", { preHandler: requireAdmin }, async (req) => {
    const { q, page } = req.query ?? {};
    const pageNum = Math.max(1, Number(page) || 1);
    const where = {
      role: "PROVIDER",
      ...(q
        ? {
            OR: [
              { firstName: { contains: q, mode: "insensitive" } },
              { lastName: { contains: q, mode: "insensitive" } },
              { phone: { contains: q } },
            ],
          }
        : {}),
    };
    const [providers, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          ...safeUserSelect,
          providerProfile: {
            include: { categories: { include: { category: true } } },
          },
          _count: { select: { offers: true } },
        },
        orderBy: { createdAt: "desc" },
        take: PAGE_SIZE,
        skip: (pageNum - 1) * PAGE_SIZE,
      }),
      prisma.user.count({ where }),
    ]);
    return { providers, total, hasMore: pageNum * PAGE_SIZE < total };
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
    logAdminAction({ adminId: req.user.sub, action: "user.reset-password", targetId: user.id, targetType: "User" });
    return { tempPassword };
  });

  // Manual admin toggle, not an automated ID-check pipeline — see the schema
  // comment on ProviderProfile.identityVerifiedAt.
  app.post("/admin/providers/:id/verify-identity", { preHandler: requireAdmin }, async (req, reply) => {
    const profile = await prisma.providerProfile.findUnique({ where: { userId: req.params.id } });
    if (!profile) return reply.code(404).send({ error: "Usta profili bulunamadı" });

    const updated = await prisma.providerProfile.update({
      where: { id: profile.id },
      data: { identityVerifiedAt: profile.identityVerifiedAt ? null : new Date() },
    });
    logAdminAction({ adminId: req.user.sub, action: "provider.verify-identity", targetId: req.params.id, targetType: "User" });
    return updated;
  });

  app.post("/admin/providers/:id/toggle-premium", { preHandler: requireAdmin }, async (req, reply) => {
    const profile = await prisma.providerProfile.findUnique({ where: { userId: req.params.id } });
    if (!profile) return reply.code(404).send({ error: "Usta profili bulunamadı" });

    const updated = await prisma.providerProfile.update({
      where: { id: profile.id },
      data: { isPremium: !profile.isPremium },
    });
    logAdminAction({ adminId: req.user.sub, action: "provider.toggle-premium", targetId: req.params.id, targetType: "User" });
    return updated;
  });

  app.post("/admin/categories", { preHandler: requireAdmin }, async (req, reply) => {
    const { name, parentId, questions } = req.body ?? {};
    if (!name) return reply.code(400).send({ error: "name zorunlu" });
    const slug = await uniqueSlug(name);
    const category = await prisma.category.create({
      data: { name, slug, parentId: parentId || null, questions: questions ?? undefined },
    });
    logAdminAction({ adminId: req.user.sub, action: "category.create", targetId: category.id, targetType: "Category" });
    return reply.code(201).send(category);
  });

  app.patch("/admin/categories/:id", { preHandler: requireAdmin }, async (req, reply) => {
    const category = await prisma.category.findUnique({ where: { id: req.params.id } });
    if (!category) return reply.code(404).send({ error: "Kategori bulunamadı" });
    const { name, questions } = req.body ?? {};
    const updated = await prisma.category.update({
      where: { id: req.params.id },
      data: {
        ...(name ? { name } : {}),
        ...(questions !== undefined ? { questions } : {}),
      },
    });
    logAdminAction({ adminId: req.user.sub, action: "category.update", targetId: category.id, targetType: "Category" });
    return updated;
  });

  app.delete("/admin/categories/:id", { preHandler: requireAdmin }, async (req, reply) => {
    const category = await prisma.category.findUnique({
      where: { id: req.params.id },
      include: {
        children: { select: { id: true } },
        serviceRequests: { select: { id: true }, take: 1 },
        providerCategories: { select: { id: true }, take: 1 },
      },
    });
    if (!category) return reply.code(404).send({ error: "Kategori bulunamadı" });
    if (category.children.length > 0) {
      return reply.code(409).send({ error: "Önce alt kategorileri sil" });
    }
    if (category.serviceRequests.length > 0 || category.providerCategories.length > 0) {
      return reply.code(409).send({ error: "Bu kategoriye bağlı talep veya usta var, silinemez" });
    }
    await prisma.category.delete({ where: { id: req.params.id } });
    logAdminAction({ adminId: req.user.sub, action: "category.delete", targetId: req.params.id, targetType: "Category" });
    // 200 + body, not 204 — the panel's proxy route always calls res.json()
    // on the response, which throws on an empty body.
    return { ok: true };
  });

  app.get("/admin/audit-log", { preHandler: requireAdmin }, async (req) => {
    const { page } = req.query ?? {};
    const pageNum = Math.max(1, Number(page) || 1);
    const [entries, total] = await Promise.all([
      prisma.adminAuditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: PAGE_SIZE,
        skip: (pageNum - 1) * PAGE_SIZE,
      }),
      prisma.adminAuditLog.count(),
    ]);
    const adminIds = [...new Set(entries.map((e) => e.adminId))];
    const admins = await prisma.user.findMany({
      where: { id: { in: adminIds } },
      select: { id: true, firstName: true, lastName: true },
    });
    const adminById = new Map(admins.map((a) => [a.id, a]));
    return {
      entries: entries.map((e) => ({ ...e, admin: adminById.get(e.adminId) ?? null })),
      total,
      hasMore: pageNum * PAGE_SIZE < total,
    };
  });
}
