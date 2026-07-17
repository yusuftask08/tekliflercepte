/** In-memory pub/sub for the message SSE stream — one process, no external
 *  broker needed at this scale. Keyed by offerId since a conversation is
 *  scoped to a single offer. */
const subscribers = new Map();

export function subscribe(offerId, res) {
  if (!subscribers.has(offerId)) subscribers.set(offerId, new Set());
  subscribers.get(offerId).add(res);
}

export function unsubscribe(offerId, res) {
  subscribers.get(offerId)?.delete(res);
}

export function publish(offerId, message) {
  const set = subscribers.get(offerId);
  if (!set || set.size === 0) return;
  const payload = `data: ${JSON.stringify(message)}\n\n`;
  for (const res of set) {
    res.write(payload);
  }
}
