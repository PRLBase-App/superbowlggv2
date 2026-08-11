import type { Metadata } from "next";
import Link from "next/link";
import { SeoHubShell, Breadcrumbs } from "@/components/seo-shell";
import { prisma } from "@sbgg/db";

export const metadata: Metadata = {
  title: "NFL Players — Stats, Game Logs & Props",
  description: "NFL player stats, game logs and injury status.",
};

export const revalidate = 600;

export default async function NflPlayersPage({ searchParams }: { searchParams: Promise<{ team?: string }> }) {
  const sp = await searchParams;
  const players = await prisma.player.findMany({
    where: sp.team ? { teamId: sp.team } : {},
    include: { team: true, _count: { select: { gameStats: true } } },
    orderBy: [{ position: "asc" }, { name: "asc" }],
    take: 200,
  });
  const teams = await prisma.team.findMany({ orderBy: { abbreviation: "asc" } });

  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "NFL", href: "/nfl" }, { label: "Players" }]} />
      <SeoHubShell title="NFL Players" description="Player profiles with game logs, stats and injury status.">
        <nav className="mb-4 flex flex-wrap gap-1.5" aria-label="Team filter">
          <Link href="/nfl/players" className={`tab ${!sp.team ? "tab-active" : ""}`}>All</Link>
          {teams.map((t) => (
            <Link key={t.id} href={`/nfl/players?team=${t.id}`} className={`tab ${sp.team === t.id ? "tab-active" : ""}`}>{t.abbreviation}</Link>
          ))}
        </nav>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {players.map((p) => (
            <Link key={p.id} href={`/nfl/players/${p.slug}`} className="card card-hover flex items-center justify-between !p-3">
              <div>
                <p className="text-sm font-semibold text-brand-text">{p.name}</p>
                <p className="text-xs text-brand-muted">{p.team?.abbreviation} · {p.position}</p>
              </div>
              <span className="badge bg-brand-surface2 text-brand-muted ring-1 ring-brand-border">{p._count.gameStats} games</span>
            </Link>
          ))}
        </div>
      </SeoHubShell>
    </>
  );
}
