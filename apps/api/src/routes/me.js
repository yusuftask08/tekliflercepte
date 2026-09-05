import { prisma } from "@tekliflercepte/db";
import { requireAuth, hashPassword, verifyPassword, signToken } from "../lib/auth.js";
import { safeUserSelect } from "../lib/selects.js";
import { normalizePhone } from "../lib/phone.js";
import { isValidEmail } from "../lib/validation.js";
import { generateOtpCode, hashOtpCode, otpExpiryDate, checkOtpCode } from "../lib/otp.js";
import { sendSms } from "../lib/sms.js";

const OTP_REASON_MESSAGE = {
  none: "Önce bir doğrulama kodu iste",
  locked: "Çok fazla yanlış deneme yaptın, yeni bir kod iste",
  expired: "Kodun süresi doldu, yeni bir kod iste",
  mismatch: "Kod hatalı",
};

export default async function meRoutes(app) {
  app.patch("/me", { preHandler: requireAuth }, async (req, reply) => {
    const { firstName, lastName, avatarUrl } = req.body ?? {};
    const phone = req.body?.phone ? normalizePhone(req.body.phone) : null;
    const email = req.body?.email?.trim().toLowerCase() || null;
    if (email && !isValidEmail(email)) {
      return reply.code(400).send({ error: "Geçerli bir email adresi gir" });
    }
    if (phone || email) {
      const existing = await prisma.user.findFirst({
        where: { OR: [...(phone ? [{ phone }] : []), ...(email ? [{ email }] : [])] },
      });
      if (existing && existing.id !== req.user.sub) {
        return reply.code(409).send({
          error:
            existing.phone === phone
              ? "Bu telefon numarası başka bir hesapta kayıtlı"
              : "Bu email adresi başka bir hesapta kayıtlı",
        });
      }
    }
    const current = await prisma.user.findUnique({ where: { id: req.user.sub } });
    const phoneChanged = phone && phone !== current.phone;
    const updated = await prisma.user.update({
      where: { id: req.user.sub },
      data: {
        ...(firstName ? { firstName } : {}),
        ...(lastName ? { lastName } : {}),
        ...(phone ? { phone } : {}),
        ...(email ? { email } : {}),
        ...(avatarUrl ? { avatarUrl } : {}),
        // A new phone number hasn't been proven to belong to this person —
        // don't let a stale verification carry over to it.
        ...(phoneChanged
          ? {
              phoneVerifiedAt: null,
              phoneVerificationCodeHash: null,
              phoneVerificationExpiresAt: null,
              phoneVerificationAttempts: 0,
            }
          : {}),
      },
    });
    const safe = await prisma.user.findUnique({ where: { id: updated.id }, select: safeUserSelect });
    // firstName/lastName/role are baked into the session JWT for display —
    // re-sign so the header reflects the change without forcing a re-login.
    return { user: safe, token: signToken(updated) };
  });

  app.post("/me/password", { preHandler: requireAuth }, async (req, reply) => {
    const { currentPassword, newPassword } = req.body ?? {};
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return reply.code(400).send({ error: "currentPassword ve en az 6 karakterli newPassword zorunlu" });
    }
    const user = await prisma.user.findUnique({ where: { id: req.user.sub } });
    if (!(await verifyPassword(currentPassword, user.passwordHash))) {
      return reply.code(401).send({ error: "Mevcut şifre hatalı" });
    }
    await prisma.user.update({
      where: { id: req.user.sub },
      data: { passwordHash: await hashPassword(newPassword) },
    });
    return { ok: true };
  });

  app.post(
    "/me/phone/send-code",
    { preHandler: requireAuth, config: { rateLimit: { max: 3, timeWindow: "10 minutes" } } },
    async (req, reply) => {
      const user = await prisma.user.findUnique({ where: { id: req.user.sub } });
      if (!user) return reply.code(404).send({ error: "Kullanıcı bulunamadı" });
      if (user.phoneVerifiedAt) {
        return reply.code(409).send({ error: "Telefonun zaten doğrulanmış" });
      }
      // Guards the same 3-per-10-minute budget against rapid re-requests
      // slipping in right at the rate-limit window edge — a fresh code
      // can't be requested less than 60s after the last one.
      if (
        user.phoneVerificationExpiresAt &&
        user.phoneVerificationExpiresAt.getTime() - Date.now() > 9 * 60 * 1000
      ) {
        return reply.code(429).send({ error: "Az önce bir kod gönderildi, biraz bekle" });
      }

      const code = generateOtpCode();
      await prisma.user.update({
        where: { id: user.id },
        data: {
          phoneVerificationCodeHash: hashOtpCode(code),
          phoneVerificationExpiresAt: otpExpiryDate(),
          phoneVerificationAttempts: 0,
        },
      });
      await sendSms({
        to: user.phone,
        body: `Teklifler Cepte doğrulama kodun: ${code}. Kod 10 dakika geçerlidir.`,
      });
      return { message: "Doğrulama kodu telefonuna gönderildi" };
    }
  );

  app.post(
    "/me/phone/verify-code",
    { preHandler: requireAuth, config: { rateLimit: { max: 10, timeWindow: "10 minutes" } } },
    async (req, reply) => {
      const code = req.body?.code?.trim();
      if (!code) return reply.code(400).send({ error: "code zorunlu" });

      const user = await prisma.user.findUnique({ where: { id: req.user.sub } });
      if (!user) return reply.code(404).send({ error: "Kullanıcı bulunamadı" });
      if (user.phoneVerifiedAt) {
        return reply.code(409).send({ error: "Telefonun zaten doğrulanmış" });
      }

      const result = checkOtpCode(user, code);
      if (!result.ok) {
        if (result.reason === "mismatch") {
          await prisma.user.update({
            where: { id: user.id },
            data: { phoneVerificationAttempts: { increment: 1 } },
          });
        }
        return reply.code(400).send({ error: OTP_REASON_MESSAGE[result.reason] });
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          phoneVerifiedAt: new Date(),
          phoneVerificationCodeHash: null,
          phoneVerificationExpiresAt: null,
          phoneVerificationAttempts: 0,
        },
      });
      return { ok: true };
    }
  );

  app.get("/me/referrals", { preHandler: requireAuth }, async (req) => {
    // referralCode is just the user's own id — no separate short-code
    // table, /kayit?ref=<id> is validated against a real User at register
    // time either way.
    const totalReferred = await prisma.user.count({ where: { referredById: req.user.sub } });
    return { referralCode: req.user.sub, totalReferred };
  });
}
