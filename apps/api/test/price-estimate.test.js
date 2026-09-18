import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@tekliflercepte/db";
import { buildApp } from "../src/app.js";
import { createTestUser } from "./helpers.js";

describe("GET /categories/:id/price-estimate", () => {
  let app;
  let category;
  let customer;
  let provider;
  const requestIds = [];
  const offerIds = [];

  beforeAll(async () => {
    app = await buildApp({ logger: false });
    category = await prisma.category.create({
      data: { name: "Test Fiyat Kategorisi", slug: `test-fiyat-${Date.now()}` },
    });
    ({ user: customer } = await createTestUser({ lineCode: "640", emailPrefix: "price-cust" }));
    ({ user: provider } = await createTestUser({ role: "PROVIDER", lineCode: "641", emailPrefix: "price-prov" }));
  });

  afterAll(async () => {
    await prisma.offer.deleteMany({ where: { id: { in: offerIds } } });
    await prisma.serviceRequest.deleteMany({ where: { id: { in: requestIds } } });
    await prisma.category.delete({ where: { id: category.id } });
    await prisma.user.deleteMany({ where: { id: { in: [customer.id, provider.id] } } });
    await app.close();
  });

  async function createSelectedOffer(price, city = "İstanbul") {
    const request = await prisma.serviceRequest.create({
      data: { customerId: customer.id, categoryId: category.id, city, details: "test", status: "OFFER_SELECTED" },
    });
    requestIds.push(request.id);
    const offer = await prisma.offer.create({
      data: { serviceRequestId: request.id, providerId: provider.id, price, status: "SELECTED" },
    });
    offerIds.push(offer.id);
  }

  it("reports unavailable with too few real data points", async () => {
    await createSelectedOffer(100);
    await createSelectedOffer(200);
    const res = await app.inject({ method: "GET", url: `/categories/${category.id}/price-estimate` });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ available: false, sampleSize: 2 });
  });

  it("returns a real min/max/avg once there are enough SELECTED offers", async () => {
    await createSelectedOffer(300);
    await createSelectedOffer(400);
    await createSelectedOffer(500);
    // A PENDING offer should never count toward the estimate.
    const pendingRequest = await prisma.serviceRequest.create({
      data: { customerId: customer.id, categoryId: category.id, city: "İstanbul", details: "test", status: "OPEN" },
    });
    requestIds.push(pendingRequest.id);
    const pendingOffer = await prisma.offer.create({
      data: { serviceRequestId: pendingRequest.id, providerId: provider.id, price: 99999, status: "PENDING" },
    });
    offerIds.push(pendingOffer.id);

    const res = await app.inject({ method: "GET", url: `/categories/${category.id}/price-estimate` });
    const body = res.json();
    expect(body).toEqual({ available: true, scope: "category", sampleSize: 5, min: 100, max: 500, avg: 300 });
  });

  it("falls back to the category-wide number when the city has too little data", async () => {
    const res = await app.inject({
      method: "GET",
      url: `/categories/${category.id}/price-estimate?city=Ankara`,
    });
    const body = res.json();
    expect(body.scope).toBe("category");
    expect(body.available).toBe(true);
  });

  it("prefers a city-scoped estimate once that city has enough data", async () => {
    for (const price of [1000, 1000, 1000, 1000, 1000]) {
      await createSelectedOffer(price, "İzmir");
    }
    const res = await app.inject({
      method: "GET",
      url: `/categories/${category.id}/price-estimate?city=İzmir`,
    });
    const body = res.json();
    expect(body).toMatchObject({ available: true, scope: "city", min: 1000, max: 1000, avg: 1000 });
  });
});
