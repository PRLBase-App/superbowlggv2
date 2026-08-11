# Predeploy SEO comparison

Status on 2026-08-11: local candidate validated; production cutover not yet compared.

| Check | Existing origin | Candidate build |
|---|---|---|
| Home | 404 Railway fallback | route compiled; browser/runtime check required |
| Robots | Cloudflare-managed file, no observed sitemap directive | Next robots route with sitemap and private exclusions |
| Sitemap index | 404 | split sitemap index compiled |
| Canonicals/meta | unavailable | implemented across canonical route families |
| Entity URLs | unavailable | generated only from real database entities |
| Legacy aliases | unknown | explicit 301 map implemented |
| SEMrush rankings | unavailable: no API units | no invented metrics imported |

This is not a completed migration comparison. Complete it against the deployed Railway URL, then again after `superbowl.gg` DNS cutover. Record final HTTP status, title, meta description, H1, canonical, robots directive and redirect target for every legacy URL and sitemap sample.
