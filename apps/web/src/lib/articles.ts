import { Prisma, prisma } from "@sbgg/db";

export {
  articleHeadings,
  articleReadingMinutes,
  articleSources,
  articleWordCount,
  safeJsonLd,
  slugify,
} from "@/lib/article-utils";
export type { ArticleSource } from "@/lib/article-utils";

export const articleWithAuthor = Prisma.validator<Prisma.ArticleDefaultArgs>()({
  include: { author: true },
});

export type ArticleWithAuthor = Prisma.ArticleGetPayload<typeof articleWithAuthor>;

function publishedWhere(now = new Date()): Prisma.ArticleWhereInput {
  return { status: "PUBLISHED", publishedAt: { lte: now } };
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
