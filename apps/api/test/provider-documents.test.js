import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@tekliflercepte/db";
import { buildApp } from "../src/app.js";
import { createTestUser } from "./helpers.js";

describe("provider documents (belge/sigorta rozetleri)", () => {
  let app;
  let provider;
  let providerToken;
  let admin;
  let adminToken;
  let profileId;
  const extraUserIds = [];

  beforeAll(async () => {
    app = await buildApp({ logger: false });
    ({ user: provider, token: providerToken } = await createTestUser({
      role: "PROVIDER",
      lineCode: "610",
      emailPrefix: "doc-prov",
    }));
    ({ user: admin, token: adminToken } = await createTestUser({
      role: "ADMIN",
      lineCode: "611",
      emailPrefix: "doc-admin",
    }));
    const profile = await prisma.providerProfile.create({
      data: { userId: provider.id, city: "İstanbul" },
    });
    profileId = profile.id;
  });

  afterAll(async () => {
    await prisma.providerDocument.deleteMany({ where: { providerProfileId: profileId } });
    await prisma.providerProfile.delete({ where: { id: profileId } });
    await prisma.user.deleteMany({ where: { id: { in: [provider.id, admin.id, ...extraUserIds] } } });
    await app.close();
  });

  it("rejects an invalid type", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/me/provider-documents",
      headers: { authorization: `Bearer ${providerToken}` },
      payload: { type: "DIPLOMA", fileUrl: "/uploads/x.png" },
    });
    expect(res.statusCode).toBe(400);
  });

  it("creates a PENDING document and hides it from the public endpoint", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/me/provider-documents",
      headers: { authorization: `Bearer ${providerToken}` },
      payload: { type: "CERTIFICATE", fileUrl: "/uploads/cert.pdf", label: "Test Sertifikası" },
    });
    expect(res.statusCode).toBe(201);
    expect(res.json().status).toBe("PENDING");

    const publicRes = await app.inject({ method: "GET", url: `/providers/${provider.id}` });
    expect(publicRes.json().providerProfile.documents).toEqual([]);
  });

  it("lets the owner withdraw a still-pending document", async () => {
    const created = await app.inject({
      method: "POST",
      url: "/me/provider-documents",
      headers: { authorization: `Bearer ${providerToken}` },
      payload: { type: "INSURANCE", fileUrl: "/uploads/ins.png" },
    });
    const id = created.json().id;

    const res = await app.inject({
      method: "DELETE",
      url: `/me/provider-documents/${id}`,
      headers: { authorization: `Bearer ${providerToken}` },
    });
    expect(res.statusCode).toBe(200);
    expect(await prisma.providerDocument.findUnique({ where: { id } })).toBeNull();
  });

  it("shows an approved document's type on the public endpoint, never its fileUrl", async () => {
    const created = await app.inject({
      method: "POST",
      url: "/me/provider-documents",
      headers: { authorization: `Bearer ${providerToken}` },
      payload: { type: "CERTIFICATE", fileUrl: "/uploads/cert2.pdf" },
    });
    const id = created.json().id;

    const approve = await app.inject({
      method: "POST",
      url: `/admin/provider-documents/${id}/approve`,
      headers: { authorization: `Bearer ${adminToken}` },
    });
    expect(approve.statusCode).toBe(200);

    const publicRes = await app.inject({ method: "GET", url: `/providers/${provider.id}` });
    const docs = publicRes.json().providerProfile.documents;
    expect(docs).toEqual([{ type: "CERTIFICATE" }]);
  });

  it("refuses to delete a document once it's been reviewed", async () => {
    const created = await app.inject({
      method: "POST",
      url: "/me/provider-documents",
      headers: { authorization: `Bearer ${providerToken}` },
      payload: { type: "INSURANCE", fileUrl: "/uploads/ins2.png" },
    });
    const id = created.json().id;
    await app.inject({
      method: "POST",
      url: `/admin/provider-documents/${id}/reject`,
      headers: { authorization: `Bearer ${adminToken}` },
      payload: { note: "test reddi" },
    });

    const res = await app.inject({
      method: "DELETE",
      url: `/me/provider-documents/${id}`,
      headers: { authorization: `Bearer ${providerToken}` },
    });
    expect(res.statusCode).toBe(409);

    const own = await app.inject({
      method: "GET",
      url: "/me/provider-documents",
      headers: { authorization: `Bearer ${providerToken}` },
    });
    const rejected = own.json().find((d) => d.id === id);
    expect(rejected.status).toBe("REJECTED");
    expect(rejected.reviewNote).toBe("test reddi");
  });

  it("a non-staff user can't approve documents", async () => {
    const { user: stranger, token: strangerToken } = await createTestUser({
      lineCode: "612",
      emailPrefix: "doc-stranger",
    });
    extraUserIds.push(stranger.id);
    const created = await app.inject({
      method: "POST",
      url: "/me/provider-documents",
      headers: { authorization: `Bearer ${providerToken}` },
      payload: { type: "CERTIFICATE", fileUrl: "/uploads/cert3.pdf" },
    });
    const res = await app.inject({
      method: "POST",
      url: `/admin/provider-documents/${created.json().id}/approve`,
      headers: { authorization: `Bearer ${strangerToken}` },
    });
    expect(res.statusCode).toBe(403);
  });
});
