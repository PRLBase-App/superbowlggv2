import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpenCheck, Database, FileCheck2, Rss } from "lucide-react";
import { ArticleCard } from "@/components/article-card";
import { EmptyState } from "@/components/ui";
import { getArticleCategories, getPublishedArticles, safeJsonLd } from "@/lib/articles";

export const metadata: Metadata = {
  title: "NFL Analysis, Guides and Super Bowl Research",
  description: "Original, source-backed NFL analysis from Superbowl.gg: 2026 season guides, matchup context, stats education, playoff rules and Super Bowl history.",
  alternates: {
    canonical: "https://superbowl.gg/blog",
    types: { "application/rss+xml": "https://superbowl.gg/blog/feed.xml" },
  },
  openGraph: {
    type: "website",
    url: "https://superbowl.gg/blog",
    title: "NFL Analysis, Guides and Super Bowl Research",
    description: "Original NFL research with named sources, transparent methodology and useful season context.",
  },
};

export const revalidate = 300;

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ page?: string; category?: string }> }) {
  const params = await searchParams;
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const category = params.category?.trim().slice(0, 60) || undefined;
  const [{ articles, total, pages }, categories] = await Promise.all([
    getPublishedArticles({ page, limit: 9, category }),
    getArticleCategories(),
  ]);
  const featured = !category && page === 1 ? articles[0] : undefined;
  const remaining = featured ? articles.slice(1) : articles;
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Superbowl.gg NFL Analysis",
    url: "https://superbowl.gg/blog",
    description: metadata.description,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: articles.length,
      itemListElement: articles.map((article, index) => ({
        "@type": "ListItem",
        position: (page - 1) * 9 + index + 1,
        url: `https://superbowl.gg/blog/${article.slug}`,
        name: article.title,
      })),
    },
  };

  return (
    <div className="space-y-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(collectionJsonLd) }} />
      <section className="yardlines relative overflow-hidden rounded-[28px] bg-brand-nav px-6 py-12 text-white shadow-[0_24px_70px_rgba(19,21,32,0.18)] sm:px-10 lg:px-14 lg:py-16">
        <div className="absolute -right-20 -top-24 h-80 w-80 rounded-full border border-white/10" />
        <Image src="/logo.svg" alt="" width={220} height={220} className="absolute bottom-[-55px] right-6 hidden opacity-10 brightness-0 invert md:block" />
        <div className="relative max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[#9dd3ff]"><BookOpenCheck className="h-4 w-4" /> Superbowl.gg Editorial</span>
          <h1 className="mt-5 font-display text-4xl font-bold leading-tight sm:text-6xl">NFL analysis built to be checked.</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-white/70 sm:text-lg">Original season guides, market education, statistical context and Super Bowl research. Facts are linked to identifiable sources; interpretation stays labeled as interpretation.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="#latest-analysis" className="btn-primary">Explore {total} articles <ArrowRight className="h-4 w-4" /></Link>
            <Link href="/blog/feed.xml" className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10"><Rss className="h-4 w-4" /> Follow via RSS</Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="editorial-standard" className="grid gap-4 md:grid-cols-3">
        {[
          { icon: FileCheck2, title: "Original editorial work", body: "Our guides are written for Superbowl.gg. Syndicated headlines remain in the separate NFL News section." },
          { icon: Database, title: "Source-backed facts", body: "Schedules, rules, statistics and historical markets point to the official or identified dataset used." },
          { icon: BookOpenCheck, title: "Clear uncertainty", body: "Analysis never invents a matchup, injury, line or result—and no prediction is presented as guaranteed." },
        ].map((item) => {
          const Icon = item.icon;
          return <div key={item.title} className="card"><Icon className="h-6 w-6 text-brand-primary" /><h2 id={item.title === "Original editorial work" ? "editorial-standard" : undefined} className="mt-4 font-display text-lg font-semibold text-brand-text">{item.title}</h2><p className="mt-2 text-sm leading-6 text-brand-muted">{item.body}</p></div>;
        })}
      </section>

      <section id="latest-analysis" className="scroll-mt-28 space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-primary">Research library</p><h2 className="mt-2 font-display text-3xl font-bold text-brand-text">{category ? category : "Latest NFL analysis"}</h2><p className="mt-2 text-sm text-brand-muted">{total} source-backed {total === 1 ? "article" : "articles"}{category ? " in this topic" : " and growing"}.</p></div>
          <nav aria-label="Filter articles by category" className="flex flex-wrap gap-2">
            <Link href="/blog#latest-analysis" className={`tab ring-1 ${!category ? "tab-active ring-brand-primary/20" : "bg-brand-surface ring-brand-border"}`}>All topics</Link>
            {categories.map((item) => <Link key={item.category} href={`/blog?category=${encodeURIComponent(item.category)}#latest-analysis`} className={`tab ring-1 ${category?.toLowerCase() === item.category.toLowerCase() ? "tab-active ring-brand-primary/20" : "bg-brand-surface ring-brand-border"}`}>{item.category} <span className="text-xs opacity-60">{item.count}</span></Link>)}
          </nav>
        </div>

        {featured ? <ArticleCard article={featured} featured /> : null}
        {remaining.length ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{remaining.map((article) => <ArticleCard key={article.id} article={article} />)}</div> : null}
        {!articles.length ? <EmptyState title="No published analysis in this topic" body="Choose another category or return to all articles." /> : null}

        {pages > 1 ? (
          <nav aria-label="Article pages" className="flex items-center justify-center gap-2 pt-4">
            {page > 1 ? <Link href={blogPageHref(page - 1, category)} className="btn-secondary">Previous</Link> : null}
            <span className="px-3 text-sm text-brand-muted">Page {Math.min(page, pages)} of {pages}</span>
            {page < pages ? <Link href={blogPageHref(page + 1, category)} className="btn-secondary">Next</Link> : null}
          </nav>
        ) : null}
      </section>

      <section className="rounded-[28px] border border-brand-border bg-brand-surface p-7 shadow-sm lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
          <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-primary">How to use this library</p><h2 className="mt-3 font-display text-3xl font-bold text-brand-text">Stable guides meet live NFL data</h2></div>
          <div className="space-y-4 text-[15px] leading-7 text-brand-muted">
            <p>An article explains the stable background: how the schedule works, what a point spread means, which tiebreaker comes next or how to interpret a practice report. Information that can change by the hour belongs on the corresponding live page. That is why guides link directly to the current <Link href="/nfl/schedule" className="font-semibold text-brand-primary hover:underline">schedule</Link>, <Link href="/nfl/injuries" className="font-semibold text-brand-primary hover:underline">injury feed</Link>, <Link href="/nfl/stats" className="font-semibold text-brand-primary hover:underline">statistics</Link> and <Link href="/nfl/odds" className="font-semibold text-brand-primary hover:underline">provider odds</Link>.</p>
            <p>Publication dates and modification dates remain visible. Each article identifies its editorial byline and lists the sources used for factual claims. When data providers disagree, the methodology and timestamp matter more than hiding the difference behind a single unexplained number.</p>
            <p>For breaking reports from external publishers, visit <Link href="/nfl/news" className="font-semibold text-brand-primary hover:underline">Latest NFL News</Link>. For original Superbowl.gg explanation and analysis, stay here. Keeping the two formats separate makes attribution clearer for readers and search engines alike.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function blogPageHref(page: number, category?: string): string {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (category) params.set("category", category);
  return `/blog${params.size ? `?${params}` : ""}#latest-analysis`;
}
