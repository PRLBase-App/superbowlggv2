# SEO strategy

## Principles

1. Protect verified rankings first. At present none could be verified because the origin is unavailable and SEMrush has no units.
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
