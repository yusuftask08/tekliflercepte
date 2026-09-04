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
          // Enforcing (not Report-Only) — unlike apps/web, panel has zero
          // inline/external <script> tags and loads no images, so there's
          // no nonce plumbing needed and nothing this can plausibly break.
          // Production-only: Next dev's Fast Refresh needs eval, which a
          // strict script-src would block.
          ...(process.env.NODE_ENV === "production"
            ? [
                {
                  key: "Content-Security-Policy",
                  value:
                    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self'; font-src 'self' https://fonts.gstatic.com; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests;",
                },
              ]
            : []),
        ],
      },
    ];
  },
};

export default nextConfig;
