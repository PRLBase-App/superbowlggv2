import type { Metadata } from "next";
import Link from "next/link";
import { FilePlus2 } from "lucide-react";
import { prisma } from "@sbgg/db";
import { Badge, EmptyState } from "@/components/ui";
import { articleWordCount } from "@/lib/articles";

export const metadata: Metadata = { title: "Admin · Articles" };
export const dynamic = "force-dynamic";

export default async function AdminArticlesPage() {
  const [articles, counts] = await Promise.all([
    prisma.article.findMany({ include: { author: true }, orderBy: { updatedAt: "desc" } }),
    prisma.article.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);
  const count = (status: "DRAFT" | "PUBLISHED" | "ARCHIVED") => counts.find((item) => item.status === status)?._count._all ?? 0;
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="font-display text-3xl font-bold text-brand-text">Editorial articles</h1><p className="mt-1 text-sm text-brand-muted">Write, review and publish original NFL analysis backed by named sources.</p></div><Link href="/admin/articles/new" className="btn-primary"><FilePlus2 className="h-4 w-4" /> New article</Link></div>
      <div className="grid gap-3 sm:grid-cols-3"><Stat label="Published" value={count("PUBLISHED")} tone="text-brand-success" /><Stat label="Drafts" value={count("DRAFT")} tone="text-brand-primary" /><Stat label="Archived" value={count("ARCHIVED")} tone="text-brand-muted" /></div>
      {articles.length ? <div className="overflow-x-auto rounded-xl border border-brand-border bg-white"><table className="w-full text-sm"><thead className="bg-brand-surface2"><tr><th className="table-head px-4 py-3">Article</th><th className="table-head px-4 py-3">Category</th><th className="table-head px-4 py-3">Byline</th><th className="table-head px-4 py-3">Status</th><th className="table-head px-4 py-3 text-right">Updated</th><th className="table-head px-4 py-3"><span className="sr-only">Actions</span></th></tr></thead><tbody className="divide-y divide-brand-border">{articles.map((article) => <tr key={article.id} className="hover:bg-brand-surface2"><td className="max-w-lg px-4 py-3"><Link href={`/admin/articles/${article.id}`} className="font-semibold text-brand-text hover:text-brand-primary">{article.title}</Link><p className="mt-1 text-xs text-brand-muted">/blog/{article.slug} · {articleWordCount(article.body)} words</p></td><td className="whitespace-nowrap px-4 py-3 text-brand-muted">{article.category}</td><td className="whitespace-nowrap px-4 py-3 text-brand-muted">{article.author.name}</td><td className="px-4 py-3"><Badge tone={article.status === "PUBLISHED" ? "green" : article.status === "DRAFT" ? "blue" : "slate"}>{article.status}</Badge></td><td className="whitespace-nowrap px-4 py-3 text-right text-brand-muted">{article.updatedAt.toLocaleDateString("en-US")}</td><td className="px-4 py-3"><Link href={`/admin/articles/${article.id}`} className="btn-secondary !px-3 !py-1.5">Edit</Link></td></tr>)}</tbody></table></div> : <EmptyState title="No articles yet" body="Create the first source-backed editorial article." />}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: string }) {
  return <div className="card"><p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-muted">{label}</p><p className={`scoreboard-num mt-2 text-3xl ${tone}`}>{value}</p></div>;
}
