import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SeoHubShell, Breadcrumbs } from "@/components/seo-shell";
import { Badge, Card, EmptyState } from "@/components/ui";
import { getPlayer } from "@/lib/data";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getPlayer(slug);
  if (!p) return { title: "Player not found" };
  return {
    title: `${p.name} — Stats, Game Log & Injury Status`,
    description: `${p.name} (${p.position}, ${p.team?.abbreviation ?? "FA"}): game log, season stats and injury status on Superbowl.gg.`,
    alternates: { canonical: `/nfl/players/${p.slug}` },
  };
}

export const revalidate = 600;

export default async function PlayerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const player = await getPlayer(slug);
  if (!player) notFound();

  const seasonTotals = player.gameStats.reduce(
    (acc, s) => ({
      passYards: acc.passYards + (s.passingYards ?? 0),
      passTds: acc.passTds + (s.passingTds ?? 0),
      rushYards: acc.rushYards + (s.rushingYards ?? 0),
      recYards: acc.recYards + (s.receivingYards ?? 0),
      recs: acc.recs + (s.receptions ?? 0),
      fantasy: acc.fantasy + (s.fantasyPoints ?? 0),
    }),
    { passYards: 0, passTds: 0, rushYards: 0, recYards: 0, recs: 0, fantasy: 0 },
  );

  const personSchema = { "@context": "https://schema.org", "@type": "Person", name: player.name, jobTitle: player.position ?? undefined, memberOf: player.team ? { "@type": "SportsTeam", name: player.team.name } : undefined };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "NFL", href: "/nfl" }, { label: "Players", href: "/nfl/players" }, { label: player.name }]} />
      <SeoHubShell title={player.name} description={`${player.position ?? "Player"} · ${player.team?.name ?? "Free agent"} · #${player.jerseyNumber ?? "—"}`}>
        <div className="grid gap-6 lg:grid-cols-3">
          <section className="lg:col-span-2">
            <h2 className="font-display mb-3 text-xl font-semibold">Game log</h2>
            {player.gameStats.length === 0 ? (
              <EmptyState title="No game stats yet" />
            ) : (
              <div className="overflow-hidden rounded-xl border border-brand-border">
                <table className="w-full text-sm">
                  <thead className="bg-brand-surface">
                    <tr>
                      <th className="table-head px-4 py-2.5">Game</th>
                      <th className="table-head px-3 py-2.5 text-right">Pass Yds</th>
                      <th className="table-head px-3 py-2.5 text-right">TD</th>
                      <th className="table-head px-3 py-2.5 text-right">INT</th>
                      <th className="table-head px-3 py-2.5 text-right">Rush Yds</th>
                      <th className="table-head px-3 py-2.5 text-right">Rec</th>
                      <th className="table-head px-3 py-2.5 text-right">FPTS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border">
                    {player.gameStats.map((s) => (
                      <tr key={s.id} className="hover:bg-brand-surface">
                        <td className="px-4 py-2.5">
                          <Link href={`/games/${s.gameId}`} className="text-brand-primary hover:underline">
                            {s.game.awayTeam.abbreviation} @ {s.game.homeTeam.abbreviation}
                          </Link>
                        </td>
                        <td className="scoreboard-num px-3 py-2.5 text-right">{s.passingYards}</td>
                        <td className="scoreboard-num px-3 py-2.5 text-right">{s.passingTds}</td>
                        <td className="scoreboard-num px-3 py-2.5 text-right">{s.interceptions}</td>
                        <td className="scoreboard-num px-3 py-2.5 text-right">{s.rushingYards}</td>
                        <td className="scoreboard-num px-3 py-2.5 text-right">{s.receptions}/{s.receivingYards}</td>
                        <td className="scoreboard-num px-3 py-2.5 text-right text-brand-gold">{s.fantasyPoints}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
          <aside className="space-y-6">
            <section>
              <h2 className="font-display mb-3 text-xl font-semibold">Season totals</h2>
              <Card>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-xs text-brand-muted">Passing</p><p className="scoreboard-num text-lg text-brand-text">{seasonTotals.passYards} yds / {seasonTotals.passTds} TD</p></div>
                  <div><p className="text-xs text-brand-muted">Rushing</p><p className="scoreboard-num text-lg text-brand-text">{seasonTotals.rushYards} yds</p></div>
                  <div><p className="text-xs text-brand-muted">Receiving</p><p className="scoreboard-num text-lg text-brand-text">{seasonTotals.recs} / {seasonTotals.recYards} yds</p></div>
                  <div><p className="text-xs text-brand-muted">Fantasy</p><p className="scoreboard-num text-lg text-brand-gold">{seasonTotals.fantasy.toFixed(1)} pts</p></div>
                </div>
              </Card>
            </section>
            {player.injuries.length ? (
              <section>
                <h2 className="font-display mb-3 text-xl font-semibold">Injury status</h2>
                {player.injuries.map((i) => (
                  <Card key={i.id} className="!p-3">
                    <div className="flex items-center justify-between">
                      <Badge tone={i.status === "OUT" ? "red" : "gold"}>{i.status}</Badge>
                      <span className="text-xs text-brand-muted">{i.bodyPart}</span>
                    </div>
                    <p className="mt-1 text-xs text-brand-muted">{i.description}</p>
                  </Card>
                ))}
              </section>
            ) : null}
          </aside>
        </div>
      </SeoHubShell>
    </>
  );
}
