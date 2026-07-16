import { Resend } from "resend";

/** Escapes user-controlled text before it's interpolated into an email's
 *  HTML body — names, message bodies, etc. are attacker-controlled strings,
 *  and most webmail clients don't fully neutralize embedded markup. */
export function escapeHtml(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]
  );
}

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.RESEND_FROM_EMAIL ?? "Teklifler Cepte <bildirim@tekliflercepte.com>";

/** Best-effort email send — never throws, so a notification failure can't
 *  break the action that triggered it (creating an offer, selecting one,
 *  sending a message). Logs instead of sending when RESEND_API_KEY isn't
 *  set yet (local dev, or before the account is created). */
export async function sendEmail({ to, subject, html }) {
  if (!to) return;
  if (!resend) {
    console.log(`[mailer] RESEND_API_KEY yok, email gönderilmedi. To: ${to} — ${subject}`);
    return;
  }
  try {
    await resend.emails.send({ from: FROM, to, subject, html });
  } catch (err) {
    console.error("[mailer] gönderim hatası:", err.message);
  }
}
