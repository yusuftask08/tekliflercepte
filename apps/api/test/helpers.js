import { prisma } from "@tekliflercepte/db";
import { hashPassword, signToken } from "../src/lib/auth.js";

let phoneCounter = 0;

/** Shared test-user factory — offers.test.js/messages.test.js each hand-roll
 *  this same shape; new test files use this instead of a third+ copy.
 *  `lineCode` (2-3 digits) keeps phones distinct per test file so parallel
 *  test files never collide on the unique phone constraint; a per-process
 *  counter (not just Date.now()) keeps users created in the same
 *  millisecond within one file from colliding too. */
export async function createTestUser({ role = "CUSTOMER", lineCode = "599", emailPrefix = "usr" } = {}) {
  phoneCounter += 1;
  const suffix = `${Date.now()}${phoneCounter}`.slice(-6);
  const user = await prisma.user.create({
    data: {
      firstName: "Test",
      lastName: role,
      phone: `05${lineCode}${suffix}`,
      email: `${emailPrefix}-${suffix}-${phoneCounter}@example.com`,
      passwordHash: await hashPassword("sifre123"),
      role,
    },
  });
  return { user, token: signToken(user) };
}

export async function createOpenRequest({ customerId, categoryId, overrides = {} } = {}) {
  return prisma.serviceRequest.create({
    data: { customerId, categoryId, city: "İstanbul", details: "test talep", status: "OPEN", ...overrides },
  });
}
