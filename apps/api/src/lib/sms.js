/** Best-effort SMS send — never throws, so an OTP/notification failure
 *  can't break the action that triggered it. Logs the message instead of
 *  sending when SMS_PROVIDER_API_KEY isn't set yet (local dev, or before
 *  a Netgsm/İleti Merkezi account is opened) — same shape as lib/mailer.js
 *  so both notification channels turn on the same way: set an env var,
 *  no code change needed. */
const SMS_PROVIDER_API_KEY = process.env.SMS_PROVIDER_API_KEY;
const SMS_PROVIDER_URL = process.env.SMS_PROVIDER_URL;
const SMS_SENDER_ID = process.env.SMS_SENDER_ID ?? "TKLFCEPTE";

export async function sendSms({ to, body }) {
  if (!to) return;
  if (!SMS_PROVIDER_API_KEY || !SMS_PROVIDER_URL) {
    console.log(`[sms] SMS_PROVIDER_API_KEY yok, SMS gönderilmedi. To: ${to} — ${body}`);
    return;
  }
  try {
    await fetch(SMS_PROVIDER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SMS_PROVIDER_API_KEY}`,
      },
      body: JSON.stringify({ to, body, sender: SMS_SENDER_ID }),
    });
  } catch (err) {
    console.error("[sms] gönderim hatası:", err.message);
  }
}
