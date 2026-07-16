import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@tekliflercepte/db";
import { buildApp } from "../src/app.js";
import { hashPassword, signToken } from "../src/lib/auth.js";

describe("offer messaging access control", () => {
  let app;
  let customer;
  let provider;
  let intruder;
  let category;
  let offer;
  let customerToken;
  let providerToken;
  let intruderToken;

  beforeAll(async () => {
    app = await buildApp({ logger: false });
    category = await prisma.category.findFirst({ where: { parentId: { not: null } } });

    const suffix = Date.now().toString().slice(-6);
    customer = await prisma.user.create({
      data: {
        firstName: "Msg",
        lastName: "Customer",
        phone: `05510${suffix}`,
        email: `msg-customer-${suffix}@example.com`,
        passwordHash: await hashPassword("sifre123"),
        role: "CUSTOMER",
      },
    });
    provider = await prisma.user.create({
      data: {
        firstName: "Msg",
        lastName: "Provider",
        phone: `05511${suffix}`,
        email: `msg-provider-${suffix}@example.com`,
        passwordHash: await hashPassword("sifre123"),
        role: "PROVIDER",
      },
    });
    intruder = await prisma.user.create({
      data: {
        firstName: "Msg",
        lastName: "Intruder",
        phone: `05512${suffix}`,
        email: `msg-intruder-${suffix}@example.com`,
        passwordHash: await hashPassword("sifre123"),
        role: "CUSTOMER",
      },
    });

    const request = await prisma.serviceRequest.create({
      data: { customerId: customer.id, categoryId: category.id, city: "İstanbul", details: "test" },
    });
    offer = await prisma.offer.create({
      data: { serviceRequestId: request.id, providerId: provider.id, price: 100 },
    });

    customerToken = signToken(customer);
    providerToken = signToken(provider);
    intruderToken = signToken(intruder);
  });

  afterAll(async () => {
    await prisma.block.deleteMany({ where: { blockerId: { in: [customer.id, provider.id] } } });
    await prisma.message.deleteMany({ where: { offerId: offer.id } });
    await prisma.offer.delete({ where: { id: offer.id } });
    await prisma.serviceRequest.deleteMany({ where: { customerId: customer.id } });
    await prisma.user.deleteMany({ where: { id: { in: [customer.id, provider.id, intruder.id] } } });
    await app.close();
  });

  it("rejects an anonymous read of the thread", async () => {
    const res = await app.inject({ method: "GET", url: `/offers/${offer.id}/messages` });
    expect(res.statusCode).toBe(401);
  });

  it("rejects a logged-in user who isn't part of the conversation", async () => {
    const res = await app.inject({
      method: "GET",
      url: `/offers/${offer.id}/messages`,
      headers: { authorization: `Bearer ${intruderToken}` },
    });
    expect(res.statusCode).toBe(403);
  });

  it("allows the actual customer to read the thread", async () => {
    const res = await app.inject({
      method: "GET",
      url: `/offers/${offer.id}/messages`,
      headers: { authorization: `Bearer ${customerToken}` },
    });
    expect(res.statusCode).toBe(200);
  });

  it("blocks a blocked counterparty from sending a new message", async () => {
    await prisma.block.create({ data: { blockerId: customer.id, blockedUserId: provider.id } });
    const res = await app.inject({
      method: "POST",
      url: `/offers/${offer.id}/messages`,
      headers: { authorization: `Bearer ${providerToken}` },
      payload: { body: "merhaba" },
    });
    expect(res.statusCode).toBe(403);
  });
});
