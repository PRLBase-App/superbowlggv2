import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@sbgg/db";
import { ArticleEditor, type ArticleEditorValue } from "@/components/article-editor";
import { articleSources } from "@/lib/articles";

export const metadata: Metadata = { title: "Admin · Edit article" };
export const dynamic = "force-dynamic";

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [article, authors] = await Promise.all([
    prisma.article.findUnique({ where: { id } }),
    prisma.articleAuthor.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!article) notFound();
  const initialValue: ArticleEditorValue = { id: article.id, authorId: article.authorId, title: article.title, slug: article.slug, excerpt: article.excerpt, body: article.body, category: article.category, tags: article.tags, status: article.status, featured: article.featured, heroImageUrl: article.heroImageUrl ?? "", heroImageAlt: article.heroImageAlt ?? "", seoTitle: article.seoTitle ?? "", seoDescription: article.seoDescription ?? "", sourceLinks: articleSources(article.sourceLinks) };
  return <div className="space-y-6"><div className="flex flex-wrap items-end justify-between gap-3"><div><Link href="/admin/articles" className="text-sm font-semibold text-brand-primary hover:underline">← Back to articles</Link><h1 className="mt-3 font-display text-3xl font-bold text-brand-text">Edit article</h1></div>{article.status === "PUBLISHED" ? <Link href={`/blog/${article.slug}`} target="_blank" className="btn-secondary">Open public article ↗</Link> : null}</div><ArticleEditor initialValue={initialValue} authors={authors} /></div>;
}
