import { prisma } from "@sbgg/db";
import { sitemapBaseUrl, sitemapUrlSet } from "@/lib/sitemap-xml";

export const dynamic = "force-dynamic";

export async function GET() {
  const teams = await prisma.team.findMany({ select: { slug: true, updatedAt: true }, orderBy: { name: "asc" }, take: 50_000 });
  return sitemapUrlSet(teams.map((team) => ({ loc: `${sitemapBaseUrl}/nfl/teams/${team.slug}`, lastmod: team.updatedAt, changefreq: "daily", priority: 0.7 })));
}
