# SEO strategy

## Principles

1. Protect verified rankings first. The user-provided SEMrush export in `keyword.md` is imported with regional provenance and immutable observations.
2. Give each intent one canonical target URL; redirect aliases instead of duplicating pages.
3. Publish database-backed pages only for real games, teams, players and public predictions.
4. Separate fast-changing hubs (scores, odds, injuries) from evergreen Super Bowl reference pages.
5. Exclude auth, account, admin, API and affiliate redirect routes from indexing.
6. Treat keyword metrics as measured data with provenance and timestamps; never seed invented volume/rank values.

## Architecture

- NFL hub: schedule, scores, standings, odds, injuries, stats, playoffs, teams and players.
- Week hubs: games plus links to picks/odds.
- Entity pages: game center, team, player and public prediction/profile pages.
- Super Bowl hub: predictions/odds/schedule plus history, winners, MVPs, records, locations and stadiums.
- Community: prediction feed and sample-qualified leaderboards.

The sitemap index reflects these canonical families. A monthly measured keyword refresh and daily internal technical audit are scheduled by the worker when configured.

## Imported ranking baseline

`pnpm seo:import-rankings` parses `keyword.md` and persists its observations without calling SEMrush. The import is idempotent, records zero API units, and keeps rankings separate by SEMrush database (`us`, `ca`, `mx`). Repeated observations remain snapshots; the best supplied position is used as the current aggregate.

The August 2026 baseline contains seven observations across six localized keywords. Every supplied row currently ranks the homepage. The US terms are at positions 71–96, the Canadian term `super bowl lx odds` has observations at 66 and 72, and the Mexican term `super bowl line` is at 65. These are protect-and-improve signals, not permission to publish thin or fabricated pages. Historical `LVIII` and misspelled queries remain measured data; visible copy should stay accurate for the current event.

The admin SEO screen exposes database, intent codes, position, volume, difficulty, traffic, traffic share, and ranking URL. A future API refresh can replace the current snapshot for its own regional database without overwriting the other countries.
