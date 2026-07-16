import { prisma } from "@tekliflercepte/db";
import {
  hashPassword,
  verifyPassword,
  signToken,
  requireAuth,
  signPasswordResetToken,
  verifyPasswordResetToken,
} from "../lib/auth.js";
import { normalizePhone } from "../lib/phone.js";
import { sendEmail, escapeHtml } from "../lib/mailer.js";

const WEB_ORIGIN = process.env.WEB_ORIGIN ?? "http://localhost:3002";

export default async function authRoutes(app) {
  app.post("/auth/register", { config: { rateLimit: { max: 10, timeWindow: "1 minute" } } }, async (req, reply) => {
    const { firstName, lastName, password, role, termsAccepted } = req.body ?? {};
    const phone = req.body?.phone ? normalizePhone(req.body.phone) : null;
    const email = req.body?.email?.trim().toLowerCase();
    if (!firstName || !lastName || !phone || !email || !password) {
      return reply.code(400).send({ error: "firstName, lastName, phone, email ve password zorunlu" });
    }
    if (!termsAccepted) {
      return reply.code(400).send({ error: "Kullanıcı Sözleşmesi ve KVKK Aydınlatma Metni'ni kabul etmelisin" });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return reply.code(400).send({ error: "Geçerli bir email adresi gir" });
    }
    const existing = await prisma.user.findFirst({ where: { OR: [{ phone }, { email }] } });
    if (existing) {
      return reply.code(409).send({
        error:
          existing.phone === phone
            ? "Bu telefon numarasıyla zaten bir hesap var"
            : "Bu email adresiyle zaten bir hesap var",
      });
    }

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        phone,
        email,
        passwordHash: await hashPassword(password),
        role: role === "PROVIDER" ? "PROVIDER" : "CUSTOMER",
        termsAcceptedAt: new Date(),
      },
    });

    return reply.code(201).send({ token: signToken(user), user: publicUser(user) });
  });

  app.post("/auth/login", { config: { rateLimit: { max: 10, timeWindow: "1 minute" } } }, async (req, reply) => {
    const { password } = req.body ?? {};
    const phone = req.body?.phone ? normalizePhone(req.body.phone) : null;
    if (!phone || !password) {
      return reply.code(400).send({ error: "phone ve password zorunlu" });
    }
    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return reply.code(401).send({ error: "Telefon numarası veya şifre hatalı" });
    }
    return { token: signToken(user), user: publicUser(user) };
  });

  app.post(
    "/auth/forgot-password",
    { config: { rateLimit: { max: 5, timeWindow: "1 minute" } } },
    async (req, reply) => {
      const email = req.body?.email?.trim().toLowerCase();
      if (!email) return reply.code(400).send({ error: "email zorunlu" });

      const user = await prisma.user.findUnique({ where: { email } });
      if (user) {
        const resetToken = signPasswordResetToken(user);
        const resetUrl = `${WEB_ORIGIN}/sifremi-sifirla?token=${resetToken}`;
        await sendEmail({
          to: user.email,
          subject: "Şifreni sıfırla — Teklifler Cepte",
          html: `<p>Merhaba ${escapeHtml(user.firstName)},</p><p>Şifreni sıfırlamak için <a href="${resetUrl}">buraya tıkla</a>. Bu bağlantı 30 dakika geçerlidir.</p><p>Bu isteği sen yapmadıysan bu emaili yok sayabilirsin.</p>`,
        });
      }
      // Always the same response, whether or not the email exists — avoids
      // leaking which emails are registered.
      return { message: "Bu email kayıtlıysa, şifre sıfırlama bağlantısı gönderildi." };
    }
  );

  app.post(
    "/auth/reset-password",
    { config: { rateLimit: { max: 10, timeWindow: "1 minute" } } },
    async (req, reply) => {
      const { token, newPassword } = req.body ?? {};
      if (!token || !newPassword || newPassword.length < 6) {
        return reply.code(400).send({ error: "token ve en az 6 karakterli newPassword zorunlu" });
      }
      let decoded;
      try {
        decoded = verifyPasswordResetToken(token);
      } catch {
        return reply.code(400).send({ error: "Bağlantının süresi dolmuş veya geçersiz" });
      }
      await prisma.user.update({
        where: { id: decoded.sub },
        data: { passwordHash: await hashPassword(newPassword) },
      });
      return { ok: true };
    }
  );

  app.get("/auth/me", { preHandler: requireAuth }, async (req, reply) => {
    const user = await prisma.user.findUnique({ where: { id: req.user.sub } });
    if (!user) return reply.code(404).send({ error: "Kullanıcı bulunamadı" });
    return publicUser(user);
  });
}

function publicUser(user) {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl,
  };
}
