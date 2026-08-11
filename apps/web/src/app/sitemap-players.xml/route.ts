import { prisma } from "@sbgg/db";
import { sitemapBaseUrl, sitemapUrlSet } from "@/lib/sitemap-xml";

export const dynamic = "force-dynamic";

export async function GET() {
  const players = await prisma.player.findMany({ select: { slug: true, updatedAt: true }, orderBy: { name: "asc" }, take: 50_000 });
  return sitemapUrlSet(players.map((player) => ({ loc: `${sitemapBaseUrl}/nfl/players/${player.slug}`, lastmod: player.updatedAt, changefreq: "weekly", priority: 0.6 })));
}
