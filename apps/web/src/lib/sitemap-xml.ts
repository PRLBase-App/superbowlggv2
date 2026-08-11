import { brand } from "@sbgg/core";

export const sitemapBaseUrl = `https://${brand.domain}`;

export interface SitemapEntry {
  loc: string;
  lastmod?: Date | string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: number;
}

function escapeXml(value: string): string {
  return value.replace(/[<>&'\"]/g, (character) => ({
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    "'": "&apos;",
    "\"": "&quot;",
  })[character] ?? character);
}

function xmlResponse(body: string): Response {
  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

export function sitemapIndex(paths: string[]): Response {
  const body = paths.map((path) => `<sitemap><loc>${escapeXml(`${sitemapBaseUrl}${path}`)}</loc></sitemap>`).join("");
  return xmlResponse(`<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</sitemapindex>`);
}

export function sitemapUrlSet(entries: SitemapEntry[]): Response {
  const body = entries.map((entry) => {
    const lastmod = entry.lastmod ? `<lastmod>${escapeXml((entry.lastmod instanceof Date ? entry.lastmod : new Date(entry.lastmod)).toISOString())}</lastmod>` : "";
    const changefreq = entry.changefreq ? `<changefreq>${entry.changefreq}</changefreq>` : "";
    const priority = entry.priority != null ? `<priority>${entry.priority.toFixed(1)}</priority>` : "";
    return `<url><loc>${escapeXml(entry.loc)}</loc>${lastmod}${changefreq}${priority}</url>`;
  }).join("");
  return xmlResponse(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`);
}
