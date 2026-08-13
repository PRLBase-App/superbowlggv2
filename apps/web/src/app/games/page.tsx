import type { Metadata } from "next";
import Link from "next/link";
import { getGames, getSeason } from "@/lib/data";
import { SectionTitle, EmptyState } from "@/components/ui";
import { GamesList } from "@/components/games-list";
import type { GameStatus } from "@sbgg/db";
import { nflSeasonLabel } from "@/lib/season";

export const metadata: Metadata = {
  title: "NFL Games, Odds & Schedule",
  description: "Browse every NFL game: schedule, live scores, odds and community predictions.",
};

export const revalidate = 60;

export default async function GamesPage({ searchParams }: { searchParams: Promise<{ week?: string; status?: string; type?: string }> }) {
  const sp = await searchParams;
  const weekParam = sp.week ? Number(sp.week) : undefined;
  const allowedStatuses: GameStatus[] = ["SCHEDULED", "LIVE", "FINAL", "POSTPONED", "CANCELLED", "SUSPENDED"];
  const status = allowedStatuses.find((candidate) => candidate === sp.status);
  const season = await getSeason();
  const label = season ? nflSeasonLabel(season.year) : "NFL";

  const preGames = await getGames({ seasonType: "PRE", limit: 60 });
  const hasPre = preGames.length > 0;
  const preWeeks = [...new Set(preGames.map((game) => game.week))].sort((a, b) => a - b);

  const typeParam = sp.type === "pre" || sp.type === "reg" ? sp.type : null;
  // Preserve legacy /games?week=N semantics: a week with regular-season games
  // is the regular season; otherwise fall back to preseason.
  let type: "pre" | "reg" | null = typeParam;
  if (!type && weekParam != null) {
    const regularInWeek = await getGames({ week: weekParam, seasonType: "REGULAR", limit: 1 });
    type = regularInWeek.length > 0 ? "reg" : hasPre ? "pre" : null;
  }

  const games = await getGames({ week: weekParam, seasonType: type ? (type === "pre" ? "PRE" : "REGULAR") : undefined, status, limit: 100 });

  const regWeeks = Array.from({ length: Math.min(18, Math.max(4, season?.currentWeek ?? 4)) }, (_, i) => i + 1);

  const tabClass = (active: boolean) => `tab ${active ? "tab-active" : ""}`;

  return (
    <div className="space-y-6">
      <SectionTitle sub={`Every game in the ${label.toLowerCase()} dataset`}>
        <span className="text-brand-text">Games</span>
      </SectionTitle>

      <div className="flex flex-wrap items-center gap-2">
        <Link href="/games" className={tabClass(!weekParam && !status && !type)}>All</Link>
        <Link href="/games?status=LIVE" className={tabClass(status === "LIVE")}>Live</Link>
        <Link href="/games?status=FINAL" className={tabClass(status === "FINAL")}>Final</Link>
        {hasPre ? (
          <>
            <span className="mx-1 text-xs font-semibold uppercase tracking-wider text-brand-muted/60">Preseason</span>
            {preWeeks.map((w) => (
              <Link key={`ps-${w}`} href={`/games?type=pre&week=${w}`} className={tabClass(type === "pre" && weekParam === w)}>PS{w}</Link>
            ))}
          </>
        ) : null}
        <span className="mx-1 text-xs font-semibold uppercase tracking-wider text-brand-muted/60">Regular</span>
        {regWeeks.map((w) => (
          <Link key={`w-${w}`} href={`/games?type=reg&week=${w}`} className={tabClass(type === "reg" && weekParam === w)}>W{w}</Link>
        ))}
      </div>

      {games.length === 0 ? (
        <EmptyState title="No games here yet" body="Games sync automatically from the sports provider." />
      ) : (
        <GamesList games={games} />
      )}
    </div>
  );
}
