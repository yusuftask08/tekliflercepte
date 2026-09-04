import crypto from "node:crypto";

const CODE_LENGTH = 6;
const CODE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5;

export function generateOtpCode() {
  // crypto.randomInt avoids Math.random()'s predictability for a
  // security-relevant code, without needing bcrypt's slow hashing —
  // attempts are rate-limited/capped instead.
  return crypto.randomInt(0, 1_000_000).toString().padStart(CODE_LENGTH, "0");
}

export function hashOtpCode(code) {
  return crypto.createHash("sha256").update(code).digest("hex");
}

export function otpExpiryDate() {
  return new Date(Date.now() + CODE_TTL_MS);
}

/** Returns { ok: true } or { ok: false, reason } — reason is one of
 *  "none" | "expired" | "locked" | "mismatch", for the caller to map to
 *  a user-facing message. */
export function checkOtpCode(user, code) {
  if (!user.phoneVerificationCodeHash || !user.phoneVerificationExpiresAt) {
    return { ok: false, reason: "none" };
  }
  if (user.phoneVerificationAttempts >= MAX_ATTEMPTS) {
    return { ok: false, reason: "locked" };
  }
  if (user.phoneVerificationExpiresAt.getTime() < Date.now()) {
    return { ok: false, reason: "expired" };
  }
  if (hashOtpCode(code) !== user.phoneVerificationCodeHash) {
    return { ok: false, reason: "mismatch" };
  }
  return { ok: true };
}

export const OTP_MAX_ATTEMPTS = MAX_ATTEMPTS;
