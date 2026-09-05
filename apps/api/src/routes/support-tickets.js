import { prisma } from "@tekliflercepte/db";
import { optionalAuth } from "../lib/auth.js";
import { isValidEmail } from "../lib/validation.js";
import { sendEmail, escapeHtml } from "../lib/mailer.js";

const PANEL_ORIGIN = process.env.PANEL_ORIGIN ?? "http://localhost:3001";

export default async function supportTicketRoutes(app) {
  // Open to logged-out visitors (/iletisim is public) — optionalAuth just
  // attaches userId when a session happens to be present, it never gates
  // the request. Rate limited harder than most POSTs since it has no auth
  // wall to slow down spam/abuse.
  app.post(
    "/support-tickets",
    { preHandler: optionalAuth, config: { rateLimit: { max: 5, timeWindow: "10 minutes" } } },
    async (req, reply) => {
      const { name, email, subject, message } = req.body ?? {};
      if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
        return reply.code(400).send({ error: "name, email, subject ve message zorunlu" });
      }
      if (!isValidEmail(email)) {
        return reply.code(400).send({ error: "Geçerli bir email adresi gir" });
      }
      if (subject.length > 150 || message.length > 3000) {
        return reply.code(400).send({ error: "subject en fazla 150, message en fazla 3000 karakter olabilir" });
      }

      const ticket = await prisma.supportTicket.create({
        data: {
          userId: req.user?.sub ?? null,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          subject: subject.trim(),
          message: message.trim(),
        },
      });

      const admins = await prisma.user.findMany({
        where: { role: "ADMIN", email: { not: null } },
        select: { email: true },
      });
      for (const admin of admins) {
        sendEmail({
          to: admin.email,
          subject: `Yeni destek talebi: ${ticket.subject}`,
          html: `<p><strong>${escapeHtml(ticket.name)}</strong> (${escapeHtml(ticket.email)}) yeni bir destek talebi gönderdi.</p><p>${escapeHtml(ticket.message)}</p><p><a href="${PANEL_ORIGIN}/destek-talepleri">Panelden incele</a></p>`,
        });
      }

      return reply.code(201).send({ ok: true });
    }
  );
}
