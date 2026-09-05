/** `profile.documents` from the API is already filtered to APPROVED-only
 *  (see providers.js) — this just answers "does at least one exist for
 *  this type" for the badge components, shared so provider-card.jsx and
 *  usta/[id]/page.jsx don't each re-implement the same .some() check. */
export function hasApprovedDocument(documents, type) {
  return Boolean(documents?.some((d) => d.type === type));
}
