# Environment variables

Copy `.env.example` locally. Never commit `.env` and never put provider/auth keys in `NEXT_PUBLIC_*` values.

| Variable | Required in production | Purpose |
|---|---:|---|
| `DATABASE_URL` | yes | PostgreSQL connection |
| `APP_URL` | yes | public HTTPS origin used server-side |
| `NEXT_PUBLIC_APP_URL` | yes | public browser-visible origin |
| `AUTH_SECRET` | yes | minimum 32-character auth secret |
| `AUTH_BETTER_SECRET` | yes | independent minimum 32-character Better Auth secret |
| `EMAIL_FROM` | yes for email | verified sender identity |
| `RESEND_API_KEY` | yes for auth email | verification/reset delivery |
| `SPORTS_DATA_PROVIDER` | yes | `nflverse` (default) or `api-sports` |
| `API_SPORTS_KEY` | only for `api-sports` | API-Sports American Football |
| `API_SPORTS_BASE_URL` | no | provider base override |
| `API_SPORTS_SEASON` | no | explicitly select an accessible real season when the provider plan excludes the current season |
| `THE_ODDS_API_KEY` | yes for odds | The Odds API |
| `THE_ODDS_API_BASE_URL` | no | provider base override |
| `SEMRUSH_API_KEY` | yes for SEMrush runs | server-only MCP token |
| `SEMRUSH_MCP_URL` | no | defaults to official v2 MCP endpoint |
| `SEMRUSH_DATABASE` | no | defaults to `us` |
| `SEMRUSH_COUNTRY` | no | defaults to `US` |
| `SEMRUSH_RESEARCH_ENABLED` | no | enable scheduled research |
| `SEMRUSH_MAX_UNITS_PER_RUN` | no | bounded MCP call budget |
| `SEMRUSH_CACHE_DAYS` | no | durable result cache lifetime |
| `ADMIN_EMAIL` | recommended | verified account promoted to super admin |
| `REDIS_URL` | no | reserved; initial scheduler uses PostgreSQL |
| storage variables | no | reserved for future uploaded assets |
| geo/AI variables | no | disabled by default; no fabricated fallback |

The production default is nflverse, which publishes real NFL schedules, rosters, team data and statistics without an API key. API-Sports remains available for explicitly selected historical or licensed coverage; it is never used as a fabricated fallback.
