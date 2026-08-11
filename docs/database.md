# Database

PostgreSQL is the system of record and Prisma is the schema/migration layer.

## Model groups

- Identity: `User`, `Account`, `Session`, `VerificationToken`, `Profile`, follows and favorite teams.
- Sports: leagues, seasons, teams, players, games, events, standings, injuries and team/player statistics.
- Odds/predictions: bookmakers, markets, outcomes, snapshots, predictions and settlements.
- Economy: wallet, immutable transactions, XP, levels, achievements, streaks and referrals.
- Commercial: affiliate partners/offers/clicks/conversions, ads, marketplace offers/redemptions and jurisdictions.
- Operations: analytics, content, feature flags, settings, audit logs and provider sync logs.
- SEO: keywords/snapshots, pages, opportunities, redirects, research runs and API cache.

## Integrity

The migrations add uniqueness for provider mappings, odds outcomes, request idempotency, reward references, redemptions and settlement records. Foreign-key delete behavior is explicit. Financial-style coin operations use database transactions and record `balanceAfter` for auditability.

## Commands

```bash
pnpm --filter @sbgg/db generate
pnpm --filter @sbgg/db migrate   # development
pnpm --filter @sbgg/db migrate:deploy    # production migrations
pnpm --filter @sbgg/db seed      # idempotent configuration only
```

Never run `prisma migrate reset` against production. Railway runs `migrate:deploy` and the idempotent seed before each release.
