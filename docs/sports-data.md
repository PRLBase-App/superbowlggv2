# Sports data

The production adapter is nflverse (`nflverse`). It publishes real NFL team metadata, schedules, scores, rosters and player/team statistics under CC BY 4.0. The adapter reads the maintained nflverse release files directly and keeps their source identifiers; it does not generate games, scores, players or statistics.

API-Sports American Football remains an optional adapter. Select it explicitly with `SPORTS_DATA_PROVIDER=api-sports` and configure `API_SPORTS_KEY` when its licensed coverage is required. It is not the default and never replaces unavailable data with fixtures.

## Persistence

Responses are parsed defensively into provider-neutral DTOs. Provider entity IDs map to stable internal records. Invalid timestamps, missing team mappings, malformed payloads and non-success HTTP responses fail the job and are written to `IntegrationSyncLog`. Existing teams and players are reconciled by stable football identity when the selected provider changes, preventing duplicate franchises.

The statistics parser is namespace-aware, so generic fields such as `yards` cannot overwrite passing, rushing or receiving totals from another group.

## Cadence

- teams: weekly (and immediately when empty)
- schedule: every 6 hours (and immediately when empty)
- standings: every 12 hours
- players and injuries: every 6 hours
- live game state and settlement: every 15 minutes
- ESPN NFL news feed: every 30 minutes

The nflverse files are cached within each worker run. Missing or not-yet-published season files produce an honest empty result or a failed integration log; the site never substitutes an older season. nflverse does not publish an injury feed, so injury coverage stays explicitly unavailable under that provider.

News is read from ESPN's official NFL RSS feed. Superbowl.gg stores the original headline, excerpt, publication time, source and destination URL, matches a team only when the feed text supports it, and always links readers to the publisher.

When API-Sports is selected, the worker checks quota headers and limits detail requests. `API_SPORTS_SEASON` may explicitly select a real historical provider season when a subscription excludes the current season. The UI and database retain that season year and provider coverage; the worker never relabels historical data as current. Failed automatic jobs use a bounded backoff instead of retrying every worker cycle.
