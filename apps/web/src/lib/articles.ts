import { Prisma, prisma } from "@sbgg/db";

export const articleWithAuthor = Prisma.validator<Prisma.ArticleDefaultArgs>()({
  include: { author: true },
});

export type ArticleWithAuthor = Prisma.ArticleGetPayload<typeof articleWithAuthor>;

export interface ArticleSource {
  title: string;
  url: string;
}

const wordsPerMinute = 220;

function publishedWhere(now = new Date()): Prisma.ArticleWhereInput {
  return { status: "PUBLISHED", publishedAt: { lte: now } };
}

export function articleWordCount(body: string): number {
  return body.match(/[\p{L}\p{N}]+(?:['’.-][\p{L}\p{N}]+)*/gu)?.length ?? 0;
}

export function articleReadingMinutes(body: string): number {
  return Math.max(1, Math.ceil(articleWordCount(body) / wordsPerMinute));
}

export function articleSources(value: Prisma.JsonValue | null): ArticleSource[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((source) => {
    if (!source || Array.isArray(source) || typeof source !== "object") return [];
    const title = source.title;
    const url = source.url;
    if (typeof title !== "string" || typeof url !== "string") return [];
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return [];
    } catch {
      return [];
    }
    return [{ title, url }];
  });
}

export function articleHeadings(body: string): { id: string; label: string }[] {
  const used = new Map<string, number>();
  return body.split("\n").flatMap((line) => {
    const match = /^##\s+(.+?)\s*$/.exec(line);
    if (!match) return [];
    const label = match[1]!.replace(/[*_`]/g, "").trim();
    const base = slugify(label) || "section";
    const count = used.get(base) ?? 0;
    used.set(base, count + 1);
    return [{ id: count ? `${base}-${count + 1}` : base, label }];
  });
}

export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

export function safeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export async function getPublishedArticles({
  page = 1,
  limit = 9,
  category,
}: {
  page?: number;
  limit?: number;
  category?: string;
} = {}) {
  const safePage = Math.max(1, Math.floor(page));
  const safeLimit = Math.min(30, Math.max(1, Math.floor(limit)));
  const where: Prisma.ArticleWhereInput = {
    ...publishedWhere(),
    ...(category ? { category: { equals: category, mode: "insensitive" } } : {}),
  };
  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      ...articleWithAuthor,
      orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
    }),
    prisma.article.count({ where }),
  ]);
  return { articles, total, page: safePage, limit: safeLimit, pages: Math.max(1, Math.ceil(total / safeLimit)) };
}

export async function getPublishedArticle(slug: string): Promise<ArticleWithAuthor | null> {
  return prisma.article.findFirst({
    where: { slug, ...publishedWhere() },
    ...articleWithAuthor,
  });
}

export async function getArticleCategories() {
  const rows = await prisma.article.groupBy({
    by: ["category"],
    where: publishedWhere(),
    _count: { _all: true },
    orderBy: { category: "asc" },
  });
  return rows.map((row) => ({ category: row.category, count: row._count._all }));
}

export async function getRelatedArticles(article: ArticleWithAuthor, limit = 3): Promise<ArticleWithAuthor[]> {
  const sharedTags = article.tags.length ? { hasSome: article.tags } : undefined;
  return prisma.article.findMany({
    where: {
      ...publishedWhere(),
      id: { not: article.id },
      OR: [{ category: article.category }, ...(sharedTags ? [{ tags: sharedTags }] : [])],
    },
    ...articleWithAuthor,
    orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
    take: limit,
  });
}

export async function getPublishedAuthor(slug: string) {
  return prisma.articleAuthor.findFirst({
    where: { slug, articles: { some: publishedWhere() } },
    include: {
      articles: {
        where: publishedWhere(),
        include: { author: true },
        orderBy: { publishedAt: "desc" },
      },
    },
  });
}
