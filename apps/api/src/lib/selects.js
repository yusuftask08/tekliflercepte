/** Safe field set for exposing a User via a relation — never include this
 *  model with `true` directly, it would leak passwordHash into the response.
 *  Includes `phone`: only use where the caller is entitled to it (their own
 *  data, or a counterparty in a request/offer/message they're a part of). */
export const safeUserSelect = {
  id: true,
  firstName: true,
  lastName: true,
  phone: true,
  email: true,
  role: true,
  phoneVerifiedAt: true,
  avatarUrl: true,
  createdAt: true,
};

/** Same as safeUserSelect but without `phone` — use for anything reachable
 *  without auth (public provider listings/profiles, reviewer names, etc.)
 *  so phone numbers can't be scraped by anonymous callers. */
export const publicUserSelect = {
  id: true,
  firstName: true,
  lastName: true,
  role: true,
  phoneVerifiedAt: true,
  avatarUrl: true,
  createdAt: true,
};
