import type { Metadata } from "next";
import Link from "next/link";
import { getGames, getSeason } from "@/lib/data";
import { Badge, SectionTitle, TeamBadge, EmptyState } from "@/components/ui";
import { kickoffDisplay, gameStatusLabel } from "@sbgg/core";
import type { GameStatus } from "@sbgg/db";

export const metadata: Metadata = {
  title: "NFL Games, Odds & Schedule",
  description: "Browse every NFL game: schedule, live scores, odds and community predictions.",
};

export const revalidate = 60;

export default async function GamesPage({ searchParams }: { searchParams: Promise<{ week?: string; status?: string }> }) {
  const sp = await searchParams;
  const week = sp.week ? Number(sp.week) : undefined;
  const allowedStatuses: GameStatus[] = ["SCHEDULED", "LIVE", "FINAL", "POSTPONED", "CANCELLED", "SUSPENDED"];
  const status = allowedStatuses.find((candidate) => candidate === sp.status);
  const season = await getSeason();
  const games = await getGames({ week, status, limit: 100 });

  const weeks = Array.from({ length: Math.max(4, season?.currentWeek ?? 4) }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      <SectionTitle sub="Every game with odds and community picks">
        <span className="text-brand-text">Games</span>
      </SectionTitle>

      <div className="flex flex-wrap gap-2">
        <Link href="/games" className={`tab ${!week && !status ? "tab-active" : ""}`}>All</Link>
        <Link href="/games?status=LIVE" className={`tab ${status === "LIVE" ? "tab-active" : ""}`}>Live</Link>
        <Link href="/games?status=FINAL" className={`tab ${status === "FINAL" ? "tab-active" : ""}`}>Final</Link>
        {weeks.map((w) => (
          <Link key={w} href={`/games?week=${w}`} className={`tab ${week === w ? "tab-active" : ""}`}>Week {w}</Link>
        ))}
      </div>

      {games.length === 0 ? (
        <EmptyState title="No games here yet" body="Games sync automatically from the sports provider." />
      ) : (
        <div className="overflow-hidden rounded-xl border border-brand-border">
          <table className="w-full text-sm">
            <thead className="bg-brand-surface">
              <tr>
                <th className="table-head px-4 py-3">Matchup</th>
                <th className="table-head hidden px-4 py-3 sm:table-cell">Kickoff</th>
                <th className="table-head px-4 py-3">Score</th>
                <th className="table-head px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {games.map((g) => (
                <tr key={g.id} className="transition-colors hover:bg-brand-surface">
                  <td className="px-4 py-3">
                    <Link href={`/games/${g.id}`} className="block">
                      <div className="flex items-center gap-3">
                        <TeamBadge abbr={g.awayTeam.abbreviation} color={g.awayTeam.primaryColor} size="sm" />
                        <span className="text-brand-muted">@</span>
                        <TeamBadge abbr={g.homeTeam.abbreviation} color={g.homeTeam.primaryColor} size="sm" />
                        <Badge tone="slate" className="ml-2">W{g.week}</Badge>
                      </div>
                    </Link>
                  </td>
                  <td className="hidden px-4 py-3 text-brand-muted sm:table-cell">{kickoffDisplay(g.scheduledAt)}</td>
                  <td className="scoreboard-num px-4 py-3 text-brand-text">
                    {g.status === "FINAL" || g.status === "LIVE" ? `${g.awayScore} – ${g.homeScore}` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={g.status === "LIVE" ? "red" : g.status === "FINAL" ? "slate" : "blue"}>{gameStatusLabel(g.status)}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
