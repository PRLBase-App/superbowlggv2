# Technical SEO

Implemented:

- server-rendered Next.js metadata with canonical URLs
- dynamic titles/descriptions for games, teams, players, weeks, predictions and profiles
- `SportsEvent`, `SportsTeam`, `Person`, `BreadcrumbList` and WebPage-style JSON-LD where relevant
- `/robots.txt` with private/API/admin exclusions
- `/sitemap.xml` index plus pages, games, teams, players, predictions and Super Bowl sitemaps
- database-backed sitemap routes generated at request time, never from build-time sample rows
- permanent 301 redirects for legacy aliases; `/predict` remains a temporary action redirect
- secure response headers and no framework-powered header
- internal technical crawler storing observed status, metadata, canonical, H1, word count, indexability and issues

Operational checks after deployment:

- all sitemap URLs return canonical 200 pages and contain no private/redirecting URLs
- robots references the production sitemap and does not block public assets
- structured data validates against rendered content
- noindex applies to search/auth/account/private areas
- monitor 404/5xx, canonical changes and redirect chains before DNS cutover and after launch
