import path from "node:path";
import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import multipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import rateLimit from "@fastify/rate-limit";
import healthRoutes from "./routes/health.js";
import authRoutes from "./routes/auth.js";
import categoryRoutes from "./routes/categories.js";
import requestRoutes from "./routes/requests.js";
import offerRoutes from "./routes/offers.js";
import providerRoutes from "./routes/providers.js";
import providerProfileRoutes from "./routes/provider-profile.js";
import messageRoutes from "./routes/messages.js";
import uploadRoutes from "./routes/uploads.js";
import reviewRoutes from "./routes/reviews.js";
import conversationRoutes from "./routes/conversations.js";
import adminRoutes from "./routes/admin.js";
import meRoutes from "./routes/me.js";
import favoriteRoutes from "./routes/favorites.js";
import reportRoutes from "./routes/reports.js";
import blockRoutes from "./routes/blocks.js";
import statsRoutes from "./routes/stats.js";
import locationRoutes from "./routes/locations.js";
import notificationRoutes from "./routes/notifications.js";
import supportTicketRoutes from "./routes/support-tickets.js";
import providerDocumentRoutes from "./routes/provider-documents.js";

/** Builds the Fastify app without starting a listener — used by server.js
 *  for the real process, and directly by tests via app.inject(). */
export async function buildApp({ logger = true } = {}) {
  // Deployed behind Coolify's Traefik reverse proxy (docker-compose.yml) —
  // without this, every request's socket address is Traefik's own internal
  // IP, so @fastify/rate-limit's default per-IP keying collapses ALL real
  // users into one shared bucket: one busy user exhausting it 429s
  // everyone else too. trustProxy makes Fastify read X-Forwarded-For (which
  // Traefik sets) so req.ip is the actual client again.
  // Trade-off: `true` trusts that header unconditionally, so a client that
  // reaches this process directly (bypassing Traefik — shouldn't be
  // reachable, but the compose file does map the port on the host) could
  // spoof X-Forwarded-For to dodge its own rate limit. Low severity here
  // (no payments, worst case is a bit more abuse room for that one client,
  // not a shared-bucket outage for everyone) — if the port is ever
  // confirmed unreachable except via Traefik, this can be tightened to a
  // hop count (e.g. `trustProxy: 1`) instead.
  const app = Fastify({ logger, trustProxy: true });

  await app.register(cors, {
    origin: [process.env.WEB_ORIGIN, process.env.PANEL_ORIGIN].filter(Boolean),
  });
  // contentSecurityPolicy off: this is a JSON API + static image server, not
  // an HTML-serving app, so a CSP directive has nothing to police here.
  // crossOriginResourcePolicy relaxed: uploaded photos are fetched directly
  // from this origin via <img> tags on apps/web and apps/panel, which run on
  // different origins — helmet's default "same-origin" would make browsers
  // block those image loads.
  await app.register(helmet, {
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  });
  await app.register(rateLimit, { max: 100, timeWindow: "1 minute" });
  // 15MB — generous enough for an unedited modern-phone photo so onboarding
  // uploads (face photo, portfolio) don't get rejected by a tight limit.
  await app.register(multipart, { limits: { fileSize: 15 * 1024 * 1024 } });
  await app.register(fastifyStatic, {
    root: path.join(process.cwd(), "uploads"),
    prefix: "/uploads/",
  });

  await app.register(healthRoutes);
  await app.register(authRoutes);
  await app.register(categoryRoutes);
  await app.register(requestRoutes);
  await app.register(offerRoutes);
  await app.register(providerRoutes);
  await app.register(providerProfileRoutes);
  await app.register(messageRoutes);
  await app.register(uploadRoutes);
  await app.register(reviewRoutes);
  await app.register(conversationRoutes);
  await app.register(adminRoutes);
  await app.register(meRoutes);
  await app.register(favoriteRoutes);
  await app.register(reportRoutes);
  await app.register(blockRoutes);
  await app.register(statsRoutes);
  await app.register(locationRoutes);
  await app.register(notificationRoutes);
  await app.register(supportTicketRoutes);
  await app.register(providerDocumentRoutes);

  return app;
}
