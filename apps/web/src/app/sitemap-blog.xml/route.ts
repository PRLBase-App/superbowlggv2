import { prisma } from "@sbgg/db";
import { sitemapBaseUrl, sitemapUrlSet } from "@/lib/sitemap-xml";

export const dynamic = "force-dynamic";

export async function GET() {
  const [articles, authors] = await Promise.all([
    prisma.article.findMany({ where: { status: "PUBLISHED", publishedAt: { lte: new Date() } }, select: { slug: true, updatedAt: true }, orderBy: { publishedAt: "desc" } }),
    prisma.articleAuthor.findMany({ where: { articles: { some: { status: "PUBLISHED", publishedAt: { lte: new Date() } } } }, select: { slug: true, updatedAt: true } }),
  ]);
  return sitemapUrlSet([
    { loc: `${sitemapBaseUrl}/blog`, changefreq: "daily", priority: 0.9 },
    ...articles.map((article) => ({ loc: `${sitemapBaseUrl}/blog/${article.slug}`, lastmod: article.updatedAt, changefreq: "weekly" as const, priority: 0.8 })),
    ...authors.map((author) => ({ loc: `${sitemapBaseUrl}/authors/${author.slug}`, lastmod: author.updatedAt, changefreq: "monthly" as const, priority: 0.5 })),
  ]);
}
