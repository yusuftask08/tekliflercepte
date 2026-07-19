import { prisma } from "@tekliflercepte/db";
import { requireAuth, requireAdmin } from "../lib/auth.js";
import { safeUserSelect, publicUserSelect } from "../lib/selects.js";
import { sendEmail, escapeHtml } from "../lib/mailer.js";

const PANEL_ORIGIN = process.env.PANEL_ORIGIN ?? "http://localhost:3001";

export default async function requestRoutes(app) {
  app.get("/requests", { preHandler: requireAdmin }, async (req) => {
    const { categoryId, city, status } = req.query;
    return prisma.serviceRequest.findMany({
      where: {
        ...(categoryId ? { categoryId } : {}),
        ...(city ? { city } : {}),
        ...(status ? { status } : {}),
      },
      include: { category: true, customer: { select: safeUserSelect }, offers: true },
      orderBy: { createdAt: "desc" },
    });
  });

  app.get("/me/requests", { preHandler: requireAuth }, async (req) => {
    return prisma.serviceRequest.findMany({
      where: { customerId: req.user.sub },
      include: { category: true, offers: true },
      orderBy: { createdAt: "desc" },
    });
  });

  app.get("/requests/:id", async (req, reply) => {
    const request = await prisma.serviceRequest.findUnique({
      where: { id: req.params.id },
      include: {
        category: true,
        offers: {
          include: { provider: { select: { ...publicUserSelect, providerProfile: true } } },
          orderBy: { createdAt: "asc" },
        },
        review: true,
      },
    });
    if (!request) return reply.code(404).send({ error: "Talep bulunamadı" });
    return request;
  });

  app.post("/requests", { preHandler: requireAuth }, async (req, reply) => {
    if (req.user.role !== "CUSTOMER") {
      return reply.code(403).send({ error: "Usta hesabıyla talep oluşturulamaz" });
    }
    const { categoryId, city, district, details, answers, photos, preferredDate, budget } = req.body ?? {};
    if (!categoryId || !city || !details) {
      return reply.code(400).send({ error: "categoryId, city ve details zorunlu" });
    }
    const created = await prisma.serviceRequest.create({
      data: {
        customerId: req.user.sub,
        categoryId,
        city,
        district,
        details,
        answers,
        photos: photos ?? [],
        preferredDate: preferredDate ? new Date(preferredDate) : null,
        budget: budget || null,
      },
    });

    const admins = await prisma.user.findMany({
      where: { role: "ADMIN", email: { not: null } },
      select: { email: true },
    });
    for (const admin of admins) {
      sendEmail({
        to: admin.email,
        subject: "Onay bekleyen yeni bir talep var",
        html: `<p>Yeni bir talep onay bekliyor: "${escapeHtml(details)}".</p><p><a href="${PANEL_ORIGIN}/talep-onaylari">Panelden incele</a></p>`,
      });
    }

    return reply.code(201).send(created);
  });

  app.post("/requests/:id/cancel", { preHandler: requireAuth }, async (req, reply) => {
    const request = await prisma.serviceRequest.findUnique({ where: { id: req.params.id } });
    if (!request) return reply.code(404).send({ error: "Talep bulunamadı" });
    if (request.customerId !== req.user.sub) {
      return reply.code(403).send({ error: "Bu talebin sahibi değilsin" });
    }
    if (request.status === "CLOSED" || request.status === "CANCELLED") {
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
}
