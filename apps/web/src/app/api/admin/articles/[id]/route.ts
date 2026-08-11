import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { Prisma, prisma } from "@sbgg/db";
import { articleInputSchema } from "@/lib/article-validation";
import { requireAdmin } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  const { id } = await params;
  const parsed = articleInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid article" }, { status: 400 });
  const [existing, author] = await Promise.all([
    prisma.article.findUnique({ where: { id } }),
    prisma.articleAuthor.findUnique({ where: { id: parsed.data.authorId }, select: { id: true } }),
  ]);
  if (!existing) return NextResponse.json({ error: "Article not found" }, { status: 404 });
  if (!author) return NextResponse.json({ error: "The selected author does not exist" }, { status: 400 });
  const input = parsed.data;
  try {
    const article = await prisma.article.update({
      where: { id },
      data: {
        authorId: input.authorId, title: input.title, slug: input.slug, excerpt: input.excerpt, body: input.body,
        category: input.category, tags: input.tags, status: input.status, featured: input.featured,
        heroImageUrl: input.heroImageUrl || null, heroImageAlt: input.heroImageAlt || null,
        seoTitle: input.seoTitle || null, seoDescription: input.seoDescription || null,
        sourceLinks: input.sourceLinks as Prisma.InputJsonValue,
        publishedAt: input.status === "PUBLISHED" ? existing.publishedAt ?? new Date() : existing.publishedAt,
      },
    });
    await prisma.adminAuditLog.create({ data: { adminId: session.user.id, action: "article.update", entityType: "Article", entityId: article.id, details: { oldSlug: existing.slug, slug: article.slug, previousStatus: existing.status, status: article.status }, ipAddress: clientIp(request) } });
    revalidateArticle(existing.slug);
    if (existing.slug !== article.slug) revalidateArticle(article.slug);
    return NextResponse.json({ ok: true, id: article.id });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return NextResponse.json({ error: "This article slug is already in use" }, { status: 409 });
    throw error;
  }
}

function clientIp(request: Request): string | undefined {
  return request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
}

function revalidateArticle(slug: string) {
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/sitemap-blog.xml");
  revalidatePath("/blog/feed.xml");
}
