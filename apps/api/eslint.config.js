import { baseConfig } from "@tekliflercepte/config/eslint";

/** Plain Node/Fastify service — no next/core-web-vitals here (that's
 *  web/panel's config), just the shared base plus the Node globals actual
 *  route/lib code references (process, console, URL, fetch, setInterval —
 *  checked against apps/api/src, not the full Node global list). */
export default [
  ...baseConfig,
  {
    languageOptions: {
      globals: {
        process: "readonly",
        console: "readonly",
        URL: "readonly",
        fetch: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
      },
    },
  },
];
