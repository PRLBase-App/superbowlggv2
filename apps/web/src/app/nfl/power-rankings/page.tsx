import type { Metadata } from "next";
import Link from "next/link";
import { SeoHubShell, Breadcrumbs } from "@/components/seo-shell";
import { TeamBadge } from "@/components/ui";
import { getStandings } from "@/lib/data";

export const metadata: Metadata = {
  title: "NFL Power Rankings",
  description: "Superbowl.gg NFL power rankings, computed from standings, point differential and recent form.",
};

export const revalidate = 600;

export default async function NflPowerRankingsPage() {
  const standings = await getStandings();
  // simple transparent model: wins, then point differential
  const ranked = [...standings]
    .map((s) => ({ ...s, diff: s.pointsFor - s.pointsAgainst }))
    .sort((a, b) => (b.wins - b.losses) - (a.wins - a.losses) || b.diff - a.diff);

  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "NFL", href: "/nfl" }, { label: "Power Rankings" }]} />
      <SeoHubShell title="NFL Power Rankings" description="A transparent power ranking: win percentage first, point differential second. Updated as games settle.">
        <div className="space-y-2">
          {ranked.map((s, i) => (
            <Link key={s.id} href={`/nfl/teams/${s.team.slug}`} className="card card-hover flex items-center justify-between !p-3">
              <div className="flex items-center gap-3">
                <span className={`font-display w-8 text-lg font-bold ${i < 8 ? "text-brand-primary" : "text-brand-muted"}`}>{i + 1}</span>
                <TeamBadge abbr={s.team.abbreviation} color={s.team.primaryColor} logoUrl={s.team.logoUrl} size="sm" />
                <span className="text-sm font-medium text-brand-text">{s.team.name}</span>
              </div>
              <div className="text-right text-xs text-brand-muted">
                <p className="scoreboard-num text-sm font-bold text-brand-text">{s.wins}-{s.losses}{s.ties ? `-${s.ties}` : ""}</p>
                <p>±{s.diff}</p>
              </div>
            </Link>
          ))}
        </div>
      </SeoHubShell>
    </>
  );
}
