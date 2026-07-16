import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@tekliflercepte/db";
import { buildApp } from "../src/app.js";
import { hashPassword, signToken } from "../src/lib/auth.js";

describe("POST /requests/:requestId/offers", () => {
  let app;
  let customer;
  let provider;
  let category;
  let customerToken;
  let providerToken;

  beforeAll(async () => {
    app = await buildApp({ logger: false });
    category = await prisma.category.findFirst({ where: { parentId: { not: null } } });

    customer = await prisma.user.create({
      data: {
        firstName: "Test",
        lastName: "Customer",
        phone: `05500${Date.now().toString().slice(-6)}`,
        email: `test-customer-${Date.now()}@example.com`,
        passwordHash: await hashPassword("sifre123"),
        role: "CUSTOMER",
      },
    });
    provider = await prisma.user.create({
      data: {
        firstName: "Test",
        lastName: "Provider",
        phone: `05501${Date.now().toString().slice(-6)}`,
        email: `test-provider-${Date.now()}@example.com`,
        passwordHash: await hashPassword("sifre123"),
        role: "PROVIDER",
      },
    });
    customerToken = signToken(customer);
    providerToken = signToken(provider);
  });

  afterAll(async () => {
    await prisma.offer.deleteMany({ where: { providerId: provider.id } });
    await prisma.serviceRequest.deleteMany({ where: { customerId: customer.id } });
    await prisma.user.deleteMany({ where: { id: { in: [customer.id, provider.id] } } });
    await app.close();
  });

  async function createRequest() {
    const res = await app.inject({
      method: "POST",
      url: "/requests",
      headers: { authorization: `Bearer ${customerToken}` },
      payload: { categoryId: category.id, city: "İstanbul", details: "test talep" },
    });
    // New requests start PENDING_REVIEW (admin moderation gate) — approve
    // directly here since these tests are about offer logic, not moderation.
    await prisma.serviceRequest.update({ where: { id: res.json().id }, data: { status: "OPEN" } });
    return res.json().id;
  }

  it("rejects a customer trying to submit an offer", async () => {
    const requestId = await createRequest();
    const res = await app.inject({
      method: "POST",
      url: `/requests/${requestId}/offers`,
      headers: { authorization: `Bearer ${customerToken}` },
      payload: { price: 100 },
    });
    expect(res.statusCode).toBe(403);
  });

  it("rejects a non-positive price", async () => {
    const requestId = await createRequest();
    const res = await app.inject({
      method: "POST",
      url: `/requests/${requestId}/offers`,
      headers: { authorization: `Bearer ${providerToken}` },
      payload: { price: -10 },
    });
    expect(res.statusCode).toBe(400);
  });

  it("404s for a nonexistent request instead of crashing", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/requests/does-not-exist/offers",
      headers: { authorization: `Bearer ${providerToken}` },
      payload: { price: 100 },
    });
    expect(res.statusCode).toBe(404);
  });

  it("enforces the daily free-offer limit and lifts it for premium providers", async () => {
    for (let i = 0; i < 3; i++) {
      const requestId = await createRequest();
      const res = await app.inject({
        method: "POST",
        url: `/requests/${requestId}/offers`,
        headers: { authorization: `Bearer ${providerToken}` },
        payload: { price: 100 + i },
      });
      expect(res.statusCode).toBe(201);
    }

    const fourthRequestId = await createRequest();
    const blocked = await app.inject({
      method: "POST",
      url: `/requests/${fourthRequestId}/offers`,
      headers: { authorization: `Bearer ${providerToken}` },
      payload: { price: 200 },
    });
    expect(blocked.statusCode).toBe(402);

    await prisma.providerProfile.upsert({
      where: { userId: provider.id },
      update: { isPremium: true },
      create: { userId: provider.id, city: "İstanbul", isPremium: true },
    });

    const asPremium = await app.inject({
      method: "POST",
      url: `/requests/${fourthRequestId}/offers`,
      headers: { authorization: `Bearer ${providerToken}` },
      payload: { price: 200 },
    });
    expect(asPremium.statusCode).toBe(201);

    await prisma.providerProfile.delete({ where: { userId: provider.id } });
  });
});
