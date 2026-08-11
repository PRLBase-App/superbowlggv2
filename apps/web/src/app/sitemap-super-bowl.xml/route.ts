import { sitemapBaseUrl, sitemapUrlSet } from "@/lib/sitemap-xml";

export const revalidate = 86_400;

const paths = [
  "/super-bowl",
  "/super-bowl/predictions",
  "/super-bowl/odds",
  "/super-bowl/schedule",
  "/super-bowl/history",
  "/super-bowl/winners",
  "/super-bowl/mvp",
  "/super-bowl/records",
  "/super-bowl/locations",
  "/super-bowl/stadiums",
];

export function GET() {
  return sitemapUrlSet(paths.map((path, index) => ({ loc: `${sitemapBaseUrl}${path}`, changefreq: index < 4 ? "daily" : "yearly", priority: index === 0 ? 0.9 : 0.7 })));
}
