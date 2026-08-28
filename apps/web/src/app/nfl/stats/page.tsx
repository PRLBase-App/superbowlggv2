import Image from "next/image";
import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, Database, TimerReset } from "lucide-react";
import { Breadcrumbs, SeoHubShell } from "@/components/seo-shell";
import { Card, EmptyState } from "@/components/ui";
import { getSeason } from "@/lib/data";
import { currentNflSeasonYear } from "@/lib/season";
import { prisma } from "@sbgg/db";

export const metadata: Metadata = {
  title: "2026 NFL Stats & Player Leaders",
  description: "Current 2026 NFL statistical leaders aggregated from genuine regular-season game data: passing, rushing, receiving and fantasy points.",
};

export const revalidate = 600;

type LeaderRow = {
  playerId: string;
  slug: string;
  name: string;
  position: string | null;
  headshotUrl: string | null;
  team: { abbreviation: string; logoUrl: string | null } | null;
  games: number;
  passingYards: number;
  rushingYards: number;
  receivingYards: number;
  fantasyPoints: number;
};

function LeaderTable({ title, rows, value, format }: { title: string; rows: LeaderRow[]; value: (row: LeaderRow) => number; format: (number: number) => string }) {
  return (
    <Card className="overflow-hidden !p-0">
      <div className="flex items-center justify-between border-b border-brand-border bg-brand-surface2 px-4 py-3"><h2 className="font-display text-base font-semibold normal-case text-brand-text">{title}</h2><BarChart3 className="h-4 w-4 text-brand-primary" /></div>
      {rows.length ? <table className="w-full text-sm"><thead><tr className="border-b border-brand-border text-left text-[10px] font-bold uppercase tracking-wider text-brand-muted"><th className="px-4 py-2">Rank</th><th className="px-2 py-2">Player</th><th className="px-4 py-2 text-right">Total</th></tr></thead><tbody className="divide-y divide-brand-border">{rows.map((row, index) => (
        <tr key={row.playerId} className="transition hover:bg-brand-surface2">
          <td className="px-4 py-3 font-display font-bold text-brand-muted">{index + 1}</td>
          <td className="px-2 py-3"><div className="flex items-center gap-2.5">{row.headshotUrl ? <Image src={row.headshotUrl} alt="" width={36} height={36} className="h-9 w-9 rounded-xl bg-brand-surface2 object-cover" /> : <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary/10 text-xs font-bold text-brand-primary">{row.position ?? "NFL"}</span>}<div><Link href={`/nfl/players/${row.slug}`} className="font-semibold text-brand-text hover:text-brand-primary">{row.name}</Link><p className="text-[11px] text-brand-muted">{row.team?.abbreviation ?? "NFL"} · {row.games} game{row.games === 1 ? "" : "s"}</p></div></div></td>
          <td className="scoreboard-num px-4 py-3 text-right font-bold text-brand-primary">{format(value(row))}</td>
        </tr>
      ))}</tbody></table> : <div className="p-5 text-sm leading-6 text-brand-muted">No qualifying 2026 regular-season statistics are available yet.</div>}
    </Card>
  );
}

export default async function NflStatsPage() {
  const currentYear = currentNflSeasonYear();
  const season = await getSeason();
  const [gameStats, latestSync] = await Promise.all([
    season ? prisma.playerGameStats.findMany({
      where: { game: { seasonId: season.id, seasonType: "REGULAR", status: "FINAL" } },
      include: { player: { include: { team: true } } },
    }) : [],
    prisma.integrationSyncLog.findFirst({ where: { jobType: "SYNC_LIVE_GAMES", status: "SUCCESS" }, orderBy: { finishedAt: "desc" }, select: { finishedAt: true, provider: true } }),
  ]);

  const totals = new Map<string, LeaderRow>();
  for (const stat of gameStats) {
    const existing = totals.get(stat.playerId) ?? {
      playerId: stat.playerId,
      slug: stat.player.slug,
      name: stat.player.name,
      position: stat.player.position,
      headshotUrl: stat.player.headshotUrl,
      team: stat.player.team ? { abbreviation: stat.player.team.abbreviation, logoUrl: stat.player.team.logoUrl } : null,
      games: 0,
      passingYards: 0,
      rushingYards: 0,
      receivingYards: 0,
      fantasyPoints: 0,
    };
    existing.games++;
    existing.passingYards += stat.passingYards ?? 0;
    existing.rushingYards += stat.rushingYards ?? 0;
    existing.receivingYards += stat.receivingYards ?? 0;
    existing.fantasyPoints += stat.fantasyPoints ?? 0;
    totals.set(stat.playerId, existing);
  }
  const all = [...totals.values()];
  const top = (key: keyof Pick<LeaderRow, "passingYards" | "rushingYards" | "receivingYards" | "fantasyPoints">) => [...all].filter((row) => row[key] > 0).sort((left, right) => right[key] - left[key]).slice(0, 10);

  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "NFL", href: "/nfl" }, { label: "2026 stats" }]} />
      <SeoHubShell title={`${currentYear} NFL Stats`} description="Season totals calculated from genuine completed regular-season games. Historical game rows are excluded from every current leaderboard.">
        <div className="grid gap-3 sm:grid-cols-3">
          <Card className="flex items-center gap-3"><Database className="h-6 w-6 text-brand-primary" /><div><p className="scoreboard-num text-xl text-brand-text">{gameStats.length.toLocaleString()}</p><p className="text-xs text-brand-muted">player-game stat lines</p></div></Card>
          <Card className="flex items-center gap-3"><BarChart3 className="h-6 w-6 text-brand-secondary" /><div><p className="scoreboard-num text-xl text-brand-text">{all.length.toLocaleString()}</p><p className="text-xs text-brand-muted">qualifying players</p></div></Card>
          <Card className="flex items-center gap-3"><TimerReset className="h-6 w-6 text-brand-gold" /><div><p className="text-sm font-bold text-brand-text">{latestSync?.finishedAt ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(latestSync.finishedAt) : "Awaiting first sync"}</p><p className="text-xs text-brand-muted">latest provider update</p></div></Card>
        </div>

        {!season || gameStats.length === 0 ? <EmptyState title={`${currentYear} regular-season leaders will appear after Week 1`} body="The page intentionally stays empty before genuine current-season statistics exist. No historical game is relabeled or reused as a current result." /> : null}

        <div className="grid gap-4 md:grid-cols-2">
          <LeaderTable title="Passing yard leaders" rows={top("passingYards")} value={(row) => row.passingYards} format={(number) => `${number.toLocaleString()} yds`} />
          <LeaderTable title="Rushing yard leaders" rows={top("rushingYards")} value={(row) => row.rushingYards} format={(number) => `${number.toLocaleString()} yds`} />
          <LeaderTable title="Receiving yard leaders" rows={top("receivingYards")} value={(row) => row.receivingYards} format={(number) => `${number.toLocaleString()} yds`} />
          <LeaderTable title="Fantasy point leaders" rows={top("fantasyPoints")} value={(row) => row.fantasyPoints} format={(number) => `${number.toFixed(1)} pts`} />
        </div>

        <section className="rounded-2xl border border-brand-border bg-brand-surface p-6"><h2 className="font-display text-2xl font-semibold normal-case text-brand-text">How these 2026 leaderboards are calculated</h2><p className="mt-3 max-w-4xl text-sm leading-7 text-brand-muted">Each player&apos;s passing, rushing, receiving and fantasy totals are summed across completed 2026 regular-season games. The table does not rank single-game performances, mix preseason production into regular-season totals or pull rows from a historical archive. Corrections from the upstream dataset are reflected after the next synchronization.</p><p className="mt-3 text-sm text-brand-muted">Explore <Link href="/nfl/standings" className="font-semibold text-brand-primary hover:underline">current team records</Link> or visit the <Link href="/nfl/players" className="font-semibold text-brand-primary hover:underline">NFL player directory</Link> for individual profiles.</p></section>
      </SeoHubShell>
    </>
  );
}
