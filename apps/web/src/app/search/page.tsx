import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@sbgg/db";
import { Badge, EmptyState, SectionTitle, TeamBadge } from "@/components/ui";

export const metadata: Metadata = {
  title: "Search NFL Games, Teams, Players & Predictors",
  description: "Search Superbowl.gg for NFL games, teams, players, community predictors and public picks.",
  robots: { index: false, follow: true },
};

export const revalidate = 0;

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q: rawQuery } = await searchParams;
  const query = rawQuery?.trim().slice(0, 80) ?? "";
  const hasQuery = query.length >= 2;
  const [games, teams, players, profiles, predictions] = hasQuery
    ? await Promise.all([
        prisma.game.findMany({
          where: { OR: [
            { homeTeam: { name: { contains: query, mode: "insensitive" } } },
            { awayTeam: { name: { contains: query, mode: "insensitive" } } },
            { venue: { contains: query, mode: "insensitive" } },
          ] },
          include: { homeTeam: true, awayTeam: true },
          orderBy: { scheduledAt: "desc" },
          take: 8,
        }),
        prisma.team.findMany({ where: { OR: [
          { name: { contains: query, mode: "insensitive" } },
          { shortName: { contains: query, mode: "insensitive" } },
          { abbreviation: { equals: query, mode: "insensitive" } },
          { city: { contains: query, mode: "insensitive" } },
        ] }, take: 8 }),
        prisma.player.findMany({ where: { name: { contains: query, mode: "insensitive" } }, include: { team: true }, take: 8 }),
        prisma.profile.findMany({ where: { OR: [
          { username: { contains: query, mode: "insensitive" } },
          { displayName: { contains: query, mode: "insensitive" } },
        ] }, take: 8 }),
        prisma.prediction.findMany({
          where: { isPublic: true, OR: [
            { analysis: { contains: query, mode: "insensitive" } },
            { selection: { contains: query, mode: "insensitive" } },
            { game: { homeTeam: { name: { contains: query, mode: "insensitive" } } } },
            { game: { awayTeam: { name: { contains: query, mode: "insensitive" } } } },
          ] },
          include: { user: { include: { profile: true } }, game: { include: { homeTeam: true, awayTeam: true } } },
          orderBy: { publishedAt: "desc" },
          take: 8,
        }),
      ])
    : [[], [], [], [], []] as const;
  const total = games.length + teams.length + players.length + profiles.length + predictions.length;

  return (
    <div className="space-y-8">
      <div>
        <SectionTitle sub="Games, teams, players, predictors and public picks">Search Superbowl.gg</SectionTitle>
        <form action="/search" role="search" className="flex max-w-2xl gap-2">
          <label htmlFor="site-search" className="sr-only">Search</label>
          <input id="site-search" name="q" type="search" className="input" defaultValue={query} minLength={2} maxLength={80} placeholder="Search the NFL community…" required />
          <button type="submit" className="btn-primary">Search</button>
        </form>
      </div>

      {!hasQuery ? <EmptyState title="Enter at least two characters" body="Try a team, player, matchup or predictor username." /> : null}
      {hasQuery && total === 0 ? <EmptyState title="No results found" body={`Nothing matched “${query}”.`} /> : null}

      {teams.length ? <ResultSection title="Teams">{teams.map((team) => (
        <Link key={team.id} href={`/nfl/teams/${team.slug}`} className="card card-hover flex items-center gap-3">
          <TeamBadge abbr={team.abbreviation} color={team.primaryColor} logoUrl={team.logoUrl} size="sm" />
          <span><span className="block font-medium text-brand-text">{team.name}</span><span className="text-xs text-brand-muted">{team.conference ?? "NFL"} {team.division ?? ""}</span></span>
        </Link>
      ))}</ResultSection> : null}

      {players.length ? <ResultSection title="Players">{players.map((player) => (
        <Link key={player.id} href={`/nfl/players/${player.slug}`} className="card card-hover">
          <span className="font-medium text-brand-text">{player.name}</span>
          <span className="ml-2 text-xs text-brand-muted">{player.position ?? "NFL player"}{player.team ? ` · ${player.team.abbreviation}` : ""}</span>
        </Link>
      ))}</ResultSection> : null}

      {games.length ? <ResultSection title="Games">{games.map((game) => (
        <Link key={game.id} href={`/games/${game.id}`} className="card card-hover flex items-center justify-between gap-3">
          <span className="font-medium text-brand-text">{game.awayTeam.name} at {game.homeTeam.name}</span>
          <Badge tone={game.status === "LIVE" ? "red" : game.status === "FINAL" ? "slate" : "blue"}>{game.status}</Badge>
        </Link>
      ))}</ResultSection> : null}

      {profiles.length ? <ResultSection title="Predictors">{profiles.map((profile) => (
        <Link key={profile.id} href={`/users/${profile.username}`} className="card card-hover">
          <span className="font-medium text-brand-text">{profile.displayName ?? profile.username}</span>
          <span className="ml-2 text-sm text-brand-muted">@{profile.username}</span>
        </Link>
      ))}</ResultSection> : null}

      {predictions.length ? <ResultSection title="Predictions">{predictions.map((prediction) => (
        <Link key={prediction.id} href={`/predictions/${prediction.id}`} className="card card-hover">
          <span className="font-medium text-brand-text">@{prediction.user.profile?.username ?? "predictor"}: {prediction.selection}</span>
          <span className="ml-2 text-xs text-brand-muted">{prediction.game.awayTeam.abbreviation} @ {prediction.game.homeTeam.abbreviation}</span>
        </Link>
      ))}</ResultSection> : null}
    </div>
  );
}

function ResultSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section><h2 className="mb-3 font-display text-xl font-semibold text-brand-text">{title}</h2><div className="grid gap-2 md:grid-cols-2">{children}</div></section>;
}
