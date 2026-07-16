import path from "node:path";
import Fastify from "fastify";
import cors from "@fastify/cors";
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

/** Builds the Fastify app without starting a listener — used by server.js
 *  for the real process, and directly by tests via app.inject(). */
export async function buildApp({ logger = true } = {}) {
  const app = Fastify({ logger });

  await app.register(cors, {
    origin: [process.env.WEB_ORIGIN, process.env.PANEL_ORIGIN].filter(Boolean),
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

  return app;
}
