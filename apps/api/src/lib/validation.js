/** Single source of truth for validation patterns shared across API routes —
 *  keeps the email format check consistent with the web app's own
 *  lib/validation.js instead of two slightly-driftable copies of the regex. */

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value) {
  return EMAIL_REGEX.test(value);
}
