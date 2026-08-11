# Existing keyword audit

The supplied SEMrush token authenticated successfully against the official MCP endpoint and exposed the discovery/report tools. The subscription reported that no API units were available, so no domain rankings or keyword metrics were requested or stored.

Accordingly:

- `data/seo/semrush-existing-rankings.json` contains an empty result plus the machine-readable failure reason.
- the CSV contains headers and no ranking rows.
- the database contains no fabricated `SEMRUSH` keywords.
- there are no evidence-backed positions, volumes, traffic estimates or keyword priorities to report.

Access/units can be managed at `https://www.semrush.com/mcp-access`. Once available, run:

```bash
pnpm seo:research
```

The client uses discovery, report-schema lookup and report execution, applies a per-run call budget, and caches successful responses in PostgreSQL. Any future preservation decisions must be based on those measured results, not the unmeasured topic hypotheses in the opportunity document.
