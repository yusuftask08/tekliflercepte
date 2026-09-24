import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@tekliflercepte/db";
import { buildApp } from "../src/app.js";
import { createTestUser } from "./helpers.js";

describe("recurring service requests", () => {
  let app;
  let category;
  let customer;
  let customerToken;
  let provider;
  const requestIds = [];

  beforeAll(async () => {
    app = await buildApp({ logger: false });
    category = await prisma.category.findFirst({ where: { parentId: { not: null } } });
    ({ user: customer, token: customerToken } = await createTestUser({ lineCode: "650", emailPrefix: "recur-cust" }));
    ({ user: provider } = await createTestUser({ role: "PROVIDER", lineCode: "651", emailPrefix: "recur-prov" }));
  });

  afterAll(async () => {
    await prisma.review.deleteMany({ where: { authorId: customer.id } });
    await prisma.offer.deleteMany({ where: { providerId: provider.id } });
    await prisma.serviceRequest.deleteMany({ where: { customerId: customer.id } });
    await prisma.user.deleteMany({ where: { id: { in: [customer.id, provider.id] } } });
    await app.close();
  });

  it("rejects a recurring request without a valid interval", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/requests",
      headers: { authorization: `Bearer ${customerToken}` },
      payload: { categoryId: category.id, city: "İstanbul", details: "test", isRecurring: true },
    });
    expect(res.statusCode).toBe(400);
  });

  it("clones a WEEKLY recurring request into a fresh PENDING_REVIEW one on completion", async () => {
    const create = await app.inject({
      method: "POST",
      url: "/requests",
      headers: { authorization: `Bearer ${customerToken}` },
      payload: {
        categoryId: category.id,
        city: "İstanbul",
        details: "haftalık temizlik",
        preferredTimeSlot: "SABAH",
        isRecurring: true,
        recurrenceInterval: "WEEKLY",
      },
    });
    expect(create.statusCode).toBe(201);
    const original = create.json();
    requestIds.push(original.id);
    expect(original.preferredTimeSlot).toBe("SABAH");

    // Fast-track to a completable state (moderation approval + offer
    // selection are separately-tested flows, not this test's concern).
    const offer = await prisma.offer.create({
      data: { serviceRequestId: original.id, providerId: provider.id, price: 200, status: "SELECTED" },
    });
    await prisma.serviceRequest.update({ where: { id: original.id }, data: { status: "OFFER_SELECTED" } });

    const complete = await app.inject({
      method: "POST",
      url: `/requests/${original.id}/complete`,
      headers: { authorization: `Bearer ${customerToken}` },
    });
    expect(complete.statusCode).toBe(200);

    const clone = await prisma.serviceRequest.findFirst({ where: { recurrenceParentId: original.id } });
    requestIds.push(clone?.id);
    expect(clone).toBeTruthy();
    expect(clone.status).toBe("PENDING_REVIEW");
    expect(clone.isRecurring).toBe(true);
    expect(clone.recurrenceInterval).toBe("WEEKLY");
    expect(clone.preferredTimeSlot).toBe("SABAH");
    expect(clone.details).toBe("haftalık temizlik");

    const originalDate = original.preferredDate ? new Date(original.preferredDate) : new Date(original.createdAt);
    const daysApart = (clone.preferredDate.getTime() - originalDate.getTime()) / (24 * 60 * 60 * 1000);
    expect(Math.round(daysApart)).toBe(7);

    await prisma.offer.delete({ where: { id: offer.id } });
  });

  it("does not clone a non-recurring request", async () => {
    const create = await app.inject({
      method: "POST",
      url: "/requests",
      headers: { authorization: `Bearer ${customerToken}` },
      payload: { categoryId: category.id, city: "İstanbul", details: "tek seferlik" },
    });
    const request = create.json();
    requestIds.push(request.id);
    await prisma.serviceRequest.update({ where: { id: request.id }, data: { status: "OFFER_SELECTED" } });
    const offer = await prisma.offer.create({
      data: { serviceRequestId: request.id, providerId: provider.id, price: 100, status: "SELECTED" },
    });

    await app.inject({
      method: "POST",
      url: `/requests/${request.id}/complete`,
      headers: { authorization: `Bearer ${customerToken}` },
    });

    const clone = await prisma.serviceRequest.findFirst({ where: { recurrenceParentId: request.id } });
    expect(clone).toBeNull();
    await prisma.offer.delete({ where: { id: offer.id } });
  });
});
