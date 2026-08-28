import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock3, ExternalLink, FileCheck2, ShieldAlert } from "lucide-react";
import { ArticleCard } from "@/components/article-card";
import { ArticleContent } from "@/components/article-content";
import { Breadcrumbs } from "@/components/seo-shell";
import { Badge } from "@/components/ui";
import { articleHeadings, articleReadingMinutes, articleSources, articleWordCount, getPublishedArticle, getRelatedArticles, safeJsonLd } from "@/lib/articles";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublishedArticle(slug);
  if (!article) return { title: "Article not found" };
  const title = article.seoTitle || article.title;
  const description = article.seoDescription || article.excerpt;
  const url = `https://superbowl.gg/blog/${article.slug}`;
  return {
    title,
    description,
    keywords: article.tags,
    authors: [{ name: article.author.name, url: `https://superbowl.gg/authors/${article.author.slug}` }],
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title,
      description,
      publishedTime: article.publishedAt?.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      authors: [`https://superbowl.gg/authors/${article.author.slug}`],
      tags: article.tags,
      ...(article.heroImageUrl ? { images: [{ url: article.heroImageUrl, alt: article.heroImageAlt || article.title }] } : {}),
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getPublishedArticle(slug);
  if (!article) notFound();
  const [related] = await Promise.all([getRelatedArticles(article)]);
  const sources = articleSources(article.sourceLinks);
  const headings = articleHeadings(article.body);
  const published = article.publishedAt ?? article.createdAt;
  const canonical = `https://superbowl.gg/blog/${article.slug}`;
  const authorType = article.author.type === "PERSON" ? "Person" : "Organization";
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    url: canonical,
    mainEntityOfPage: canonical,
    datePublished: published.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    isAccessibleForFree: true,
    articleSection: article.category,
    keywords: article.tags.join(", "),
    wordCount: articleWordCount(article.body),
    author: { "@type": authorType, name: article.author.name, url: `https://superbowl.gg/authors/${article.author.slug}` },
    publisher: { "@type": "Organization", name: "Superbowl.gg", url: "https://superbowl.gg", logo: { "@type": "ImageObject", url: "https://superbowl.gg/android-chrome-512x512.png" } },
    image: article.heroImageUrl || "https://superbowl.gg/opengraph-image",
    citation: sources.map((source) => source.url),
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://superbowl.gg" },
      { "@type": "ListItem", position: 2, name: "NFL Analysis", item: "https://superbowl.gg/blog" },
      { "@type": "ListItem", position: 3, name: article.title, item: canonical },
    ],
  };
  const oddsEducation = /odds|spread|moneyline|market/i.test(`${article.category} ${article.title}`);

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd) }} />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "NFL Analysis", href: "/blog" }, { label: article.category }]} />

      <article>
        <header className="yardlines relative overflow-hidden rounded-[28px] bg-brand-nav px-6 py-10 text-white shadow-[0_24px_70px_rgba(19,21,32,0.18)] sm:px-10 lg:px-14 lg:py-14">
          {article.heroImageUrl ? <div role="img" aria-label={article.heroImageAlt || article.title} className="absolute inset-0 bg-cover bg-center opacity-25" style={{ backgroundImage: `url(${JSON.stringify(article.heroImageUrl).slice(1, -1)})` }} /> : null}
          <div className="absolute inset-0 bg-gradient-to-r from-brand-nav via-brand-nav/95 to-brand-nav/55" />
          <Image src="/logo.svg" alt="" width={190} height={190} className="absolute -bottom-10 right-5 hidden opacity-10 brightness-0 invert md:block" />
          <div className="relative max-w-4xl">
            <Link href={`/blog?category=${encodeURIComponent(article.category)}`} className="inline-flex"><Badge tone="blue">{article.category}</Badge></Link>
            <h1 className="mt-5 font-display text-3xl font-bold leading-[1.12] text-white sm:text-5xl lg:text-6xl">{article.title}</h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-white/70 sm:text-lg">{article.excerpt}</p>
            <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/60">
              <span>By <Link href={`/authors/${article.author.slug}`} className="font-semibold text-white hover:text-[#9dd3ff]">{article.author.name}</Link></span>
              <span aria-hidden>·</span>
              <time dateTime={published.toISOString()}>{published.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</time>
              <span aria-hidden>·</span>
              <span className="inline-flex items-center gap-1"><Clock3 className="h-4 w-4" /> {articleReadingMinutes(article.body)} min read</span>
            </div>
          </div>
        </header>

        <div className="mx-auto mt-8 grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,760px)_270px] lg:items-start">
          <div className="min-w-0 rounded-[24px] border border-brand-border bg-brand-surface px-5 py-7 shadow-sm sm:px-9 sm:py-10">
            <ArticleContent body={article.body} />

            {oddsEducation ? (
              <aside className="mt-10 rounded-2xl border border-brand-warning/30 bg-brand-warning/10 p-5 text-sm leading-6 text-brand-text">
                <div className="flex items-start gap-3"><ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" /><div><p className="font-bold">Odds education, not betting advice</p><p className="mt-1 text-amber-900/80">Superbowl.gg does not accept real-money wagers. Markets can move and outcomes are uncertain. If you choose to gamble elsewhere, use licensed services, set limits and visit our <Link href="/responsible-gaming" className="font-semibold underline">responsible gaming resources</Link>.</p></div></div>
              </aside>
            ) : null}

            {sources.length ? (
              <section className="mt-10 border-t border-brand-border pt-8" aria-labelledby="article-sources">
                <div className="flex items-center gap-2"><FileCheck2 className="h-5 w-5 text-brand-primary" /><h2 id="article-sources" className="font-display text-xl font-bold text-brand-text">Sources and further reading</h2></div>
                <p className="mt-2 text-sm leading-6 text-brand-muted">These links support factual details or explain the datasets referenced above. Interpretation and wording are original to Superbowl.gg.</p>
                <ul className="mt-4 space-y-2">{sources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-2 text-sm font-semibold text-brand-primary hover:underline"><ExternalLink className="mt-0.5 h-4 w-4 shrink-0" />{source.title}</a></li>)}</ul>
              </section>
            ) : null}

            <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-brand-border pt-6 text-sm text-brand-muted">
              <p>Last reviewed <time dateTime={article.updatedAt.toISOString()}>{article.updatedAt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</time>.</p>
              <Link href="/blog" className="inline-flex items-center gap-2 font-bold text-brand-primary"><ArrowLeft className="h-4 w-4" /> All NFL analysis</Link>
            </footer>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-28">
            {headings.length ? <nav className="card" aria-label="Article contents"><p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-muted">In this guide</p><ol className="mt-3 space-y-2">{headings.map((heading, index) => <li key={heading.id}><a href={`#${heading.id}`} className="flex gap-2 text-sm leading-5 text-brand-muted transition hover:text-brand-primary"><span className="font-mono text-xs text-brand-primary/70">{String(index + 1).padStart(2, "0")}</span>{heading.label}</a></li>)}</ol></nav> : null}
            <div className="card"><p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-muted">Editorial byline</p><Link href={`/authors/${article.author.slug}`} className="mt-3 block font-display text-lg font-bold text-brand-text hover:text-brand-primary">{article.author.name}</Link>{article.author.role ? <p className="mt-1 text-xs font-semibold text-brand-primary">{article.author.role}</p> : null}<p className="mt-3 text-sm leading-6 text-brand-muted">{article.author.bio}</p></div>
          </aside>
        </div>
      </article>

      {related.length ? <section className="mt-12"><div className="mb-5 flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-primary">Continue reading</p><h2 className="mt-2 font-display text-3xl font-bold text-brand-text">Related NFL analysis</h2></div><Link href="/blog" className="hidden text-sm font-bold text-brand-primary hover:underline sm:block">View all articles</Link></div><div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{related.map((item) => <ArticleCard key={item.id} article={item} />)}</div></section> : null}
    </div>
  );
}
