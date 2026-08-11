# Superbowl.gg v2

Production-oriented American-football prediction and community platform. The repository contains a Next.js web app, a one-shot background worker, PostgreSQL/Prisma persistence, real provider adapters, virtual-currency gamification, affiliate tracking, marketplace fulfillment, and an SEO research pipeline.

Production code never falls back to generated games, odds, users, predictions, rankings, offers, or SEO metrics. A missing provider credential produces an explicit unavailable/empty state and a failed integration log.

## Stack

- Node.js 22, pnpm 9 workspaces, TypeScript strict
- Next.js 15, React 19, Tailwind CSS 4
- PostgreSQL and Prisma 6
- Better Auth with Resend email delivery
- API-Sports American Football, The Odds API, SEMrush MCP
- Vitest, ESLint, Docker, Railway

## Local setup

Requirements: Node.js 22+, pnpm 9+, and PostgreSQL.

```bash
cp .env.example .env
pnpm install
pnpm --filter @sbgg/db generate
pnpm --filter @sbgg/db deploy
pnpm --filter @sbgg/db seed
pnpm dev
```

Run due background jobs once:

```bash
pnpm --filter @sbgg/worker start due
```

The production seed creates only configuration records: the NFL league, XP levels, achievement definitions, marketplace categories, feature flags, and provenance settings. It never creates user-facing sample data.

## Quality gates

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

Provider-backed features require their own credentials. See [environment variables](docs/environment-variables.md), [deployment](docs/deployment.md), and the provider-specific documents under `docs/`.

## Workspace

```text
apps/web       Next.js UI, API routes, auth and admin
apps/worker    one-shot scheduled provider/settlement/SEO jobs
packages/db    Prisma schema, migrations and production-safe seed
packages/core  validated environment and shared settlement rules
packages/auth  Better Auth server configuration and Resend delivery
packages/sports API-Sports adapter
packages/odds  The Odds API adapter
packages/gamification transactional rewards and statistics
packages/affiliate affiliate, geo and marketplace services
packages/seo   SEMrush MCP client, durable cache and technical crawler
```

The Railway deployment uses one image for two services: `Web` and a cron-triggered `Worker`, plus PostgreSQL. Migrations and the configuration seed run as a pre-deploy command.
