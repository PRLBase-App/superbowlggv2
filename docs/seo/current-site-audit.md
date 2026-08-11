# Current-site SEO audit

Observed on 2026-08-11 before deployment.

## Existing production origin

| URL | Result | Finding |
|---|---:|---|
| `https://superbowl.gg/` | 404 | Railway fallback returned `Application not found`; no page HTML to audit |
| `https://superbowl.gg/robots.txt` | 200 | Cloudflare-managed robots content; search crawling allowed, selected AI crawlers blocked; no Superbowl sitemap directive observed |
| `https://superbowl.gg/sitemap.xml` | 404 | Railway fallback returned `Application not found` |

Because the origin served no application, there was no defensible live title/meta/canonical/H1/content or internal-link inventory to preserve. The raw observation is stored in `data/seo/current-url-inventory.*`.

## Migration implications

- Deploy and validate the new application before changing DNS/custom-domain routing.
- The new site provides a robots route, sitemap index and split sitemaps.
- Known legacy paths from the requirements/code reconnaissance have explicit permanent redirects in `data/seo/redirect-map.csv`.
- Do not claim that rankings were preserved until Search Console or SEMrush data can be compared after launch.

## Recheck

After cutover, run the internal technical crawler, fetch all sitemap documents, inspect response headers/canonicals and update `predeploy-comparison.md` with production results.
