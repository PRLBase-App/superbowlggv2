import { prisma } from "@sbgg/db";
import { buildPredictionOptions, prioritizePickBoardGames, type CommunityPlayerOption, type PredictionOptionsResult } from "./prediction-options";
import { currentNflSeasonYear } from "./season";

const optionInclude = {
  homeTeam: true,
  awayTeam: true,
  markets: {
    where: { active: true },
    include: {
      bookmaker: true,
      outcomes: { orderBy: { lastUpdated: "desc" as const } },
    },
    orderBy: { createdAt: "asc" as const },
  },
  odds: { orderBy: { capturedAt: "desc" as const } },
} as const;

export async function getPredictionOptions(gameId: string, now = new Date()): Promise<PredictionOptionsResult | null> {
  const game = await prisma.game.findUnique({ where: { id: gameId }, include: optionInclude });
  if (!game) return null;
  const players = await verifiedPlayersForTeams([game.homeTeamId, game.awayTeamId], [game.homeTeam, game.awayTeam]);
  return buildPredictionOptions(game, game.odds, now, players);
}

async function verifiedPlayersForTeams(
  teamIds: string[],
  teams: Array<{ id: string; abbreviation: string }>,
): Promise<CommunityPlayerOption[]> {
  const players = await prisma.player.findMany({
    where: { teamId: { in: teamIds } },
    select: { id: true, name: true, position: true, teamId: true },
    orderBy: [{ teamId: "asc" }, { name: "asc" }],
  });
  if (!players.length) return [];
  const mappings = await prisma.providerEntityMapping.findMany({
    where: { entityType: "PLAYER", entityId: { in: players.map(({ id }) => id) } },
    select: { entityId: true },
  });
  const verified = new Set(mappings.map(({ entityId }) => entityId));
  const abbreviations = new Map(teams.map((team) => [team.id, team.abbreviation]));
  return players.filter(({ id }) => verified.has(id)).map((player) => ({
    ...player,
    teamAbbreviation: player.teamId ? abbreviations.get(player.teamId) ?? "NFL" : "NFL",
  }));
}

export async function getPickBoardGames(now = new Date(), limit = 12) {
  const games = await prisma.game.findMany({
    where: {
      season: { year: currentNflSeasonYear(now) },
      status: "SCHEDULED",
      scheduledAt: { gt: now },
    },
    include: optionInclude,
    orderBy: { scheduledAt: "asc" },
    // Look beyond short stretches of unsupported games so a later open market
    // can still be surfaced without hiding the next games entirely.
    take: Math.max(limit * 4, 48),
  });
  const teams = Array.from(new Map(games.flatMap((game) => [game.homeTeam, game.awayTeam]).map((team) => [team.id, team])).values());
  const verifiedPlayers = await verifiedPlayersForTeams(teams.map(({ id }) => id), teams);
  const pickBoardGames = games.map((game) => ({
    id: game.id,
    week: game.week,
    seasonType: game.seasonType,
    scheduledAt: game.scheduledAt.toISOString(),
    venue: game.venue,
    homeTeam: {
      name: game.homeTeam.name,
      abbreviation: game.homeTeam.abbreviation,
      logoUrl: game.homeTeam.logoUrl,
      primaryColor: game.homeTeam.primaryColor,
    },
    awayTeam: {
      name: game.awayTeam.name,
      abbreviation: game.awayTeam.abbreviation,
      logoUrl: game.awayTeam.logoUrl,
      primaryColor: game.awayTeam.primaryColor,
    },
    options: buildPredictionOptions(
      game,
      game.odds,
      now,
      verifiedPlayers.filter(({ teamId }) => teamId === game.homeTeamId || teamId === game.awayTeamId),
    ),
  }));
  return prioritizePickBoardGames(pickBoardGames, limit);
}
