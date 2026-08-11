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
# Keep dependency installation in the disposable build stage as root. The
# workdir is created by the base image as root and pnpm needs to create its
# temporary files at the workspace root. The final runtime still runs as the
# unprivileged `node` user.
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @sbgg/db generate

FROM dependencies AS builder
# Build-only values let Next compile dynamic server routes without embedding
# production credentials in an image layer.
RUN NODE_ENV=production \
  DATABASE_URL=postgresql://build:build@127.0.0.1:5432/build \
  APP_URL=https://superbowl.gg \
  AUTH_SECRET=build-only-secret-00000000000000000000000000000000 \
  AUTH_BETTER_SECRET=build-only-better-secret-000000000000000000000000 \
  pnpm --filter @sbgg/web build

FROM base AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder --chown=node:node /app /app
USER node
EXPOSE 3000
# Railway injects RAILWAY_SERVICE_NAME into every deployment. This keeps one
# reproducible image while giving Web and Worker distinct long-lived commands.
CMD ["sh", "-c", "if [ \"$RAILWAY_SERVICE_NAME\" = \"Worker\" ]; then exec pnpm --filter @sbgg/worker start loop; else exec pnpm --filter @sbgg/web start; fi"]
