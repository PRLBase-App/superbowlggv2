import { prisma } from "@sbgg/db";
import { sitemapBaseUrl, sitemapUrlSet } from "@/lib/sitemap-xml";

export const dynamic = "force-dynamic";

export async function GET() {
  const games = await prisma.game.findMany({ select: { id: true, updatedAt: true }, orderBy: { scheduledAt: "desc" }, take: 50_000 });
  return sitemapUrlSet(games.map((game) => ({ loc: `${sitemapBaseUrl}/games/${game.id}`, lastmod: game.updatedAt, changefreq: "hourly", priority: 0.8 })));
}
