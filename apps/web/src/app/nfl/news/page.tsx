import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs, SeoHubShell } from "@/components/seo-shell";
import { EmptyState } from "@/components/ui";
import { NewsCard } from "@/components/news-card";
import { getNews, getNewsCount } from "@/lib/data";

export const metadata: Metadata = {
  title: "Latest NFL News & 2026 Season Updates",
  description: "Read current NFL headlines and reporting for the 2026 season, with clear source attribution and direct links to every original ESPN article.",
};

export const revalidate = 300;
const PAGE_SIZE = 12;

export default async function NflNewsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const params = await searchParams;
  const requestedPage = Number(params.page ?? 1);
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? Math.min(requestedPage, 100) : 1;
  const [items, total] = await Promise.all([getNews(PAGE_SIZE, (page - 1) * PAGE_SIZE), getNewsCount()]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "NFL", href: "/nfl" }, { label: "News" }]} />
      <SeoHubShell title="Latest NFL News" description="Current reporting for the 2026 NFL season, training camp, roster decisions, injuries and the developing race toward Super Bowl LXI.">
        {items.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{items.map((item) => <NewsCard key={item.id} item={item} />)}</div> : <EmptyState title="NFL news is synchronizing" body="The page only publishes genuine feed items. Check again after the worker completes its first ESPN RSS sync." />}

        {totalPages > 1 ? <nav aria-label="NFL news pages" className="flex items-center justify-center gap-3">
          {page > 1 ? <Link href={page === 2 ? "/nfl/news" : `/nfl/news?page=${page - 1}`} className="btn-secondary">Newer NFL reports</Link> : null}
          <span className="text-sm text-brand-muted">Page {page} of {totalPages}</span>
          {page < totalPages ? <Link href={`/nfl/news?page=${page + 1}`} className="btn-secondary">Older NFL reports</Link> : null}
        </nav> : null}

        <section className="grid gap-6 rounded-2xl border border-brand-border bg-brand-surface p-6 lg:grid-cols-2">
          <div><h2 className="font-display text-2xl font-semibold normal-case text-brand-text">News that stays connected to the season</h2><p className="mt-3 text-sm leading-7 text-brand-muted">The news board complements the schedule, scores and community predictions instead of replacing original journalism. Every headline and summary is supplied by ESPN, every card names the source, and every click opens the original article on ESPN. Superbowl.gg does not republish full stories.</p></div>
          <div><h2 className="font-display text-2xl font-semibold normal-case text-brand-text">How visual team matching works</h2><p className="mt-3 text-sm leading-7 text-brand-muted">When a feed item clearly names an NFL team, its official team mark helps readers identify the subject quickly. If no team can be matched with confidence, the card uses the publisher image supplied by the RSS feed. A logo is never used to imply sponsorship or endorsement.</p></div>
        </section>

        <p className="text-center text-xs text-brand-muted">Headlines and excerpts provided by ESPN through its syndicated NFL RSS feed. All story rights remain with ESPN and the named authors.</p>
      </SeoHubShell>
    </>
  );
}
