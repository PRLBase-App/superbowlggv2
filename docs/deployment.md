# Railway deployment

The repository is designed for one Railway project named `Superbowl.gg` with three services:

1. PostgreSQL
2. `Web`: this repository and Dockerfile; the shared image starts `pnpm --filter @sbgg/web start`
3. `Worker`: the same repository/image; the shared image starts `pnpm --filter @sbgg/worker start loop` and checks durable due timestamps every ten minutes

`railway.toml` selects the Dockerfile and runs this pre-deploy command:

```bash
pnpm --filter @sbgg/db production:prepare
```

The seed is idempotent and contains no public sample data. Do not run a destructive reset in Railway.

## Release checklist

1. Provision PostgreSQL and reference its `DATABASE_URL` in both app services.
2. Set `NODE_ENV=production`, public HTTPS URLs and two generated auth secrets.
3. Set `SPORTS_DATA_PROVIDER=nflverse`; configure The Odds API and Resend when those live features should operate. Add API-Sports only when that optional provider is selected.
4. Add the SEMrush token only after the subscription has MCP API units.
5. Deploy Web, confirm `/api/health`, then deploy Worker.
6. Inspect migration, seed and integration logs.
7. Generate a Railway domain; connect `superbowl.gg` only after the deployment is healthy and update DNS.
8. Re-run the SEO predeploy comparison after DNS cutover.

Railway injects `RAILWAY_SERVICE_NAME`; the Docker command uses it to select the Web or Worker process without dashboard-only start-command overrides. The worker remains alive, logs job failures, and retries only when the durable success timestamp remains due. nflverse needs no credential. Missing credentials for optional providers skip their automatic jobs and reject manual sync requests explicitly; they never insert replacement data.

Local Docker validation requires a running Docker daemon. The equivalent production Next build can be run without a reachable database because all database-backed sitemap/leaderboard routes are dynamic.
