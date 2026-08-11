import type { Metadata } from "next";
import Link from "next/link";
import { SeoHubShell, Breadcrumbs } from "@/components/seo-shell";
import { Card } from "@/components/ui";
import { Prisma, prisma } from "@sbgg/db";

export const metadata: Metadata = {
  title: "NFL Stats — Leaders & Team Rankings",
  description: "NFL statistical leaders: passing, rushing, receiving and fantasy points.",
};

export const revalidate = 600;

type GameStat = Prisma.PlayerGameStatsGetPayload<{ include: { player: { include: { team: true } } } }>;

function LeaderTable({ title, rows, val, fmt }: { title: string; rows: GameStat[]; val: (s: GameStat) => number; fmt?: (n: number) => string }) {
  return (
    <Card className="overflow-hidden !p-0">
      <h2 className="bg-brand-surface px-4 py-2.5 font-display text-sm font-semibold text-brand-text">{title}</h2>
      <table className="w-full text-sm">
        <tbody className="divide-y divide-brand-border">
          {rows.map((s, i) => (
            <tr key={s.id} className="hover:bg-brand-surface">
              <td className="px-4 py-2 font-display text-sm font-bold text-brand-muted">{i + 1}</td>
              <td className="px-2 py-2">
                <Link href={`/nfl/players/${s.player.slug}`} className="font-medium text-brand-text hover:text-brand-primary">{s.player.name}</Link>
                <span className="ml-1.5 text-xs text-brand-muted">{s.player.team?.abbreviation}</span>
              </td>
              <td className="scoreboard-num px-4 py-2 text-right text-brand-primary">{fmt ? fmt(val(s)) : val(s)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

export default async function NflStatsPage() {
  const gameStats = await prisma.playerGameStats.findMany({ include: { player: { include: { team: true } } }, orderBy: { fantasyPoints: "desc" }, take: 60 });

  const passLeaders = [...gameStats].sort((a, b) => (b.passingYards ?? 0) - (a.passingYards ?? 0)).slice(0, 10);
  const rushLeaders = [...gameStats].sort((a, b) => (b.rushingYards ?? 0) - (a.rushingYards ?? 0)).slice(0, 10);
  const recLeaders = [...gameStats].sort((a, b) => (b.receivingYards ?? 0) - (a.receivingYards ?? 0)).slice(0, 10);
  const fantasyLeaders = [...gameStats].sort((a, b) => (b.fantasyPoints ?? 0) - (a.fantasyPoints ?? 0)).slice(0, 10);

  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "NFL", href: "/nfl" }, { label: "Stats" }]} />
      <SeoHubShell title="NFL Stats" description="Statistical leaders from genuine game data: passing, rushing, receiving and fantasy points.">
        <div className="grid gap-4 md:grid-cols-2">
          <LeaderTable title="Passing leaders" rows={passLeaders} val={(s) => s.passingYards ?? 0} fmt={(n) => `${n} yds`} />
          <LeaderTable title="Rushing leaders" rows={rushLeaders} val={(s) => s.rushingYards ?? 0} fmt={(n) => `${n} yds`} />
          <LeaderTable title="Receiving leaders" rows={recLeaders} val={(s) => s.receivingYards ?? 0} fmt={(n) => `${n} yds`} />
          <LeaderTable title="Fantasy leaders" rows={fantasyLeaders} val={(s) => s.fantasyPoints ?? 0} fmt={(n) => `${n.toFixed(1)} pts`} />
        </div>
        <p className="text-sm text-brand-muted">
          Team context: <Link href="/nfl/standings" className="text-brand-primary hover:underline">standings</Link> ·{" "}
          <Link href="/nfl/teams" className="text-brand-primary hover:underline">team pages</Link>
        </p>
      </SeoHubShell>
    </>
  );
}
