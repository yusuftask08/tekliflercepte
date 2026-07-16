import { prisma } from "@tekliflercepte/db";
import { requireAuth, hashPassword, verifyPassword, signToken } from "../lib/auth.js";
import { safeUserSelect } from "../lib/selects.js";
import { normalizePhone } from "../lib/phone.js";

export default async function meRoutes(app) {
  app.patch("/me", { preHandler: requireAuth }, async (req, reply) => {
    const { firstName, lastName, avatarUrl } = req.body ?? {};
    const phone = req.body?.phone ? normalizePhone(req.body.phone) : null;
    const email = req.body?.email?.trim().toLowerCase() || null;
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
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
    const updated = await prisma.user.update({
      where: { id: req.user.sub },
      data: {
        ...(firstName ? { firstName } : {}),
        ...(lastName ? { lastName } : {}),
        ...(phone ? { phone } : {}),
        ...(email ? { email } : {}),
        ...(avatarUrl ? { avatarUrl } : {}),
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
}
