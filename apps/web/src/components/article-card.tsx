import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock3 } from "lucide-react";
import type { ArticleWithAuthor } from "@/lib/articles";
import { articleReadingMinutes } from "@/lib/articles";

function categoryTheme(category: string): string {
  if (category.includes("Odds")) return "from-[#102f45] via-[#174f68] to-[#208b8e]";
  if (category.includes("Super Bowl")) return "from-[#4a2604] via-[#8f5308] to-[#c47a08]";
  if (category.includes("Injur")) return "from-[#401b27] via-[#7b2939] to-[#b84954]";
  if (category.includes("Stats")) return "from-[#17223f] via-[#293d74] to-[#3e7dd5]";
  if (category.includes("Playoff")) return "from-[#251b47] via-[#44327b] to-[#6d52b5]";
  return "from-[#131520] via-[#173a4b] to-[#208b8e]";
}

export function ArticleCard({ article, featured = false }: { article: ArticleWithAuthor; featured?: boolean }) {
  const published = article.publishedAt ?? article.createdAt;
  return (
    <article className={`card card-hover group overflow-hidden !p-0 ${featured ? "md:grid md:grid-cols-[0.78fr_1.22fr]" : ""}`}>
      <Link href={`/blog/${article.slug}`} className={`relative flex min-h-44 items-end overflow-hidden bg-gradient-to-br p-5 ${categoryTheme(article.category)} ${featured ? "md:min-h-72" : ""}`} aria-label={`Read ${article.title}`}>
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full border border-white/10" />
        <div className="absolute right-5 top-5 opacity-20 transition duration-300 group-hover:scale-110 group-hover:opacity-30">
          <Image src="/logo.svg" alt="" width={92} height={92} className="h-20 w-20 object-contain brightness-0 invert" />
        </div>
        <span className="relative rounded-full border border-white/15 bg-black/20 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-white backdrop-blur">{article.category}</span>
      </Link>
      <div className={`flex flex-col p-5 ${featured ? "justify-center md:p-8" : ""}`}>
        <div className="flex flex-wrap items-center gap-3 text-xs text-brand-muted">
          <time dateTime={published.toISOString()}>{published.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</time>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" /> {articleReadingMinutes(article.body)} min read</span>
        </div>
        <h2 className={`mt-3 font-display font-bold leading-tight text-brand-text ${featured ? "text-2xl sm:text-3xl" : "text-xl"}`}>
          <Link href={`/blog/${article.slug}`} className="transition-colors hover:text-brand-primary">{article.title}</Link>
        </h2>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-brand-muted">{article.excerpt}</p>
        <div className="mt-5 flex items-center justify-between gap-3 border-t border-brand-border pt-4">
          <Link href={`/authors/${article.author.slug}`} className="text-xs font-semibold text-brand-muted hover:text-brand-primary">By {article.author.name}</Link>
          <Link href={`/blog/${article.slug}`} className="inline-flex items-center gap-1 text-sm font-bold text-brand-primary">Read analysis <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></Link>
        </div>
      </div>
    </article>
  );
}
