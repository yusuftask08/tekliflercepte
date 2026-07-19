/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@tekliflercepte/ui"],
  // Self-contained server build (server.js + only the deps it needs) — the
  // Docker image copies just this output instead of the full node_modules.
  output: "standalone",
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
