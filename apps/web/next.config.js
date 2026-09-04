/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@tekliflercepte/ui"],
  // Self-contained server build (server.js + only the deps it needs) — the
  // Docker image copies just this output instead of the full node_modules.
  output: "standalone",
  // Dev-only indicator otherwise sits bottom-left and collides with the
  // mobile bottom nav — moved out of the way, nothing else lives up there.
  devIndicators: { position: "top-right" },
  // Uploaded photos are served from the API's own origin — next/image needs
  // it allowlisted to optimize/serve them. The local dev port is read from
  // NEXT_PUBLIC_API_URL (apps/web/.env.local) instead of hardcoded, so it
  // can't silently drift out of sync with whatever port the API actually
  // dev-listens on (bit us once already — api moved 4000 -> 4001).
  images: {
    remotePatterns: [
      ...(process.env.NEXT_PUBLIC_API_URL?.startsWith("http://localhost")
        ? [{ protocol: "http", hostname: "localhost", port: new URL(process.env.NEXT_PUBLIC_API_URL).port }]
        : [{ protocol: "http", hostname: "localhost", port: "4000" }]),
      { protocol: "https", hostname: "api.tekliflercepte.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
        ],
      },
    ];
  },
};

export default nextConfig;
