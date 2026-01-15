# syntax=docker/dockerfile:1

FROM node:24.11.1-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# -----------------------------------------------------------
# Stage: deps — Install production dependencies
# -----------------------------------------------------------
FROM base AS deps
WORKDIR /app

COPY .npmrc pnpm-lock.yaml pnpm-workspace.yaml ./
COPY package.json ./
COPY apps/web/package.json ./apps/web/

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --filter @claudehome/web

# -----------------------------------------------------------
# Stage: builder — Build the Next.js application
# -----------------------------------------------------------
FROM base AS builder
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules

COPY .npmrc package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web ./apps/web

RUN pnpm --filter @claudehome/web build

# -----------------------------------------------------------
# Stage: runner — Production runtime
# -----------------------------------------------------------
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/web/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/scripts ./apps/web/scripts

USER nextjs

EXPOSE 3000

CMD ["node", "apps/web/server.js"]

# -----------------------------------------------------------
# Stage: dev — Development with hot-reload
# -----------------------------------------------------------
FROM base AS dev
WORKDIR /app

ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1

COPY .npmrc pnpm-lock.yaml pnpm-workspace.yaml ./
COPY package.json ./
COPY apps/web/package.json ./apps/web/

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --filter @claudehome/web

COPY apps/web ./apps/web

WORKDIR /app/apps/web

EXPOSE 3000

CMD ["npx", "--yes", "next", "dev", "--turbopack"]
