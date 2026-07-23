/** Single source of truth for form validation patterns used across every
 *  web form (auth, request wizard, profile) — before this, the email regex
 *  and phone-length checks were re-typed slightly differently in each form,
 *  so a field could pass validation in one place and fail in another. */

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Normalized Turkish mobile numbers (see normalizePhone in ./phone.js) are
// always "0" + 10 digits, starting with the 5xx mobile prefix.
export const PHONE_REGEX = /^05\d{9}$/;

export function isValidEmail(value) {
  return EMAIL_REGEX.test(value.trim());
}

export function isValidPhone(normalizedValue) {
  return PHONE_REGEX.test(normalizedValue);
}

export function isFilled(value) {
  return typeof value === "string" ? value.trim().length > 0 : value != null;
}

/** Runs a set of { field, value, rules } checks and returns { field: message }
 *  for the first failing rule per field — forms render these directly under
 *  each input instead of a single generic "form invalid" toast. */
export function validate(fields) {
  const errors = {};
  for (const { field, value, rules } of fields) {
    for (const rule of rules) {
      const message = rule(value);
      if (message) {
        errors[field] = message;
        break;
      }
    }
  }
  return errors;
}

export const rules = {
  required:
    (message = "Bu alan zorunlu") =>
    (value) =>
      isFilled(value) ? null : message,
  email:
    (message = "Geçerli bir email adresi gir") =>
    (value) =>
      !value || isValidEmail(value) ? null : message,
  phone:
    (message = "Geçerli bir telefon numarası gir") =>
    (normalizedValue) =>
      !normalizedValue || isValidPhone(normalizedValue) ? null : message,
  minLength:
    (min, message = `En az ${min} karakter olmalı`) =>
    (value) =>
      !value || value.length >= min ? null : message,
};
