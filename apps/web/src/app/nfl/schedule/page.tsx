import type { Metadata } from "next";
import Link from "next/link";
import { SeoHubShell, Breadcrumbs } from "@/components/seo-shell";
import { GamesList } from "@/components/games-list";
import { getGames, getSeason } from "@/lib/data";
import { isHistoricalNflSeason, nflSeasonLabel } from "@/lib/season";

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ type?: string }> }): Promise<Metadata> {
  const sp = await searchParams;
  const season = await getSeason();
  const label = season ? nflSeasonLabel(season.year) : "NFL";
  const preseason = sp.type === "pre";
  return {
    title: preseason ? `${label} Preseason Schedule — Every Game, Every Week` : `${label} Schedule — Every Game, Every Week`,
    description: season && isHistoricalNflSeason(season.year)
      ? `Archived ${season.year} NFL schedule from the configured sports provider: dates, matchups, results and broadcast info.`
      : `${preseason ? "Full preseason schedule" : `Full ${label.toLowerCase()} schedule`} by week: dates, times, matchups and broadcast info.`,
  };
}

export const revalidate = 60;

export default async function NflSchedulePage({ searchParams }: { searchParams: Promise<{ week?: string; type?: string }> }) {
  const sp = await searchParams;
  const season = await getSeason();
  const label = season ? nflSeasonLabel(season.year) : "NFL";
  const historical = season ? isHistoricalNflSeason(season.year) : false;

  const preGames = await getGames({ seasonType: "PRE", limit: 60 });
  const hasPre = preGames.length > 0;
  const preWeeks = [...new Set(preGames.map((game) => game.week))].sort((a, b) => a - b);

  const typeParam = sp.type === "pre" || sp.type === "reg" ? sp.type : null;
  const weekParam = sp.week ? Number(sp.week) : undefined;

  // Preserve legacy /nfl/schedule?week=N semantics: a week with regular-season
  // games is the regular season; otherwise fall back to preseason.
  let type: "pre" | "reg";
  if (typeParam) {
    type = typeParam;
  } else if (weekParam != null) {
    const regularInWeek = await getGames({ week: weekParam, seasonType: "REGULAR", limit: 1 });
    type = regularInWeek.length > 0 ? "reg" : hasPre ? "pre" : "reg";
  } else {
    type = hasPre ? "pre" : "reg";
  }

  const now = new Date();
  const week = weekParam ?? (type === "pre"
    ? preWeeks.find((w) => preGames.some((game) => game.week === w && game.scheduledAt >= now)) ?? preWeeks[0] ?? 1
    : 1);

  const weeks = type === "pre"
    ? preWeeks
    : Array.from({ length: Math.min(18, Math.max(4, season?.currentWeek ?? 4)) }, (_, i) => i + 1);

  const games = await getGames({ week, seasonType: type === "pre" ? "PRE" : "REGULAR", limit: 40 });

  const schedSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: type === "pre" ? `NFL Preseason Week ${week} Schedule` : `NFL Week ${week} Schedule`,
    itemListElement: games.map((g, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: { "@type": "SportsEvent", name: `${g.awayTeam.name} at ${g.homeTeam.name}`, startDate: g.scheduledAt.toISOString() },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schedSchema) }} />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "NFL", href: "/nfl" }, { label: "Schedule" }]} />
      <SeoHubShell title={`${label} Schedule`} description={historical ? "Archived provider schedule with final scores, kickoff times and broadcast info." : "Every NFL game by week with kickoff times and broadcast info. Updated continuously during the season."}>
        <nav className="mb-3 flex flex-wrap gap-2" aria-label="Season part">
          <Link href="/nfl/schedule?type=pre" className={`tab ${type === "pre" ? "tab-active" : ""}`}>Preseason</Link>
          <Link href="/nfl/schedule?type=reg" className={`tab ${type === "reg" ? "tab-active" : ""}`}>Regular Season</Link>
        </nav>
        <nav className="mb-4 flex flex-wrap gap-2" aria-label="Week selection">
          {weeks.map((w) => (
            <Link key={w} href={`/nfl/schedule?type=${type}&week=${w}`} className={`tab ${week === w ? "tab-active" : ""}`}>
              {type === "pre" ? `PS${w}` : `Week ${w}`}
            </Link>
          ))}
        </nav>
        <GamesList games={games} showVenue />
      </SeoHubShell>
    </>
  );
}
