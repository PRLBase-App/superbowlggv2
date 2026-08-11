# syntax=docker/dockerfile:1
FROM node:22-bookworm-slim AS base

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
ENV NEXT_TELEMETRY_DISABLED=1

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates openssl \
  && rm -rf /var/lib/apt/lists/* \
  && corepack enable \
  && corepack prepare pnpm@9.15.9 --activate

WORKDIR /app

FROM base AS dependencies
COPY --chown=node:node . .
USER node
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @sbgg/db generate

FROM dependencies AS builder
# Build-only values let Next compile dynamic server routes without embedding
# production credentials in an image layer.
ENV NODE_ENV=production
ENV DATABASE_URL=postgresql://build:build@127.0.0.1:5432/build
ENV APP_URL=https://superbowl.gg
ENV AUTH_SECRET=build-only-secret-00000000000000000000000000000000
ENV AUTH_BETTER_SECRET=build-only-better-secret-000000000000000000000000
RUN pnpm --filter @sbgg/web build

FROM base AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder --chown=node:node /app /app
USER node
EXPOSE 3000
CMD ["pnpm", "--filter", "@sbgg/web", "start"]
