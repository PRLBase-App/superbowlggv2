# Architecture

## Runtime topology

```text
Browser / crawler
       |
       v
Next.js Web service ---- Better Auth ---- Resend
       |
       +---- PostgreSQL <---- one-shot Worker (Railway cron)
                    |              |        |          |
                    |          API-Sports  Odds API  SEMrush MCP
                    |
              durable source of truth
```

The web and worker share domain packages, Prisma models, and validation. The browser never receives provider or authentication secrets. Provider responses are normalized into internal DTOs before persistence.

## Service boundaries

- `apps/web`: server-rendered public pages, authenticated product UI, API routes, RBAC admin, XML sitemaps and structured metadata.
- `apps/worker`: exits after one invocation. PostgreSQL timestamps decide which jobs are due, so Railway can invoke it every ten minutes without duplicating expensive provider work.
- `packages/db`: the only schema and migration history.
- `packages/core`: environment validation, constants and the single pure settlement engine.
- provider packages: outbound HTTP and response normalization only.
- domain packages: transactional gamification, affiliate/marketplace, and SEO operations.

## Consistency rules

- Provider IDs are mapped to stable internal IDs with `ProviderEntityMapping`.
- Odds used by a prediction point to an immutable `OddsSnapshot` selected server-side.
- Wallet changes always create a ledger row in the same transaction.
- rewards and notifications use reference/dedupe keys.
- marketplace inventory and balance changes use serializable transactions.
- syncs and SEO research create durable status logs with bounded error text.
- missing integrations fail closed; the database is never populated with fabricated fallbacks.

## Caching and realtime

Public server pages use short revalidation/dynamic rendering appropriate to their data. Live game state is polled from a same-origin endpoint. SEMrush results use a durable PostgreSQL cache. Odds history is append-only when price or line changes.
