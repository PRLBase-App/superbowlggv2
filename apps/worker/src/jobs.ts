import { createHash } from "node:crypto";
import {
  Prisma,
  prisma,
  type PlayerGameStats,
  type PredictionMarket,
  type SettlementResult,
  type SyncJobType,
} from "@sbgg/db";
import { getSportsProvider, providerName, type GameDTO, type SeasonDTO, type TeamDTO } from "@sbgg/sports";
import { getOddsProvider, type GameOdds, type OddsOutcome } from "@sbgg/odds";
import { checkAchievements, grantXpAndCoins, recordSettlementRewards } from "@sbgg/gamification";
import { settlePrediction } from "@sbgg/core";
import { XMLParser } from "fast-xml-parser";
import { matchNewsTeam } from "./news";

const SPORTS_PROVIDER = providerName();
const ODDS_PROVIDER = "the-odds-api";
const SIX_HOURS = 6 * 60 * 60 * 1_000;
const ESPN_NFL_RSS = "https://www.espn.com/espn/rss/nfl/news";

export interface JobResult {
  processed: number;
  error?: string;
}

/** Run a job with a durable audit record. Errors are returned so the cron process can fail visibly. */
export async function withLog(
  jobType: SyncJobType,
  provider: string | null,
  fn: () => Promise<JobResult>,
): Promise<JobResult> {
  const log = await prisma.integrationSyncLog.create({
    data: { jobType, status: "RUNNING", provider, startedAt: new Date() },
  });
  try {
    const result = await fn();
    await prisma.integrationSyncLog.update({
      where: { id: log.id },
      data: { status: "SUCCESS", finishedAt: new Date(), itemsProcessed: result.processed },
    });
    console.info(`[worker] ${jobType}: ${result.processed} items`);
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await prisma.integrationSyncLog.update({
      where: { id: log.id },
      data: { status: "FAILED", finishedAt: new Date(), error: message.slice(0, 2_000) },
    });
    console.error(`[worker] ${jobType} failed: ${message}`);
    return { processed: 0, error: message };
  }
}

function validDate(value: string): Date {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error(`Provider returned an invalid timestamp: ${value}`);
  return date;
}

async function mappedId(provider: string, entityType: string, providerId: string): Promise<string | null> {
  const mapping = await prisma.providerEntityMapping.findUnique({
    where: { provider_entityType_providerId: { provider, entityType, providerId } },
    select: { entityId: true },
  });
  return mapping?.entityId ?? null;
}

async function upsertMapping(
  provider: string,
  entityType: string,
  providerId: string,
  entityId: string,
  gameId?: string,
): Promise<void> {
  await prisma.providerEntityMapping.upsert({
    where: { provider_entityType_providerId: { provider, entityType, providerId } },
    update: { entityId, gameId: gameId ?? null },
    create: { provider, entityType, providerId, entityId, gameId: gameId ?? null },
  });
}

async function ensureSeason(leagueId: string, season: SeasonDTO) {
  await prisma.season.updateMany({ where: { leagueId, isCurrent: true, year: { not: season.year } }, data: { isCurrent: false } });
  const row = await prisma.season.upsert({
    where: { leagueId_year: { leagueId, year: season.year } },
    update: {
      name: `${season.year} NFL Season`,
      startDate: validDate(season.start),
      endDate: validDate(season.end),
      status: season.current ? "ACTIVE" : "COMPLETE",
      isCurrent: season.current,
      providerCoverage: season.coverage as unknown as Prisma.InputJsonValue,
    },
    create: {
      leagueId,
      year: season.year,
      name: `${season.year} NFL Season`,
      startDate: validDate(season.start),
      endDate: validDate(season.end),
      status: season.current ? "ACTIVE" : "COMPLETE",
      isCurrent: season.current,
      providerCoverage: season.coverage as unknown as Prisma.InputJsonValue,
    },
  });
  await upsertMapping(SPORTS_PROVIDER, "SEASON", String(season.year), row.id);
  return row;
}

async function uniqueTeamSlug(base: string, providerId: string, mappedTeamId: string | null): Promise<string> {
  const existing = await prisma.team.findUnique({ where: { slug: base }, select: { id: true } });
  if (!existing || existing.id === mappedTeamId) return base;
  return `${base}-${providerId}`;
}

async function upsertTeam(leagueId: string, team: TeamDTO): Promise<string> {
  const entityId = await mappedId(SPORTS_PROVIDER, "TEAM", team.providerId);
  const mapped = entityId
    ? await prisma.team.findUnique({ where: { id: entityId } })
    : await prisma.team.findFirst({ where: { leagueId, OR: [{ abbreviation: team.abbreviation }, { name: team.name }] } });
  const slug = await uniqueTeamSlug(team.slug, team.providerId, mapped?.id ?? null);
  const data = {
    leagueId,
    slug,
    name: team.name,
    shortName: team.shortName,
    abbreviation: team.abbreviation,
    city: team.city,
    stadium: team.stadium,
    conference: team.conference,
    division: team.division,
    primaryColor: team.primaryColor,
    secondaryColor: team.secondaryColor,
    logoUrl: team.logoUrl,
  };
  const row = mapped
    ? await prisma.team.update({ where: { id: mapped.id }, data })
    : await prisma.team.create({ data });
  await upsertMapping(SPORTS_PROVIDER, "TEAM", team.providerId, row.id);
  return row.id;
}

async function upsertTeams(leagueId: string, teams: TeamDTO[]): Promise<number> {
  for (const team of teams) await upsertTeam(leagueId, team);
  return teams.length;
}

async function nflLeague() {
  const league = await prisma.league.findUnique({ where: { slug: "NFL" } });
  if (!league) throw new Error("NFL league is missing; run the production seed first");
  return league;
}

async function currentSeason() {
  const league = await nflLeague();
  const season = await prisma.season.findFirst({
    where: { leagueId: league.id, isCurrent: true },
    orderBy: { year: "desc" },
  });
  if (!season) throw new Error("Current NFL season is missing; run the schedule sync first");
  return { league, season };
}

export async function syncTeams(): Promise<JobResult> {
  return withLog("SYNC_TEAMS", SPORTS_PROVIDER, async () => {
    const provider = getSportsProvider();
    const league = await nflLeague();
    const season = await provider.getCurrentSeason("NFL");
    await ensureSeason(league.id, season);
    const teams = await provider.getTeams("NFL", season.year);
    const processed = await upsertTeams(league.id, teams);
    await prisma.featureFlag.updateMany({ where: { key: "provider.sports" }, data: { enabled: true } });
    return { processed };
  });
}

async function upsertGame(leagueId: string, seasonId: string, game: GameDTO): Promise<string> {
  const [homeTeamId, awayTeamId] = await Promise.all([
    mappedId(SPORTS_PROVIDER, "TEAM", game.homeTeamProviderId),
    mappedId(SPORTS_PROVIDER, "TEAM", game.awayTeamProviderId),
  ]);
  if (!homeTeamId || !awayTeamId) {
    throw new Error(`Cannot sync provider game ${game.providerId}: one or both team mappings are missing`);
  }
  const entityId = await mappedId(SPORTS_PROVIDER, "GAME", game.providerId);
  const mapped = entityId ? await prisma.game.findUnique({ where: { id: entityId } }) : null;
  const data = {
    leagueId,
    seasonId,
    week: game.week,
    seasonType: game.seasonType,
    homeTeamId,
    awayTeamId,
    scheduledAt: validDate(game.scheduledAt),
    status: game.status,
    homeScore: game.homeScore,
    awayScore: game.awayScore,
    quarter: game.quarter,
    clock: game.clock,
    venue: game.venue,
    broadcast: game.broadcast,
    stage: game.stage,
    providerUpdatedAt: new Date(),
  };
  const row = mapped
    ? await prisma.game.update({ where: { id: mapped.id }, data })
    : await prisma.game.create({ data });
  await upsertMapping(SPORTS_PROVIDER, "GAME", game.providerId, row.id, row.id);
  return row.id;
}

/** Full schedule synchronization. This preserves internal IDs on every provider refresh. */
export async function syncGames(): Promise<JobResult> {
  return withLog("SYNC_SCHEDULE", SPORTS_PROVIDER, async () => {
    const provider = getSportsProvider();
    const league = await nflLeague();
    const providerSeason = await provider.getCurrentSeason("NFL");
    const season = await ensureSeason(league.id, providerSeason);

    const teamMappings = await prisma.providerEntityMapping.count({ where: { provider: SPORTS_PROVIDER, entityType: "TEAM" } });
    if (teamMappings === 0) {
      await upsertTeams(league.id, await provider.getTeams("NFL", providerSeason.year));
    }

    const games = await provider.getSchedule("NFL", providerSeason.year);
    for (const game of games) await upsertGame(league.id, season.id, game);
    const now = new Date();
    const nextGame = games.filter((game) => new Date(game.scheduledAt) >= now).sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))[0];
    const latestGame = games.filter((game) => new Date(game.scheduledAt) < now).sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt))[0];
    await prisma.season.update({
      where: { id: season.id },
      data: { currentWeek: Math.max(1, nextGame?.week ?? latestGame?.week ?? 1) },
    });
    await prisma.featureFlag.updateMany({ where: { key: "provider.sports" }, data: { enabled: true } });
    return { processed: games.length };
  });
}

export async function syncStandings(): Promise<JobResult> {
  return withLog("SYNC_STANDINGS", SPORTS_PROVIDER, async () => {
    const provider = getSportsProvider();
    const { league, season } = await currentSeason();
    const standings = await provider.getStandings("NFL", season.year);
    let processed = 0;
    for (const standing of standings) {
      const teamId = await mappedId(SPORTS_PROVIDER, "TEAM", standing.teamProviderId);
      if (!teamId) continue;
      await prisma.standing.upsert({
        where: { leagueId_seasonId_teamId: { leagueId: league.id, seasonId: season.id, teamId } },
        update: {
          wins: standing.wins,
          losses: standing.losses,
          ties: standing.ties,
          pointsFor: standing.pointsFor,
          pointsAgainst: standing.pointsAgainst,
          divisionRank: standing.divisionRank,
          conferenceRank: standing.conferenceRank,
          streak: standing.streak,
          lastUpdated: new Date(),
        },
        create: {
          leagueId: league.id,
          seasonId: season.id,
          teamId,
          wins: standing.wins,
          losses: standing.losses,
          ties: standing.ties,
          pointsFor: standing.pointsFor,
          pointsAgainst: standing.pointsAgainst,
          divisionRank: standing.divisionRank,
          conferenceRank: standing.conferenceRank,
          streak: standing.streak,
        },
      });
      processed++;
    }
    return { processed };
  });
}

function rotatingBatch<T>(items: T[], size: number, now = new Date()): T[] {
  if (items.length <= size) return items;
  const batchCount = Math.ceil(items.length / size);
  const batch = Math.floor(now.getTime() / SIX_HOURS) % batchCount;
  const start = batch * size;
  return items.slice(start, start + size);
}

async function uniquePlayerSlug(base: string, providerId: string, mappedPlayerId: string | null): Promise<string> {
  const existing = await prisma.player.findUnique({ where: { slug: base }, select: { id: true } });
  if (!existing || existing.id === mappedPlayerId) return base;
  return `${base}-${providerId}`;
}

export async function syncPlayers(): Promise<JobResult> {
  return withLog("SYNC_PLAYERS", SPORTS_PROVIDER, async () => {
    const provider = getSportsProvider();
    const { league, season } = await currentSeason();
    const teamMappings = await prisma.providerEntityMapping.findMany({
      where: { provider: SPORTS_PROVIDER, entityType: "TEAM" },
      orderBy: { providerId: "asc" },
    });
    const batch = SPORTS_PROVIDER === "nflverse" ? teamMappings : rotatingBatch(teamMappings, 4);
    let processed = 0;
    for (const teamMapping of batch) {
      const players = await provider.getPlayers(teamMapping.providerId, season.year);
      for (const player of players) {
        const entityId = await mappedId(SPORTS_PROVIDER, "PLAYER", player.providerId);
        const teamId = player.teamProviderId
          ? await mappedId(SPORTS_PROVIDER, "TEAM", player.teamProviderId)
          : teamMapping.entityId;
        const mapped = entityId
          ? await prisma.player.findUnique({ where: { id: entityId } })
          : await prisma.player.findFirst({ where: { leagueId: league.id, teamId, name: player.name } });
        const slug = await uniquePlayerSlug(player.slug, player.providerId, mapped?.id ?? null);
        const data = {
          teamId,
          leagueId: league.id,
          slug,
          name: player.name,
          firstName: player.firstName,
          lastName: player.lastName,
          position: player.position,
          jerseyNumber: player.jerseyNumber,
          height: player.height,
          weight: player.weight,
          college: player.college,
          headshotUrl: player.imageUrl,
          status: player.status,
        };
        const row = mapped
          ? await prisma.player.update({ where: { id: mapped.id }, data })
          : await prisma.player.create({ data });
        await upsertMapping(SPORTS_PROVIDER, "PLAYER", player.providerId, row.id);
        processed++;
      }
      if (provider.usage.dailyRemaining != null && provider.usage.dailyRemaining <= 5) break;
    }
    return { processed };
  });
}

export async function syncInjuries(): Promise<JobResult> {
  return withLog("SYNC_INJURIES", SPORTS_PROVIDER, async () => {
    if (SPORTS_PROVIDER === "nflverse") return { processed: 0 };
    const provider = getSportsProvider();
    const { league } = await currentSeason();
    const teamMappings = await prisma.providerEntityMapping.findMany({
      where: { provider: SPORTS_PROVIDER, entityType: "TEAM" },
      orderBy: { providerId: "asc" },
    });
    const batch = rotatingBatch(teamMappings, 4);
    let processed = 0;
    for (const teamMapping of batch) {
      const injuries = await provider.getInjuries(teamMapping.providerId);
      for (const injury of injuries) {
        const playerId = await mappedId(SPORTS_PROVIDER, "PLAYER", injury.playerProviderId);
        if (!playerId) continue;
        const teamId = injury.teamProviderId
          ? await mappedId(SPORTS_PROVIDER, "TEAM", injury.teamProviderId)
          : teamMapping.entityId;
        const gameId = injury.gameProviderId
          ? await mappedId(SPORTS_PROVIDER, "GAME", injury.gameProviderId)
          : null;
        const reportedAt = validDate(injury.reportedAt);
        const existing = await prisma.injury.findFirst({
          where: { playerId, status: injury.status, bodyPart: injury.bodyPart, reportedAt },
        });
        const data = {
          playerId,
          teamId,
          leagueId: league.id,
          gameId,
          status: injury.status,
          bodyPart: injury.bodyPart,
          description: injury.description,
          reportedAt,
        };
        if (existing) await prisma.injury.update({ where: { id: existing.id }, data });
        else await prisma.injury.create({ data });
        processed++;
      }
      if (provider.usage.dailyRemaining != null && provider.usage.dailyRemaining <= 5) break;
    }
    return { processed };
  });
}

async function syncGameDetails(gameId: string, providerGameId: string): Promise<number> {
  const provider = getSportsProvider();
  const game = await prisma.game.findUnique({ where: { id: gameId }, include: { season: true } });
  if (!game) return 0;
  const coverage = (game.season.providerCoverage ?? {}) as Partial<Record<string, boolean>>;
  let processed = 0;

  if (coverage.teamGameStats !== false) {
    const stats = await provider.getGameStats(providerGameId);
    for (const stat of stats) {
      const teamId = await mappedId(SPORTS_PROVIDER, "TEAM", stat.teamProviderId);
      if (!teamId) continue;
      await prisma.gameTeamStats.upsert({
        where: { gameId_teamId: { gameId, teamId } },
        update: {
          isHome: stat.isHome,
          totalYards: stat.totalYards,
          passYards: stat.passYards,
          rushYards: stat.rushYards,
          turnovers: stat.turnovers,
          firstDowns: stat.firstDowns,
        },
        create: {
          gameId,
          teamId,
          leagueId: game.leagueId,
          isHome: stat.isHome,
          totalYards: stat.totalYards,
          passYards: stat.passYards,
          rushYards: stat.rushYards,
          turnovers: stat.turnovers,
          firstDowns: stat.firstDowns,
        },
      });
      processed++;
    }
  }

  if (coverage.playerGameStats !== false) {
    const stats = await provider.getPlayerGameStats(providerGameId);
    for (const stat of stats) {
      const playerId = await mappedId(SPORTS_PROVIDER, "PLAYER", stat.playerProviderId);
      if (!playerId) continue;
      const teamId = stat.teamProviderId ? await mappedId(SPORTS_PROVIDER, "TEAM", stat.teamProviderId) : null;
      await prisma.playerGameStats.upsert({
        where: { gameId_playerId: { gameId, playerId } },
        update: {
          teamId,
          passingYards: stat.passingYards,
          passingTds: stat.passingTds,
          interceptions: stat.interceptions,
          rushingYards: stat.rushingYards,
          rushingTds: stat.rushingTds,
          receptions: stat.receptions,
          receivingYards: stat.receivingYards,
          receivingTds: stat.receivingTds,
          fantasyPoints: stat.fantasyPoints,
        },
        create: {
          gameId,
          playerId,
          teamId,
          leagueId: game.leagueId,
          passingYards: stat.passingYards,
          passingTds: stat.passingTds,
          interceptions: stat.interceptions,
          rushingYards: stat.rushingYards,
          rushingTds: stat.rushingTds,
          receptions: stat.receptions,
          receivingYards: stat.receivingYards,
          receivingTds: stat.receivingTds,
          fantasyPoints: stat.fantasyPoints,
        },
      });
      processed++;
    }
  }

  if (coverage.events !== false) {
    const events = await provider.getGameEvents(providerGameId);
    for (const [index, event] of events.entries()) {
      const providerEventKey = createHash("sha256")
        .update(JSON.stringify([providerGameId, index, event.quarter, event.clock, event.teamProviderId, event.playerProviderId, event.type, event.description, event.homeScore, event.awayScore]))
        .digest("hex");
      const [teamId, playerId] = await Promise.all([
        event.teamProviderId ? mappedId(SPORTS_PROVIDER, "TEAM", event.teamProviderId) : null,
        event.playerProviderId ? mappedId(SPORTS_PROVIDER, "PLAYER", event.playerProviderId) : null,
      ]);
      await prisma.gameEvent.upsert({
        where: { provider_providerEventKey: { provider: SPORTS_PROVIDER, providerEventKey } },
        update: {
          quarter: event.quarter,
          clock: event.clock,
          teamId,
          playerId,
          type: event.type,
          description: event.description,
          homeScore: event.homeScore,
          awayScore: event.awayScore,
        },
        create: {
          gameId,
          provider: SPORTS_PROVIDER,
          providerEventKey,
          quarter: event.quarter,
          clock: event.clock,
          teamId,
          playerId,
          type: event.type,
          description: event.description,
          homeScore: event.homeScore,
          awayScore: event.awayScore,
        },
      });
      processed++;
    }
  }
  return processed;
}

/** Refresh scores only during a real game window and hydrate one box score per run to respect the free quota. */
export async function syncLiveGames(): Promise<JobResult> {
  return withLog("SYNC_LIVE_GAMES", SPORTS_PROVIDER, async () => {
    const now = new Date();
    const windowStart = new Date(now.getTime() - 8 * 60 * 60 * 1_000);
    const windowEnd = new Date(now.getTime() + 90 * 60 * 1_000);
    const localGames = await prisma.game.findMany({
      where: {
        OR: [
          { status: "LIVE" },
          { scheduledAt: { gte: windowStart, lte: windowEnd }, status: { in: ["SCHEDULED", "LIVE"] } },
          { scheduledAt: { gte: new Date(now.getTime() - 48 * 60 * 60 * 1_000), lte: now }, status: "FINAL", teamStats: { none: {} } },
        ],
      },
      orderBy: { scheduledAt: "asc" },
    });
    if (localGames.length === 0) return { processed: 0 };

    const provider = getSportsProvider();
    const { season } = await currentSeason();
    const schedule = await provider.getSchedule("NFL", season.year);
    const localIds = new Set(localGames.map((game) => game.id));
    let processed = 0;
    for (const remote of schedule) {
      const gameId = await mappedId(SPORTS_PROVIDER, "GAME", remote.providerId);
      if (!gameId || !localIds.has(gameId)) continue;
      await prisma.game.update({
        where: { id: gameId },
        data: {
          scheduledAt: validDate(remote.scheduledAt),
          status: remote.status,
          homeScore: remote.homeScore,
          awayScore: remote.awayScore,
          quarter: remote.quarter,
          clock: remote.clock,
          providerUpdatedAt: new Date(),
        },
      });
      processed++;
    }

    const liveDetailCandidate = await prisma.game.findFirst({
      where: { id: { in: [...localIds] }, status: "LIVE" },
      orderBy: { scheduledAt: "asc" },
    });
    const detailCandidate = liveDetailCandidate ?? await prisma.game.findFirst({
      where: {
        id: { in: [...localIds] },
        status: "FINAL",
        OR: [{ teamStats: { none: {} } }, { playerStats: { none: {} } }],
      },
      orderBy: { scheduledAt: "asc" },
    });
    if (detailCandidate && (provider.usage.dailyRemaining == null || provider.usage.dailyRemaining > 5)) {
      const providerGameId = await prisma.providerEntityMapping.findFirst({
        where: { provider: SPORTS_PROVIDER, entityType: "GAME", entityId: detailCandidate.id },
        select: { providerId: true },
      });
      if (providerGameId) processed += await syncGameDetails(detailCandidate.id, providerGameId.providerId);
    }
    return { processed };
  });
}

function normalizedTeam(value: string): string {
  return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]/g, "");
}

function marketName(key: string): string {
  if (key === "h2h") return "Moneyline";
  if (key === "spreads") return "Spread";
  if (key === "totals") return "Total";
  return key
    .replace(/^player_/, "Player ")
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function outcomeDisplay(outcome: OddsOutcome): string {
  return outcome.description ? `${outcome.name} — ${outcome.description}` : outcome.name;
}

async function persistOddsEvent(gameId: string, event: GameOdds): Promise<number> {
  await upsertMapping(ODDS_PROVIDER, "GAME", event.providerEventId, gameId, gameId);
  let processed = 0;
  for (const bookmakerOdds of event.bookmakers) {
    const bookmaker = await prisma.bookmaker.upsert({
      where: { key: bookmakerOdds.key },
      update: { name: bookmakerOdds.title, active: true },
      create: { key: bookmakerOdds.key, name: bookmakerOdds.title },
    });
    for (const offeredMarket of bookmakerOdds.markets) {
      const capturedAt = validDate(offeredMarket.lastUpdated);
      const market = await prisma.market.upsert({
        where: { gameId_bookmakerId_key: { gameId, bookmakerId: bookmaker.id, key: offeredMarket.key } },
        update: { name: marketName(offeredMarket.key), active: true },
        create: { gameId, bookmakerId: bookmaker.id, key: offeredMarket.key, name: marketName(offeredMarket.key) },
      });
      for (const outcome of offeredMarket.outcomes) {
        await prisma.marketOutcome.upsert({
          where: { marketId_providerOutcomeKey: { marketId: market.id, providerOutcomeKey: outcome.providerId } },
          update: {
            name: outcome.name,
            description: outcome.description,
            price: outcome.price,
            point: outcome.point,
            lastUpdated: capturedAt,
          },
          create: {
            marketId: market.id,
            providerOutcomeKey: outcome.providerId,
            name: outcome.name,
            description: outcome.description,
            price: outcome.price,
            point: outcome.point,
            lastUpdated: capturedAt,
          },
        });
        const latest = await prisma.oddsSnapshot.findFirst({
          where: { marketId: market.id, outcomeKey: outcome.providerId },
          orderBy: { capturedAt: "desc" },
        });
        if (latest && latest.capturedAt >= capturedAt) continue;
        if (latest && latest.price === outcome.price && latest.line === outcome.point) continue;
        await prisma.oddsSnapshot.create({
          data: {
            gameId,
            bookmakerId: bookmaker.id,
            marketId: market.id,
            marketKey: offeredMarket.key,
            outcomeKey: outcome.providerId,
            outcome: outcomeDisplay(outcome),
            price: outcome.price,
            line: outcome.point,
            capturedAt,
          },
        });
        processed++;
      }
    }
  }
  return processed;
}

export async function syncOdds(): Promise<JobResult> {
  return withLog("SYNC_ODDS", ODDS_PROVIDER, async () => {
    const provider = getOddsProvider();
    const now = new Date();
    const games = await prisma.game.findMany({
      where: {
        league: { slug: "NFL" },
        scheduledAt: { gte: new Date(now.getTime() - 12 * 60 * 60 * 1_000), lte: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1_000) },
        status: { in: ["SCHEDULED", "LIVE"] },
      },
      include: { homeTeam: true, awayTeam: true },
    });
    if (games.length === 0) return { processed: 0 };

    const odds = await provider.getOdds("NFL");
    let processed = 0;
    for (const event of odds) {
      const kickoff = validDate(event.commenceTime);
      const game = games.find((candidate) =>
        normalizedTeam(candidate.homeTeam.name) === normalizedTeam(event.homeTeam)
        && normalizedTeam(candidate.awayTeam.name) === normalizedTeam(event.awayTeam)
        && Math.abs(candidate.scheduledAt.getTime() - kickoff.getTime()) <= 12 * 60 * 60 * 1_000,
      );
      if (!game) continue;
      processed += await persistOddsEvent(game.id, event);
    }

    // Player props use The Odds API's per-event endpoint. Limit this to the
    // nearest game once per day so the free quota remains comfortably bounded.
    const propGame = games
      .filter((game) => game.status === "SCHEDULED" && game.scheduledAt >= now && game.scheduledAt <= new Date(now.getTime() + 48 * 60 * 60 * 1_000))
      .sort((left, right) => left.scheduledAt.getTime() - right.scheduledAt.getTime())[0];
    if (propGame && (provider.usage.remaining == null || provider.usage.remaining >= 5)) {
      const latestPropSnapshot = await prisma.oddsSnapshot.findFirst({
        where: { gameId: propGame.id, marketKey: { startsWith: "player_" } },
        orderBy: { capturedAt: "desc" },
        select: { capturedAt: true },
      });
      const propsAreDue = !latestPropSnapshot
        || now.getTime() - latestPropSnapshot.capturedAt.getTime() >= 24 * 60 * 60 * 1_000;
      const providerEvent = odds.find((event) =>
        normalizedTeam(propGame.homeTeam.name) === normalizedTeam(event.homeTeam)
        && normalizedTeam(propGame.awayTeam.name) === normalizedTeam(event.awayTeam)
        && Math.abs(propGame.scheduledAt.getTime() - validDate(event.commenceTime).getTime()) <= 12 * 60 * 60 * 1_000,
      );
      if (propsAreDue && providerEvent) {
        try {
          const propOdds = await provider.getEventOdds("NFL", providerEvent.providerEventId, [
            "player_pass_yds",
            "player_pass_tds",
            "player_rush_yds",
            "player_reception_yds",
          ]);
          if (propOdds) processed += await persistOddsEvent(propGame.id, propOdds);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          console.warn(`[worker] optional player props unavailable: ${message}`);
        }
      }
    }
    if (processed > 0) await prisma.featureFlag.updateMany({ where: { key: "provider.odds" }, data: { enabled: true } });
    return { processed };
  });
}

type XmlNode = Record<string, unknown>;

function xmlText(value: unknown): string | null {
  if (typeof value === "string" || typeof value === "number") return String(value).trim() || null;
  if (value && typeof value === "object") return xmlText((value as XmlNode)["#text"]);
  return null;
}

/** Synchronize ESPN's published NFL RSS content without copying full articles. */
export async function syncNews(): Promise<JobResult> {
  return withLog("SYNC_NEWS", "espn-rss", async () => {
    const response = await fetch(ESPN_NFL_RSS, {
      headers: { "user-agent": "Superbowl.gg/2.0 (+https://superbowl.gg)" },
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });
    if (!response.ok) throw new Error(`ESPN RSS request failed (${response.status})`);
    const parsed = new XMLParser({ ignoreAttributes: false, trimValues: true }).parse(await response.text()) as XmlNode;
    const channel = ((parsed.rss as XmlNode | undefined)?.channel ?? {}) as XmlNode;
    const entries = Array.isArray(channel.item) ? channel.item : channel.item ? [channel.item] : [];
    const sourceImageUrl = xmlText((channel.image as XmlNode | undefined)?.url);
    const teams = await prisma.team.findMany({
      where: { league: { slug: "NFL" } },
      select: { id: true, name: true, shortName: true, abbreviation: true },
    });
    let processed = 0;
    for (const rawEntry of entries) {
      const entry = rawEntry as XmlNode;
      const title = xmlText(entry.title);
      const excerpt = xmlText(entry.description);
      const url = xmlText(entry.link);
      const sourceGuid = xmlText(entry.guid) ?? url;
      const published = xmlText(entry.pubDate);
      if (!title || !url || !sourceGuid || !published) continue;
      let destination: URL;
      try {
        destination = new URL(url);
      } catch {
        continue;
      }
      if (destination.hostname !== "espn.com" && !destination.hostname.endsWith(".espn.com")) continue;
      const publishedAt = new Date(published);
      if (Number.isNaN(publishedAt.getTime())) continue;
      const teamId = matchNewsTeam(`${title} ${excerpt ?? ""}`, teams);
      const data = {
        source: "ESPN",
        sourceGuid,
        title,
        excerpt,
        author: xmlText(entry["dc:creator"]),
        url,
        sourceImageUrl,
        teamId,
        publishedAt,
      };
      const existing = await prisma.newsItem.findFirst({
        where: { OR: [{ sourceGuid }, { url }] },
        select: { id: true },
      });
      if (existing) {
        await prisma.newsItem.update({
          where: { id: existing.id },
          data: {
            ...data,
            syncedAt: new Date(),
          },
        });
      } else {
        await prisma.newsItem.create({ data });
      }
      processed++;
    }
    return { processed };
  });
}

export interface SettlementInput {
  marketType: PredictionMarket | string;
  selection: string;
  line: number | null;
  homeScore: number;
  awayScore: number;
  playerPropValue?: number | null;
}

/** Pure settlement engine used by the worker and unit tests. */
export function computePredictionResult(input: SettlementInput): SettlementResult {
  if (!(["MONEYLINE", "SPREAD", "TOTAL", "PLAYER_PROP"] as const).includes(input.marketType as PredictionMarket)) {
    return "VOID";
  }
  return settlePrediction({
    marketType: input.marketType as PredictionMarket,
    selection: input.selection,
    line: input.line,
    homeScore: input.homeScore,
    awayScore: input.awayScore,
    playerStat: input.playerPropValue,
  }).result;
}

function playerPropValue(marketKey: string, stats: PlayerGameStats): number | null | undefined {
  const key = marketKey.toLowerCase();
  if (key.includes("pass_yds") || key.includes("passing_yards")) return stats.passingYards;
  if (key.includes("pass_tds") || key.includes("passing_touchdowns")) return stats.passingTds;
  if (key.includes("interceptions")) return stats.interceptions;
  if (key.includes("rush_yds") || key.includes("rushing_yards")) return stats.rushingYards;
  if (key.includes("reception_yds") || key.includes("receiving_yards")) return stats.receivingYards;
  if (key.includes("receptions")) return stats.receptions;
  if (key.includes("touchdown")) return (stats.rushingTds ?? 0) + (stats.receivingTds ?? 0);
  return undefined;
}

function settlementReason(marketType: PredictionMarket, result: SettlementResult, propValue?: number | null): string {
  if (result === "VOID") return "Market could not be settled from supported provider data";
  if (marketType === "PLAYER_PROP") return `Settled from official player statistics (${propValue ?? 0})`;
  return result === "PUSH" ? "Official result exactly matched the line" : "Settled from the official final score";
}

export async function settlePredictions(): Promise<JobResult> {
  return withLog("SETTLE_PREDICTIONS", SPORTS_PROVIDER, async () => {
    const now = new Date();
    await prisma.prediction.updateMany({
      where: {
        status: "PENDING",
        OR: [{ game: { scheduledAt: { lte: now } } }, { game: { status: { in: ["LIVE", "FINAL"] } } }],
      },
      data: { status: "LOCKED", lockedAt: now },
    });

    const predictions = await prisma.prediction.findMany({
      where: { game: { status: "FINAL" }, status: { in: ["LOCKED", "SETTLED", "VOIDED"] } },
      include: { game: { include: { homeTeam: true, awayTeam: true } }, settlement: true },
      orderBy: { publishedAt: "asc" },
      take: 1_000,
    });
    let processed = 0;
    for (const prediction of predictions) {
      let propValue: number | null | undefined;
      if (prediction.marketType === "PLAYER_PROP") {
        if (!prediction.playerId) propValue = undefined;
        else {
          const stats = await prisma.playerGameStats.findUnique({
            where: { gameId_playerId: { gameId: prediction.gameId, playerId: prediction.playerId } },
          });
          if (!stats) continue;
          propValue = playerPropValue(prediction.marketKey, stats);
        }
      }
      const computed = computePredictionResult({
        marketType: prediction.marketType,
        selection: prediction.selection,
        line: prediction.line,
        homeScore: prediction.game.homeScore,
        awayScore: prediction.game.awayScore,
        playerPropValue: propValue,
      });
      const reason = settlementReason(prediction.marketType, computed, propValue);
      const result = prediction.settlement?.result ?? computed;

      await prisma.$transaction(async (tx) => {
        await tx.predictionSettlement.upsert({
          where: { predictionId: prediction.id },
          update: {},
          create: {
            predictionId: prediction.id,
            result,
            settlementReason: reason,
            settlementSource: prediction.marketType === "PLAYER_PROP" ? `${SPORTS_PROVIDER}:player-stats` : `${SPORTS_PROVIDER}:final-score`,
            settlementVersion: 1,
            settledAt: now,
          },
        });
        await tx.prediction.update({
          where: { id: prediction.id },
          data: { status: result === "VOID" ? "VOIDED" : "SETTLED", result, settledAt: prediction.settledAt ?? now },
        });
      });

      await recordSettlementRewards(prediction.userId, result, prediction.oddsAtCreation, prediction.id);
      await checkAchievements(prediction.userId);
      const preferences = await prisma.notificationPreference.findUnique({ where: { userId: prediction.userId } });
      if (preferences?.predictionSettled ?? true) {
        await prisma.notification.upsert({
          where: { dedupeKey: `prediction-settled:${prediction.id}` },
          update: {},
          create: {
            userId: prediction.userId,
            type: "PREDICTION_SETTLED",
            title: result === "WIN" ? "Prediction won 🏈" : result === "PUSH" ? "Prediction pushed" : result === "VOID" ? "Prediction voided" : "Prediction lost",
            body: `${prediction.game.awayTeam.abbreviation} at ${prediction.game.homeTeam.abbreviation} — ${prediction.selection} settled ${result}.`,
            link: `/predictions/${prediction.id}`,
            dedupeKey: `prediction-settled:${prediction.id}`,
          },
        });
      }
      processed++;
    }
    return { processed };
  });
}

export async function processReferrals(): Promise<JobResult> {
  return withLog("PROCESS_GAMIFICATION", "core", async () => {
    const signupEvents = await prisma.referralEvent.findMany({
      where: { type: "SIGNUP" },
      include: { referral: true },
    });
    let processed = 0;
    for (const event of signupEvents) {
      const wins = await prisma.prediction.count({
        where: { userId: event.referredUserId, result: "WIN", oddsAtCreation: { gte: 1.6 }, status: "SETTLED" },
      });
      if (wins < 5) continue;
      await prisma.referralEvent.upsert({
        where: {
          referralId_referredUserId_type: {
            referralId: event.referralId,
            referredUserId: event.referredUserId,
            type: "ACTIVATED",
          },
        },
        update: { rewardPaid: true, rewardCoins: 500 },
        create: {
          referralId: event.referralId,
          referredUserId: event.referredUserId,
          type: "ACTIVATED",
          rewardPaid: true,
          rewardCoins: 500,
        },
      });
      await prisma.referralEvent.update({ where: { id: event.id }, data: { rewardPaid: true } });
      const reward = await grantXpAndCoins(
        event.referral.userId,
        200,
        500,
        "REFERRAL",
        `Referral activated: ${event.referredUserId.slice(0, 8)}`,
        { type: "referral-activation", id: `${event.referralId}:${event.referredUserId}` },
      );
      await prisma.notification.upsert({
        where: { dedupeKey: `referral-activated:${event.referralId}:${event.referredUserId}` },
        update: {},
        create: {
          userId: event.referral.userId,
          type: "REFERRAL_REWARD",
          title: "Referral reward!",
          body: "A friend activated — you earned 500 coins.",
          dedupeKey: `referral-activated:${event.referralId}:${event.referredUserId}`,
        },
      });
      if (!reward.duplicate) processed++;
    }
    return { processed };
  });
}

export async function sendFollowNotifications(): Promise<JobResult> {
  return withLog("SEND_NOTIFICATIONS", "core", async () => {
    const recent = await prisma.prediction.findMany({
      where: { publishedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1_000) } },
      include: {
        user: {
          include: {
            profile: true,
            followers: { where: { notifyOnPrediction: true }, select: { followerId: true } },
          },
        },
      },
      take: 100,
    });
    let processed = 0;
    for (const prediction of recent) {
      for (const follow of prediction.user.followers) {
        const preferences = await prisma.notificationPreference.findUnique({ where: { userId: follow.followerId } });
        if (!(preferences?.followedUserPrediction ?? true)) continue;
        const dedupeKey = `followed-prediction:${follow.followerId}:${prediction.id}`;
        const existing = await prisma.notification.findUnique({ where: { dedupeKey }, select: { id: true } });
        await prisma.notification.upsert({
          where: { dedupeKey },
          update: {},
          create: {
            userId: follow.followerId,
            type: "FOLLOWED_USER_PREDICTION",
            title: "New prediction from someone you follow",
            body: `@${prediction.user.profile?.username ?? "predictor"} published a pick.`,
            link: `/predictions/${prediction.id}`,
            dedupeKey,
          },
        });
        if (!existing) processed++;
      }
    }
    return { processed };
  });
}
