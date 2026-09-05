import { prisma } from "@tekliflercepte/db";
import { requireAuth } from "../lib/auth.js";
import { safeUserSelect } from "../lib/selects.js";
import { createNotification } from "../lib/notifications.js";
import { sendEmail, escapeHtml } from "../lib/mailer.js";

/** Referral reward — only providers have anything to actually win (the
 *  existing isPremium freemium flag, skip the daily free-offer cap), so a
 *  referred customer's signup is tracked (GET /me/referrals) but doesn't
 *  trigger a reward here; there's nothing equivalent to grant them without
 *  inventing a mechanic the product hasn't decided on. Best-effort: a
 *  failure here must never fail the profile save that triggered it. */
async function rewardReferrerIfProvider(newProviderUserId) {
  const newProvider = await prisma.user.findUnique({
    where: { id: newProviderUserId },
    select: { referredById: true, firstName: true, lastName: true },
  });
  if (!newProvider?.referredById) return;

  const referrerProfile = await prisma.providerProfile.findUnique({
    where: { userId: newProvider.referredById },
    include: { user: { select: { email: true } } },
  });
  if (!referrerProfile) return; // referrer isn't a provider — nothing to grant

  await prisma.providerProfile.update({ where: { id: referrerProfile.id }, data: { isPremium: true } });

  const title = "Referansın için premium kazandın!";
  const body = `${newProvider.firstName} ${newProvider.lastName} senin davetinle katıldı ve usta profilini tamamladı. Artık günlük ücretsiz teklif limitin yok.`;
  // Awaited even though the caller doesn't await this whole function
  // (already fire-and-forget from there) — an un-awaited call here would
  // be a detached promise with nothing watching it, silently dropping any
  // rejection instead of reaching the caller's .catch.
  await createNotification({ userId: newProvider.referredById, type: "REFERRAL_REWARD", title, body, link: "/usta/ayarlar" });
  if (referrerProfile.user.email) {
    await sendEmail({ to: referrerProfile.user.email, subject: title, html: `<p>${escapeHtml(body)}</p>` });
  }
}

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
    const isFirstTimeConsent = Boolean(dataConsent) && !existingProfile?.dataConsentAt;
    const profile = await prisma.providerProfile.upsert({
      where: { userId: req.user.sub },
      update: data,
      create: { userId: req.user.sub, ...data },
    });

    if (isFirstTimeConsent) {
      rewardReferrerIfProvider(req.user.sub).catch((err) =>
        console.error("[provider-profile] referral reward hatası:", err.message)
      );
    }

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
        // A withdrawn offer isn't a real answer — the provider changed their
        // mind and may still want to re-offer, so only an active
        // (non-withdrawn) offer should take this request off their list.
        offers: { none: { providerId: req.user.sub, status: { not: "WITHDRAWN" } } },
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
