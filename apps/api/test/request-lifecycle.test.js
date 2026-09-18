import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { prisma } from "@tekliflercepte/db";
import { buildApp } from "../src/app.js";
import { createTestUser } from "./helpers.js";

describe("request completion, reviews, and dispute linking", () => {
  let app;
  let category;
  let customer;
  let customerToken;
  let provider;
  let providerToken;
  let admin;
  let adminToken;
  let request;
  let offer;

  beforeAll(async () => {
    app = await buildApp({ logger: false });
    category = await prisma.category.findFirst({ where: { parentId: { not: null } } });
    ({ user: customer, token: customerToken } = await createTestUser({
      lineCode: "630",
      emailPrefix: "life-cust",
    }));
    ({ user: provider, token: providerToken } = await createTestUser({
      role: "PROVIDER",
      lineCode: "631",
      emailPrefix: "life-prov",
    }));
    ({ user: admin, token: adminToken } = await createTestUser({
      role: "ADMIN",
      lineCode: "632",
      emailPrefix: "life-admin",
    }));
  });

  afterAll(async () => {
    await prisma.report.deleteMany({ where: { reporterId: customer.id } });
    await prisma.review.deleteMany({ where: { authorId: customer.id } });
    await prisma.offer.deleteMany({ where: { providerId: provider.id } });
    await prisma.serviceRequest.deleteMany({ where: { customerId: customer.id } });
    await prisma.user.deleteMany({ where: { id: { in: [customer.id, provider.id, admin.id] } } });
    await app.close();
  });

  // Fresh OPEN request + SELECTED offer for each test, since completion and
  // review both consume that state.
  beforeEach(async () => {
    request = await prisma.serviceRequest.create({
      data: { customerId: customer.id, categoryId: category.id, city: "İstanbul", details: "test", status: "OPEN" },
    });
    offer = await prisma.offer.create({
      data: { serviceRequestId: request.id, providerId: provider.id, price: 100, status: "SELECTED" },
    });
    await prisma.serviceRequest.update({ where: { id: request.id }, data: { status: "OFFER_SELECTED" } });
  });

  describe("POST /requests/:id/complete", () => {
    it("rejects completion before an offer is selected", async () => {
      const openRequest = await prisma.serviceRequest.create({
        data: { customerId: customer.id, categoryId: category.id, city: "İstanbul", details: "acik talep", status: "OPEN" },
      });
      const res = await app.inject({
        method: "POST",
        url: `/requests/${openRequest.id}/complete`,
        headers: { authorization: `Bearer ${customerToken}` },
      });
      expect(res.statusCode).toBe(409);
    });

    it("rejects completion by someone other than the request owner", async () => {
      const res = await app.inject({
        method: "POST",
        url: `/requests/${request.id}/complete`,
        headers: { authorization: `Bearer ${providerToken}` },
      });
      expect(res.statusCode).toBe(403);
    });

    it("closes the request and updates the public completed-jobs count", async () => {
      const before = await app.inject({ method: "GET", url: "/stats/public" });
      const res = await app.inject({
        method: "POST",
        url: `/requests/${request.id}/complete`,
        headers: { authorization: `Bearer ${customerToken}` },
      });
      expect(res.statusCode).toBe(200);
      expect(res.json().status).toBe("CLOSED");

      const after = await app.inject({ method: "GET", url: "/stats/public" });
      expect(after.json().completedJobsCount).toBe(before.json().completedJobsCount + 1);

      const again = await app.inject({
        method: "POST",
        url: `/requests/${request.id}/complete`,
        headers: { authorization: `Bearer ${customerToken}` },
      });
      expect(again.statusCode).toBe(409);
    });
  });

  describe("POST /requests/:id/review", () => {
    it("rejects more than 3 photos", async () => {
      const res = await app.inject({
        method: "POST",
        url: `/requests/${request.id}/review`,
        headers: { authorization: `Bearer ${customerToken}` },
        payload: { rating: 5, photos: ["/uploads/a.png", "/uploads/b.png", "/uploads/c.png", "/uploads/d.png"] },
      });
      expect(res.statusCode).toBe(400);
    });

    it("closes the request and stores photos alongside the review", async () => {
      const res = await app.inject({
        method: "POST",
        url: `/requests/${request.id}/review`,
        headers: { authorization: `Bearer ${customerToken}` },
        payload: { rating: 5, comment: "harika iş", photos: ["/uploads/before.png", "/uploads/after.png"] },
      });
      expect(res.statusCode).toBe(201);
      expect(res.json().photos).toEqual(["/uploads/before.png", "/uploads/after.png"]);

      const updatedRequest = await prisma.serviceRequest.findUnique({ where: { id: request.id } });
      expect(updatedRequest.status).toBe("CLOSED");

      const publicView = await app.inject({ method: "GET", url: `/providers/${provider.id}` });
      const review = publicView.json().reviewsReceived.find((r) => r.serviceRequestId === request.id);
      expect(review.photos).toEqual(["/uploads/before.png", "/uploads/after.png"]);
    });

    it("rejects a second review for the same request", async () => {
      await app.inject({
        method: "POST",
        url: `/requests/${request.id}/review`,
        headers: { authorization: `Bearer ${customerToken}` },
        payload: { rating: 4 },
      });
      const res = await app.inject({
        method: "POST",
        url: `/requests/${request.id}/review`,
        headers: { authorization: `Bearer ${customerToken}` },
        payload: { rating: 3 },
      });
      expect(res.statusCode).toBe(409);
    });
  });

  describe("dispute linking (Report <-> ServiceRequest via offer)", () => {
    it("surfaces a report about an offer under the request's admin detail view", async () => {
      const reportRes = await app.inject({
        method: "POST",
        url: "/reports",
        headers: { authorization: `Bearer ${customerToken}` },
        payload: { reportedUserId: provider.id, offerId: offer.id, reason: "FRAUD", details: "usta gelmedi" },
      });
      expect(reportRes.statusCode).toBe(201);

      const adminView = await app.inject({
        method: "GET",
        url: `/admin/requests/${request.id}`,
        headers: { authorization: `Bearer ${adminToken}` },
      });
      const linkedOffer = adminView.json().offers.find((o) => o.id === offer.id);
      expect(linkedOffer.reports).toHaveLength(1);
      expect(linkedOffer.reports[0].reason).toBe("FRAUD");

      const resolve = await app.inject({
        method: "POST",
        url: `/admin/reports/${reportRes.json().id}/resolve`,
        headers: { authorization: `Bearer ${adminToken}` },
      });
      expect(resolve.statusCode).toBe(200);
      expect(resolve.json().status).toBe("REVIEWED");
    });
  });
});
