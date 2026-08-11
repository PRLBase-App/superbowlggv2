import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/article-card";
import { Breadcrumbs } from "@/components/seo-shell";
import { getPublishedAuthor, safeJsonLd } from "@/lib/articles";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const author = await getPublishedAuthor(slug);
  if (!author) return { title: "Author not found" };
  const url = `https://superbowl.gg/authors/${author.slug}`;
  return { title: `${author.name} — NFL Articles`, description: author.bio, alternates: { canonical: url }, openGraph: { title: author.name, description: author.bio, url } };
}

export default async function AuthorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const author = await getPublishedAuthor(slug);
  if (!author) notFound();
  const type = author.type === "PERSON" ? "Person" : "Organization";
  const schema = { "@context": "https://schema.org", "@type": type, name: author.name, description: author.bio, url: `https://superbowl.gg/authors/${author.slug}`, ...(author.websiteUrl ? { sameAs: [author.websiteUrl] } : {}) };
  return (
    <div className="space-y-9">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }} />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "NFL Analysis", href: "/blog" }, { label: author.name }]} />
      <header className="yardlines relative overflow-hidden rounded-[28px] bg-brand-nav p-7 text-white sm:p-10">
        <Image src="/logo.svg" alt="" width={150} height={150} className="absolute -bottom-7 right-6 opacity-10 brightness-0 invert" />
        <div className="relative flex max-w-4xl flex-col gap-5 sm:flex-row sm:items-center">
          <span className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white p-2 shadow-xl"><Image src={author.avatarUrl || "/logo.svg"} alt="" width={80} height={80} className="h-full w-full object-contain" /></span>
          <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#9dd3ff]">{author.type === "PERSON" ? "Author" : "Editorial team"}</p><h1 className="mt-2 font-display text-4xl font-bold text-white">{author.name}</h1>{author.role ? <p className="mt-2 text-sm font-semibold text-white/65">{author.role}</p> : null}<p className="mt-4 max-w-3xl text-sm leading-6 text-white/70">{author.bio}</p></div>
        </div>
      </header>
      <section><div className="mb-5"><p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-primary">Published work</p><h2 className="mt-2 font-display text-3xl font-bold text-brand-text">{author.articles.length} {author.articles.length === 1 ? "article" : "articles"}</h2></div><div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{author.articles.map((article) => <ArticleCard key={article.id} article={article} />)}</div></section>
      <p className="text-sm text-brand-muted">Looking for breaking reports from external publishers? Visit <Link href="/nfl/news" className="font-semibold text-brand-primary hover:underline">Latest NFL News</Link>.</p>
    </div>
  );
}
