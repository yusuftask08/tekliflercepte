import { randomUUID } from "node:crypto";
import { createWriteStream } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { requireAuth } from "../lib/auth.js";

/** Extension is derived from this map, never from the client-supplied
 *  filename — otherwise a file sent as mimetype: image/png but named x.svg
 *  would be stored as .svg and served by @fastify/static as image/svg+xml,
 *  which can execute embedded <script> (stored XSS). */
const ALLOWED_TYPES = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
]);
const UPLOAD_DIR = path.join(process.cwd(), "uploads");

export default async function uploadRoutes(app) {
  await mkdir(UPLOAD_DIR, { recursive: true });

  app.post("/uploads", { preHandler: requireAuth }, async (req, reply) => {
    const file = await req.file();
    if (!file) return reply.code(400).send({ error: "Dosya bulunamadı" });
    const ext = ALLOWED_TYPES.get(file.mimetype);
    if (!ext) {
      return reply.code(400).send({ error: "Sadece JPEG, PNG veya WebP yükleyebilirsin" });
    }

    const filename = `${randomUUID()}${ext}`;
    await pipeline(file.file, createWriteStream(path.join(UPLOAD_DIR, filename)));

    return reply.code(201).send({ url: `/uploads/${filename}` });
  });
}
