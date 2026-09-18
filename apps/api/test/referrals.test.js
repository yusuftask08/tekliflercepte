import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@tekliflercepte/db";
import { buildApp } from "../src/app.js";

describe("referral system", () => {
  let app;
  let category;
  const createdUserIds = [];

  beforeAll(async () => {
    app = await buildApp({ logger: false });
    category = await prisma.category.findFirst({ where: { parentId: { not: null } } });
  });

  afterAll(async () => {
    await prisma.notification.deleteMany({ where: { userId: { in: createdUserIds } } });
    await prisma.providerProfile.deleteMany({ where: { userId: { in: createdUserIds } } });
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    await app.close();
  });

  async function register({ role, referredById }) {
    const suffix = `${Date.now()}${Math.floor(Math.random() * 1000)}`.slice(-8);
    const res = await app.inject({
      method: "POST",
      url: "/auth/register",
      payload: {
        firstName: "Ref",
        lastName: role,
        phone: `0563${suffix}`,
        email: `ref-${suffix}@example.com`,
        password: "sifre123",
        role,
        termsAccepted: true,
        referredById,
      },
    });
    createdUserIds.push(res.json().user.id);
    return res.json();
  }

  // The reward (isPremium update + notification) fires from an unawaited
  // background promise — same "best-effort side effect" convention as
  // sendEmail elsewhere in this codebase (see mailer.js) — so the PUT
  // response can return slightly before it lands. Poll briefly instead of
  // assuming synchronous consistency.
  async function waitFor(check, { timeoutMs = 1000, intervalMs = 25 } = {}) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const result = await check();
      if (result) return result;
      await new Promise((r) => setTimeout(r, intervalMs));
    }
    return check();
  }

  async function completeProviderProfile(token) {
    return app.inject({
      method: "PUT",
      url: "/me/provider-profile",
      headers: { authorization: `Bearer ${token}` },
      payload: {
        businessType: "SAHIS",
        city: "İstanbul",
        bio: "Test icin elli karakter uzunlugunda bir aciklama metni burada",
        categoryIds: [category.id],
        dataConsent: true,
      },
    });
  }

  it("stores referredById when a valid referrer is given", async () => {
    const referrer = await register({ role: "CUSTOMER" });
    const referred = await register({ role: "CUSTOMER", referredById: referrer.user.id });
    const stored = await prisma.user.findUnique({ where: { id: referred.user.id } });
    expect(stored.referredById).toBe(referrer.user.id);
  });

  it("silently ignores a referredById that doesn't exist", async () => {
    const referred = await register({ role: "CUSTOMER", referredById: "does-not-exist" });
    expect(referred.user).toBeTruthy();
    const stored = await prisma.user.findUnique({ where: { id: referred.user.id } });
    expect(stored.referredById).toBeNull();
  });

  it("counts referrals via GET /me/referrals", async () => {
    const referrer = await register({ role: "CUSTOMER" });
    await register({ role: "CUSTOMER", referredById: referrer.user.id });
    await register({ role: "CUSTOMER", referredById: referrer.user.id });

    const res = await app.inject({
      method: "GET",
      url: "/me/referrals",
      headers: { authorization: `Bearer ${referrer.token}` },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ referralCode: referrer.user.id, totalReferred: 2 });
  });

  it("rewards a provider referrer when their referred provider completes onboarding", async () => {
    const referrer = await register({ role: "PROVIDER" });
    await completeProviderProfile(referrer.token);

    const referred = await register({ role: "PROVIDER", referredById: referrer.user.id });
    const before = await prisma.providerProfile.findUnique({ where: { userId: referrer.user.id } });
    expect(before.isPremium).toBe(false);

    await completeProviderProfile(referred.token);

    const after = await waitFor(async () => {
      const p = await prisma.providerProfile.findUnique({ where: { userId: referrer.user.id } });
      return p.isPremium ? p : null;
    });
    expect(after.isPremium).toBe(true);

    const notifications = await waitFor(async () => {
      const rows = await prisma.notification.findMany({ where: { userId: referrer.user.id } });
      return rows.some((n) => n.type === "REFERRAL_REWARD") ? rows : null;
    });
    expect(notifications.some((n) => n.type === "REFERRAL_REWARD")).toBe(true);
  });

  it("does not reward a customer referrer (nothing to grant)", async () => {
    const referrer = await register({ role: "CUSTOMER" });
    const referred = await register({ role: "PROVIDER", referredById: referrer.user.id });

    await completeProviderProfile(referred.token);
    // Give the (no-op, since referrer isn't a provider) background reward
    // path the same window to prove it stays a no-op, not just that we
    // checked too early.
    await new Promise((r) => setTimeout(r, 200));

    const referrerProfile = await prisma.providerProfile.findUnique({ where: { userId: referrer.user.id } });
    expect(referrerProfile).toBeNull();
    const notifications = await prisma.notification.findMany({ where: { userId: referrer.user.id } });
    expect(notifications).toHaveLength(0);
  });
});
