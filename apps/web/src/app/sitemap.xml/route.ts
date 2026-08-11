import { sitemapIndex } from "@/lib/sitemap-xml";

export const revalidate = 3600;

export function GET() {
  return sitemapIndex([
    "/sitemap-pages.xml",
    "/sitemap-games.xml",
    "/sitemap-teams.xml",
    "/sitemap-players.xml",
    "/sitemap-predictions.xml",
    "/sitemap-super-bowl.xml",
    "/sitemap-blog.xml",
  ]);
}
