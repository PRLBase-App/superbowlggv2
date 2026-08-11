import { prisma } from "@sbgg/db";

export const dynamic = "force-dynamic";

function escapeXml(value: string): string {
  return value.replace(/[<>&'\"]/g, (character) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", "\"": "&quot;" })[character] ?? character);
}

export async function GET() {
  const articles = await prisma.article.findMany({
    where: { status: "PUBLISHED", publishedAt: { lte: new Date() } },
    include: { author: true },
    orderBy: { publishedAt: "desc" },
    take: 30,
  });
  const items = articles.map((article) => {
    const url = `https://superbowl.gg/blog/${article.slug}`;
    const published = article.publishedAt ?? article.createdAt;
    return `<item><title>${escapeXml(article.title)}</title><link>${url}</link><guid isPermaLink="true">${url}</guid><description>${escapeXml(article.excerpt)}</description><category>${escapeXml(article.category)}</category><author>editorial@superbowl.gg (${escapeXml(article.author.name)})</author><pubDate>${published.toUTCString()}</pubDate></item>`;
  }).join("");
  const lastBuildDate = (articles[0]?.updatedAt ?? new Date()).toUTCString();
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>Superbowl.gg NFL Analysis</title><link>https://superbowl.gg/blog</link><description>Original, source-backed NFL analysis, guides and Super Bowl research.</description><language>en-us</language><lastBuildDate>${lastBuildDate}</lastBuildDate><atom:link href="https://superbowl.gg/blog/feed.xml" rel="self" type="application/rss+xml"/>${items}</channel></rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=300, s-maxage=900, stale-while-revalidate=86400" } });
}
