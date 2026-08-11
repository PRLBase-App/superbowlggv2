# Railway deployment

The repository is designed for one Railway project named `Superbowl.gg` with three services:

1. PostgreSQL
2. `Web`: this repository, Dockerfile build, start `pnpm --filter @sbgg/web start`, health path `/api/health`
3. `Worker`: the same repository/image, start `pnpm --filter @sbgg/worker start due`, cron `*/10 * * * *` (UTC), no restart after a successful one-shot run

`railway.toml` selects the Dockerfile and runs this pre-deploy command:

```bash
pnpm --filter @sbgg/db deploy && pnpm --filter @sbgg/db seed
```

The seed is idempotent and contains no public sample data. Do not run a destructive reset in Railway.

## Release checklist

1. Provision PostgreSQL and reference its `DATABASE_URL` in both app services.
2. Set `NODE_ENV=production`, public HTTPS URLs and two generated auth secrets.
3. Configure Resend, API-Sports and The Odds API keys when those live features should operate.
4. Add the SEMrush token only after the subscription has MCP API units.
5. Deploy Web, confirm `/api/health`, then deploy/trigger Worker.
6. Inspect migration, seed and integration logs.
7. Generate a Railway domain; connect `superbowl.gg` only after the deployment is healthy and update DNS.
8. Re-run the SEO predeploy comparison after DNS cutover.

Railway cron expressions use UTC. The due dispatcher itself keeps provider cadences and exits non-zero if a due job fails.

Local Docker validation requires a running Docker daemon. The equivalent production Next build can be run without a reachable database because all database-backed sitemap/leaderboard routes are dynamic.
