/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@tekliflercepte/ui"],
  // Self-contained server build (server.js + only the deps it needs) — the
  // Docker image copies just this output instead of the full node_modules.
  output: "standalone",
  // Dev-only indicator otherwise sits bottom-left and collides with the
  // mobile bottom nav — moved out of the way, nothing else lives up there.
  devIndicators: { position: "top-right" },
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
