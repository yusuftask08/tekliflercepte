import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@tekliflercepte/db";
import { buildApp } from "../src/app.js";
import { createTestUser } from "./helpers.js";

describe("support tickets (destek talepleri)", () => {
  let app;
  let user;
  let userToken;
  let admin;
  let adminToken;
  const ticketIds = [];

  beforeAll(async () => {
    app = await buildApp({ logger: false });
    ({ user, token: userToken } = await createTestUser({ lineCode: "620", emailPrefix: "ticket-user" }));
    ({ user: admin, token: adminToken } = await createTestUser({
      role: "ADMIN",
      lineCode: "621",
      emailPrefix: "ticket-admin",
    }));
  });

  afterAll(async () => {
    await prisma.supportTicket.deleteMany({ where: { id: { in: ticketIds } } });
    await prisma.user.deleteMany({ where: { id: { in: [user.id, admin.id] } } });
    await app.close();
  });

  it("rejects a submission missing required fields", async () => {
    const res = await app.inject({ method: "POST", url: "/support-tickets", payload: { name: "Test" } });
    expect(res.statusCode).toBe(400);
  });

  it("rejects an invalid email", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/support-tickets",
      payload: { name: "Test", email: "not-an-email", subject: "x", message: "y" },
    });
    expect(res.statusCode).toBe(400);
  });

  it("accepts an anonymous submission with no userId attached", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/support-tickets",
      payload: { name: "Anon", email: "anon-ticket@example.com", subject: "Test", message: "Test mesajı" },
    });
    expect(res.statusCode).toBe(201);
    const rows = await prisma.supportTicket.findMany({ where: { email: "anon-ticket@example.com" } });
    ticketIds.push(...rows.map((r) => r.id));
    expect(rows[0].userId).toBeNull();
  });

  it("attaches userId when the caller is authenticated", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/support-tickets",
      headers: { authorization: `Bearer ${userToken}` },
      payload: { name: "Logged In", email: "logged-in-ticket@example.com", subject: "Test", message: "Test mesajı" },
    });
    expect(res.statusCode).toBe(201);
    const rows = await prisma.supportTicket.findMany({ where: { email: "logged-in-ticket@example.com" } });
    ticketIds.push(...rows.map((r) => r.id));
    expect(rows[0].userId).toBe(user.id);
  });

  it("lets staff list and resolve a ticket", async () => {
    const created = await app.inject({
      method: "POST",
      url: "/support-tickets",
      payload: { name: "Resolve Me", email: "resolve-ticket@example.com", subject: "Test", message: "Test mesajı" },
    });
    const row = await prisma.supportTicket.findFirst({ where: { email: "resolve-ticket@example.com" } });
    ticketIds.push(row.id);
    expect(created.statusCode).toBe(201);

    const list = await app.inject({
      method: "GET",
      url: "/admin/support-tickets?status=OPEN",
      headers: { authorization: `Bearer ${adminToken}` },
    });
    expect(list.json().some((t) => t.id === row.id)).toBe(true);

    const resolve = await app.inject({
      method: "POST",
      url: `/admin/support-tickets/${row.id}/resolve`,
      headers: { authorization: `Bearer ${adminToken}` },
    });
    expect(resolve.statusCode).toBe(200);
    expect(resolve.json().status).toBe("RESOLVED");
  });

  it("a non-staff user can't list tickets", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/admin/support-tickets",
      headers: { authorization: `Bearer ${userToken}` },
    });
    expect(res.statusCode).toBe(403);
  });
});
