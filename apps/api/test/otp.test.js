import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@tekliflercepte/db";
import { buildApp } from "../src/app.js";
import { hashOtpCode } from "../src/lib/otp.js";
import { createTestUser } from "./helpers.js";

describe("phone OTP verification", () => {
  let app;
  let user;
  let token;

  beforeAll(async () => {
    app = await buildApp({ logger: false });
    ({ user, token } = await createTestUser({ lineCode: "601", emailPrefix: "otp" }));
  });

  afterAll(async () => {
    await prisma.user.delete({ where: { id: user.id } });
    await app.close();
  });

  async function setCode(code, { expiresInMs = 10 * 60 * 1000, attempts = 0 } = {}) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        phoneVerificationCodeHash: hashOtpCode(code),
        phoneVerificationExpiresAt: new Date(Date.now() + expiresInMs),
        phoneVerificationAttempts: attempts,
      },
    });
  }

  it("sends a code and stores its hash, not the plaintext", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/me/phone/send-code",
      headers: { authorization: `Bearer ${token}` },
    });
    expect(res.statusCode).toBe(200);
    const updated = await prisma.user.findUnique({ where: { id: user.id } });
    expect(updated.phoneVerificationCodeHash).toBeTruthy();
    expect(updated.phoneVerificationCodeHash).not.toMatch(/^\d{6}$/);
  });

  it("rejects a resend within the cooldown window", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/me/phone/send-code",
      headers: { authorization: `Bearer ${token}` },
    });
    expect(res.statusCode).toBe(429);
  });

  it("rejects a wrong code and counts the attempt", async () => {
    await setCode("111111");
    const res = await app.inject({
      method: "POST",
      url: "/me/phone/verify-code",
      headers: { authorization: `Bearer ${token}` },
      payload: { code: "000000" },
    });
    expect(res.statusCode).toBe(400);
    const updated = await prisma.user.findUnique({ where: { id: user.id } });
    expect(updated.phoneVerificationAttempts).toBe(1);
  });

  it("locks out after 5 wrong attempts, even with the eventual right code", async () => {
    await setCode("222222", { attempts: 5 });
    const res = await app.inject({
      method: "POST",
      url: "/me/phone/verify-code",
      headers: { authorization: `Bearer ${token}` },
      payload: { code: "222222" },
    });
    expect(res.statusCode).toBe(400);
    expect(res.json().error).toMatch(/deneme/);
  });

  it("rejects an expired code", async () => {
    await setCode("333333", { expiresInMs: -1000, attempts: 0 });
    const res = await app.inject({
      method: "POST",
      url: "/me/phone/verify-code",
      headers: { authorization: `Bearer ${token}` },
      payload: { code: "333333" },
    });
    expect(res.statusCode).toBe(400);
    expect(res.json().error).toMatch(/süresi doldu/);
  });

  it("accepts the correct code and sets phoneVerifiedAt", async () => {
    await setCode("444444");
    const res = await app.inject({
      method: "POST",
      url: "/me/phone/verify-code",
      headers: { authorization: `Bearer ${token}` },
      payload: { code: "444444" },
    });
    expect(res.statusCode).toBe(200);
    const updated = await prisma.user.findUnique({ where: { id: user.id } });
    expect(updated.phoneVerifiedAt).toBeTruthy();
    expect(updated.phoneVerificationCodeHash).toBeNull();
  });

  it("refuses to send a new code once already verified", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/me/phone/send-code",
      headers: { authorization: `Bearer ${token}` },
    });
    expect(res.statusCode).toBe(409);
  });

  it("resets verification when the phone number changes", async () => {
    const newPhone = `05602${Date.now().toString().slice(-6)}`;
    const res = await app.inject({
      method: "PATCH",
      url: "/me",
      headers: { authorization: `Bearer ${token}` },
      payload: { phone: newPhone },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().user.phoneVerifiedAt).toBeNull();
  });
});
