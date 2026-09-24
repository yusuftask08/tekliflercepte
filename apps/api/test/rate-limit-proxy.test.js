import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { buildApp } from "../src/app.js";

// Regression test for a real production bug: deployed behind Coolify's
// Traefik reverse proxy, every socket-level request arrives from Traefik's
// own IP. Without `trustProxy: true` on the Fastify instance,
// @fastify/rate-limit's default per-IP keying reads that same proxy IP for
// every real user, collapsing everyone into one shared bucket — one busy
// client exhausting it would 429 every other user on the platform too.
describe("rate limiting keys by the real client IP behind a proxy", () => {
  let app;

  beforeAll(async () => {
    app = await buildApp({ logger: false });
  });

  afterAll(async () => {
    await app.close();
  });

  it("exhausting one client's global rate limit doesn't block an unrelated client", async () => {
    // The global limiter is 100/min (app.js) — burn through client A's
    // budget via X-Forwarded-For, same header Traefik sets in production.
    for (let i = 0; i < 101; i++) {
      await app.inject({ method: "GET", url: "/categories", headers: { "x-forwarded-for": "9.9.9.1" } });
    }

    const exhausted = await app.inject({
      method: "GET",
      url: "/categories",
      headers: { "x-forwarded-for": "9.9.9.1" },
    });
    expect(exhausted.statusCode).toBe(429);

    const unrelated = await app.inject({
      method: "GET",
      url: "/categories",
      headers: { "x-forwarded-for": "9.9.9.2" },
    });
    expect(unrelated.statusCode).toBe(200);
  }, 15000);
});
