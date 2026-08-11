# Sports data

The production adapter is API-Sports American Football (`api-sports`). It provides NFL season metadata, teams, schedules, live/final game state, standings, rosters, injuries, game events, team statistics and player statistics.

## Persistence

Responses are parsed defensively into provider-neutral DTOs. Provider entity IDs map to stable internal records. Invalid timestamps, missing team mappings, malformed payloads and non-success HTTP responses fail the job and are written to `IntegrationSyncLog`.

The statistics parser is namespace-aware, so generic fields such as `yards` cannot overwrite passing, rushing or receiving totals from another group.

## Cadence

- teams: weekly (and immediately when empty)
- schedule: every 6 hours (and immediately when empty)
- standings: every 12 hours
- players and injuries: every 6 hours
- live game state and settlement: every 15 minutes

The worker checks provider quota headers and limits detail requests. Configure `API_SPORTS_KEY`; without it, automatic sports jobs remain unavailable, manually queued syncs are marked failed with a configuration error, and no replacement data is inserted.

`API_SPORTS_SEASON` may explicitly select a real historical provider season when an API subscription does not include the current season. The UI and database retain that season year and provider coverage; the worker never relabels generated or guessed data as current sports data. Failed automatic jobs use a bounded backoff instead of retrying every worker cycle.
