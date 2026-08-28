import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@sbgg/db";
import { ArticleEditor, type ArticleEditorValue } from "@/components/article-editor";

export const metadata: Metadata = { title: "Admin · New article" };
export const dynamic = "force-dynamic";

export default async function NewArticlePage() {
  const authors = await prisma.articleAuthor.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });
  const initialValue: ArticleEditorValue = { authorId: authors[0]?.id ?? "", title: "", slug: "", excerpt: "", body: "", category: "Season Guide", tags: [], status: "DRAFT", featured: false, heroImageUrl: "", heroImageAlt: "", seoTitle: "", seoDescription: "", sourceLinks: [{ title: "", url: "" }] };
  return <div className="space-y-6"><div><Link href="/admin/articles" className="text-sm font-semibold text-brand-primary hover:underline">← Back to articles</Link><h1 className="mt-3 font-display text-3xl font-bold text-brand-text">New editorial article</h1></div>{authors.length ? <ArticleEditor initialValue={initialValue} authors={authors} /> : <div className="card border-brand-danger/30 bg-brand-danger/10 text-sm text-brand-danger">No editorial author exists. Run the production seed before creating an article.</div>}</div>;
}
