/** Mirrors apps/web/lib/phone.js — normalized here too since the API is the
 *  actual source of truth and must not depend on every caller normalizing
 *  first (proxy routes, future clients, admin tooling, etc.). */
export function normalizePhone(raw) {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("90") && digits.length === 12) return `0${digits.slice(2)}`;
  if (digits.length === 10) return `0${digits}`;
  return digits;
}
