# syntax=docker/dockerfile:1
# Build from the monorepo root: docker build -f apps/panel/Dockerfile .
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

FROM base AS pruner
RUN npm install -g turbo@^2
COPY . .
RUN turbo prune @tekliflercepte/panel --docker

FROM base AS installer
RUN npm install -g pnpm@9
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile
COPY --from=pruner /app/out/full/ .
RUN pnpm --filter @tekliflercepte/db exec prisma generate
# Public env vars are baked in at build time (Next.js inlines NEXT_PUBLIC_*
# into the client bundle) — pass them as build args from docker-compose.
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN pnpm turbo run build --filter=@tekliflercepte/panel

FROM base AS runner
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
# No public/ dir in this app.
COPY --from=installer --chown=nextjs:nodejs /app/apps/panel/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/panel/.next/static ./apps/panel/.next/static
USER nextjs
EXPOSE 3001
ENV PORT=3001
CMD ["node", "apps/panel/server.js"]
