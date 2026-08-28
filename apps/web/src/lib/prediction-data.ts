import { prisma } from "@sbgg/db";
import { buildPredictionOptions, type PredictionOptionsResult } from "./prediction-options";
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
  return game ? buildPredictionOptions(game, game.odds, now) : null;
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
    take: limit,
  });
  return games.map((game) => ({
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
    options: buildPredictionOptions(game, game.odds, now),
  }));
}
