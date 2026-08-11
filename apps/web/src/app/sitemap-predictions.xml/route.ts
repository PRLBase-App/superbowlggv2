import { prisma } from "@sbgg/db";
import { sitemapBaseUrl, sitemapUrlSet } from "@/lib/sitemap-xml";

export const dynamic = "force-dynamic";

export async function GET() {
  const predictions = await prisma.prediction.findMany({
    where: { isPublic: true },
    select: { id: true, publishedAt: true },
    orderBy: { publishedAt: "desc" },
    take: 50_000,
  });
  return sitemapUrlSet(predictions.map((prediction) => ({ loc: `${sitemapBaseUrl}/predictions/${prediction.id}`, lastmod: prediction.publishedAt, changefreq: "weekly", priority: 0.5 })));
}
