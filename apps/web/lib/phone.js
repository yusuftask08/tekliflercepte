/** Normalizes Turkish phone input so "0555 111 22 33", "555-111-22-33" and
 *  "05551112233" all resolve to the same stored value — without this,
 *  formatting differences between register and login would look like a
 *  wrong password. */
export function normalizePhone(raw) {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("90") && digits.length === 12) return `0${digits.slice(2)}`;
  if (digits.length === 10) return `0${digits}`;
  return digits;
}
