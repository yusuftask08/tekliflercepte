import { prisma } from "@tekliflercepte/db";
import { requireAuth } from "../lib/auth.js";
import { safeUserSelect } from "../lib/selects.js";

export default async function providerProfileRoutes(app) {
  app.get("/me/provider-profile", { preHandler: requireAuth }, async (req) => {
    return prisma.providerProfile.findUnique({
      where: { userId: req.user.sub },
      include: { categories: { include: { category: true } } },
    });
  });

  app.put("/me/provider-profile", { preHandler: requireAuth }, async (req, reply) => {
    const {
      businessType,
      businessName,
      taxOffice,
      taxNumber,
      city,
      district,
      neighborhood,
      bio,
      experienceYears,
      categoryIds,
      serviceCities,
      portfolioPhotos,
      dataConsent,
    } = req.body ?? {};
    if (!city || !Array.isArray(categoryIds) || categoryIds.length === 0) {
      return reply.code(400).send({ error: "city ve en az bir categoryId zorunlu" });
    }
    if (bio && bio.length < 50) {
      return reply.code(400).send({ error: "Tanıtım yazısı en az 50 karakter olmalı" });
    }
    if (businessType && !["SAHIS", "SIRKET"].includes(businessType)) {
      return reply.code(400).send({ error: "Geçersiz businessType" });
    }

    const existingProfile = await prisma.providerProfile.findUnique({ where: { userId: req.user.sub } });
    const data = {
      ...(businessType ? { businessType } : {}),
      businessName,
      taxOffice,
      taxNumber,
      city,
      district,
      neighborhood,
      bio,
      experienceYears,
      serviceCities: Array.isArray(serviceCities) ? serviceCities : [],
      ...(portfolioPhotos ? { portfolioPhotos } : {}),
      ...(dataConsent && !existingProfile?.dataConsentAt ? { dataConsentAt: new Date() } : {}),
    };
    const profile = await prisma.providerProfile.upsert({
      where: { userId: req.user.sub },
      update: data,
      create: { userId: req.user.sub, ...data },
    });

    await prisma.providerCategory.deleteMany({ where: { providerId: profile.id } });
    await prisma.providerCategory.createMany({
      data: categoryIds.map((categoryId) => ({ providerId: profile.id, categoryId })),
      skipDuplicates: true,
    });

    return prisma.providerProfile.findUnique({
      where: { id: profile.id },
      include: { categories: { include: { category: true } } },
    });
  });

  app.post("/me/provider-profile/toggle-availability", { preHandler: requireAuth }, async (req, reply) => {
    const profile = await prisma.providerProfile.findUnique({ where: { userId: req.user.sub } });
    if (!profile) return reply.code(404).send({ error: "Usta profili bulunamadı" });

    return prisma.providerProfile.update({
      where: { id: profile.id },
      data: { isAvailable: !profile.isAvailable },
    });
  });

  app.get("/me/matching-requests", { preHandler: requireAuth }, async (req) => {
    const profile = await prisma.providerProfile.findUnique({
      where: { userId: req.user.sub },
      include: { categories: true },
    });
    if (!profile || !profile.isAvailable) return [];

    const categoryIds = profile.categories.map((c) => c.categoryId);
    return prisma.serviceRequest.findMany({
      where: {
        categoryId: { in: categoryIds },
        city: { in: [profile.city, ...profile.serviceCities] },
        status: "OPEN",
        offers: { none: { providerId: req.user.sub } },
      },
      include: { category: true, customer: { select: safeUserSelect } },
      orderBy: { createdAt: "desc" },
    });
  });

  app.get("/me/offers", { preHandler: requireAuth }, async (req) => {
    return prisma.offer.findMany({
      where: { providerId: req.user.sub },
      include: { serviceRequest: { include: { category: true } } },
      orderBy: { createdAt: "desc" },
    });
  });
}
