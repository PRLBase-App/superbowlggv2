# Testing

## Automated gates

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

Vitest covers settlement boundary cases (moneyline, spread, total, player props, pushes/voids), gamification levels/points/streaks, geo fail-closed behavior, and deterministic SEO opportunity scoring. TypeScript strict mode and `noUncheckedIndexedAccess` apply across the monorepo.

The production build must be run with `NODE_ENV=production`, schema-valid secrets/URLs, and either a local database or the build-only unreachable database values used by the Dockerfile. Database-backed routes must not execute provider or database work at image-build time.

## Manual QA

- public desktop/mobile navigation and empty states
- `/api/health`, robots and every sitemap
- registration, received verification email, verification and sign-in
- provider sync status in admin with actual keys
- game prediction creation, kickoff lock and final settlement
- wallet ledger/idempotent daily claim
- follow/referral/notification flows
- real marketplace redemption and geo-restricted affiliate handoff
- admin RBAC and audit log

External-provider end-to-end checks cannot be marked passing until their credentials and quota are available. Test fixtures are allowed only inside tests; production code contains no mock provider.
