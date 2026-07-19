# syntax=docker/dockerfile:1
# Build from the monorepo root: docker build -f apps/api/Dockerfile .
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Prunes the workspace down to just @tekliflercepte/api and the packages it
# actually depends on (@tekliflercepte/db) — keeps the install layer small
# and avoids dragging in apps/web and apps/panel's dependencies.
FROM base AS pruner
RUN npm install -g turbo@^2
COPY . .
RUN turbo prune @tekliflercepte/api --docker

FROM base AS installer
RUN npm install -g pnpm@9
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile
COPY --from=pruner /app/out/full/ .
RUN pnpm --filter @tekliflercepte/db exec prisma generate

FROM base AS runner
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 apiuser
COPY --from=installer --chown=apiuser:nodejs /app .
RUN mkdir -p /app/apps/api/uploads && chown apiuser:nodejs /app/apps/api/uploads
USER apiuser
WORKDIR /app/apps/api
EXPOSE 4000
ENV PORT=4000
CMD ["node", "src/server.js"]
