import { parse } from "csv-parse/sync";
import type {
  CoverageDTO,
  GameDTO,
  GameEventDTO,
  GameStatsDTO,
  InjuryDTO,
  LeagueDTO,
  PlayerDTO,
  PlayerGameStatsDTO,
  ProviderUsage,
  SeasonDTO,
  SportsProvider,
  StandingDTO,
  TeamDTO,
} from "../types";

type CsvRow = Record<string, string>;

const RELEASE_BASE = "https://github.com/nflverse/nflverse-data/releases/download";
const ESPN_SCOREBOARD = "https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard";
const ESPN_USER_AGENT = "okhttp/4.9.0";

/** ESPN team IDs are stable across seasons; values are canonical nflverse abbreviations. */
const ESPN_NFL_TEAM_IDS: Record<number, string> = {
  1: "ATL", 2: "BUF", 3: "CHI", 4: "CIN", 5: "CLE", 6: "DAL", 7: "DEN", 8: "DET",
  9: "GB", 10: "TEN", 11: "IND", 12: "KC", 13: "LV", 14: "LAR", 15: "MIA", 16: "MIN",
  17: "NE", 18: "NO", 19: "NYG", 20: "NYJ", 21: "PHI", 22: "ARI", 23: "PIT", 24: "LAC",
  25: "SF", 26: "SEA", 27: "TB", 28: "WAS", 29: "CAR", 30: "JAX", 33: "BAL", 34: "HOU",
};
const CURRENT_NFL_TEAMS = new Set([
  "ARI", "ATL", "BAL", "BUF", "CAR", "CHI", "CIN", "CLE",
  "DAL", "DEN", "DET", "GB", "HOU", "IND", "JAX", "KC",
  "LAC", "LAR", "LV", "MIA", "MIN", "NE", "NO", "NYG",
  "NYJ", "PHI", "PIT", "SEA", "SF", "TB", "TEN", "WAS",
]);
const TEAM_ALIASES: Record<string, string> = {
  AZ: "ARI",
  LA: "LAR",
  OAK: "LV",
  SD: "LAC",
  STL: "LAR",
};
const COVERAGE: CoverageDTO = {
  events: false,
  teamGameStats: true,
  playerGameStats: true,
  seasonPlayerStats: true,
  players: true,
  injuries: false,
  standings: true,
};

function currentNflSeasonYear(now = new Date()): number {
  return now.getUTCMonth() <= 1 ? now.getUTCFullYear() - 1 : now.getUTCFullYear();
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function canonicalTeamId(value: string): string {
  return TEAM_ALIASES[value] ?? value;
}

function value(row: CsvRow, key: string): string | null {
  const entry = row[key]?.trim();
  return entry ? entry : null;
}

function numeric(row: CsvRow, key: string): number | null {
  const entry = value(row, key);
  if (entry == null) return null;
  const parsed = Number(entry);
  return Number.isFinite(parsed) ? parsed : null;
}

function integer(row: CsvRow, key: string): number | null {
  const parsed = numeric(row, key);
  return parsed == null ? null : Math.trunc(parsed);
}

function easternLocalToUtc(date: string, time: string): Date {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const utcGuess = Date.UTC(year ?? 1970, (month ?? 1) - 1, day ?? 1, hour ?? 13, minute ?? 0);
  const offsetPart = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    timeZoneName: "shortOffset",
  }).formatToParts(new Date(utcGuess)).find((part) => part.type === "timeZoneName")?.value;
  const match = offsetPart?.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
  const offsetMinutes = match
    ? (match[1] === "+" ? 1 : -1) * (Number(match[2]) * 60 + Number(match[3] ?? 0))
    : -300;
  return new Date(utcGuess - offsetMinutes * 60_000);
}

function seasonType(gameType: string | null): GameDTO["seasonType"] {
  if (gameType === "PRE") return "PRE";
  if (gameType === "REG") return "REGULAR";
  return "POST";
}

function stageName(gameType: string | null): string {
  const stages: Record<string, string> = {
    PRE: "Preseason",
    REG: "Regular Season",
    WC: "Wild Card",
    DIV: "Divisional Round",
    CON: "Conference Championship",
    SB: "Super Bowl",
  };
  return stages[gameType ?? ""] ?? gameType ?? "NFL";
}

function gameStatus(row: CsvRow, kickoff: Date, now = new Date()): GameDTO["status"] {
  const hasScores = integer(row, "home_score") != null && integer(row, "away_score") != null;
  if (!hasScores) return "SCHEDULED";
  const elapsed = now.getTime() - kickoff.getTime();
  if (elapsed >= 6 * 60 * 60 * 1_000) return "FINAL";
  if (elapsed >= 0) return "LIVE";
  return "SCHEDULED";
}

function formatHeight(inches: number | null): string | null {
  if (inches == null || inches <= 0) return null;
  return `${Math.floor(inches / 12)}'${inches % 12}\"`;
}

export class NflverseProvider implements SportsProvider {
  readonly name = "nflverse";
  readonly usage: ProviderUsage = {
    dailyLimit: null,
    dailyRemaining: null,
    minuteLimit: null,
    minuteRemaining: null,
  };

  private readonly cache = new Map<string, { expiresAt: number; rows: CsvRow[] }>();

  constructor(private readonly fetcher: typeof fetch = fetch, private readonly now: () => Date = () => new Date()) {}

  private async csv(path: string, ttlMs: number, optional = false): Promise<CsvRow[]> {
    const cached = this.cache.get(path);
    if (cached && cached.expiresAt > Date.now()) return cached.rows;
    const response = await this.fetcher(`${RELEASE_BASE}/${path}`, {
      headers: { "user-agent": "Superbowl.gg/2.0 (+https://superbowl.gg)" },
      cache: "no-store",
      signal: AbortSignal.timeout(30_000),
    });
    if (optional && response.status === 404) return [];
    if (!response.ok) throw new Error(`nflverse request failed for ${path} (${response.status})`);
    const rows = parse(await response.text(), {
      columns: true,
      skip_empty_lines: true,
      relax_column_count: true,
      bom: true,
    }) as CsvRow[];
    this.cache.set(path, { expiresAt: Date.now() + ttlMs, rows });
    return rows;
  }

  /**
   * Preseason schedule from ESPN's public scoreboard API. nflverse's games.csv
   * covers regular and postseason games only, so preseason games are merged in
   * from ESPN for the current season. Best-effort: any fetch/parse failure
   * returns an empty list so the regular-season sync is never blocked.
   */
  private async preseasonSchedule(seasonYear: number): Promise<GameDTO[]> {
    const cacheKey = `espn:scoreboard:${seasonYear}`;
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) return cached.rows as unknown as GameDTO[];
    if (seasonYear !== currentNflSeasonYear(this.now())) return [];

    const url = `${ESPN_SCOREBOARD}?dates=${seasonYear}0801-${seasonYear}0905`;
    try {
      const response = await this.fetcher(url, {
        headers: { "user-agent": ESPN_USER_AGENT },
        cache: "no-store",
        signal: AbortSignal.timeout(30_000),
      });
      if (!response.ok) return [];
      const payload = (await response.json()) as { events?: unknown[] };
      const games = (payload.events ?? [])
        .map((event) => this.mapEspnPreseasonGame(event, seasonYear))
        .filter((game): game is GameDTO => game !== null);
      this.cache.set(cacheKey, { expiresAt: Date.now() + 10 * 60_000, rows: games as unknown as CsvRow[] });
      return games;
    } catch {
      return [];
    }
  }

  private mapEspnPreseasonGame(event: unknown, seasonYear: number): GameDTO | null {
    const eventObject = event as {
      id?: string;
      date?: string;
      week?: { number?: number };
      season?: { type?: number };
      status?: { type?: { state?: string } };
      competitions?: Array<{
        venue?: { fullName?: string };
        broadcasts?: Array<{ names?: string[] }>;
        competitors?: Array<{ homeAway?: string; team?: { id?: string; abbreviation?: string }; score?: string }>;
      }>;
    };
    if (!eventObject.id || !eventObject.date) return null;
    if (eventObject.season?.type !== 1) return null; // 1 = preseason

    const competitors = eventObject.competitions?.[0]?.competitors ?? [];
    const home = competitors.find((entry) => entry.homeAway === "home");
    const away = competitors.find((entry) => entry.homeAway === "away");
    const homeAbbr = home?.team?.id ? ESPN_NFL_TEAM_IDS[Number(home.team.id)] : undefined;
    const awayAbbr = away?.team?.id ? ESPN_NFL_TEAM_IDS[Number(away.team.id)] : undefined;
    if (!homeAbbr || !awayAbbr) return null;

    const state = eventObject.status?.type?.state;
    const status: GameDTO["status"] =
      state === "post" ? "FINAL" : state === "in" ? "LIVE" : "SCHEDULED";
    const broadcasts = eventObject.competitions?.[0]?.broadcasts ?? [];
    const broadcast = broadcasts.flatMap((entry) => entry.names ?? []).join(", ") || null;

    return {
      providerId: `espn-${eventObject.id}`,
      leagueSlug: "NFL",
      seasonYear,
      week: eventObject.week?.number ?? 0,
      stage: "Preseason",
      seasonType: "PRE",
      homeTeamProviderId: homeAbbr,
      awayTeamProviderId: awayAbbr,
      homeTeamName: homeAbbr,
      awayTeamName: awayAbbr,
      scheduledAt: eventObject.date,
      status,
      homeScore: Number(home?.score ?? 0) || 0,
      awayScore: Number(away?.score ?? 0) || 0,
      quarter: null,
      clock: null,
      venue: eventObject.competitions?.[0]?.venue?.fullName ?? null,
      broadcast,
    };
  }

  async getLeagues(): Promise<LeagueDTO[]> {
    const season = await this.getCurrentSeason("NFL");
    return [{
      providerId: "NFL",
      slug: "NFL",
      name: "National Football League",
      shortName: "NFL",
      country: "US",
      logoUrl: "https://raw.githubusercontent.com/nflverse/nflverse-pbp/master/NFL.png",
      seasons: [season],
    }];
  }

  async getCurrentSeason(leagueSlug: "NFL" | "NCAAF"): Promise<SeasonDTO> {
    if (leagueSlug !== "NFL") throw new Error("nflverse provider currently supports NFL only");
    const year = currentNflSeasonYear(this.now());
    return {
      year,
      start: `${year}-08-01T00:00:00.000Z`,
      end: `${year + 1}-02-28T23:59:59.999Z`,
      current: true,
      coverage: COVERAGE,
    };
  }

  async getTeams(leagueSlug: "NFL" | "NCAAF", _seasonYear: number): Promise<TeamDTO[]> {
    if (leagueSlug !== "NFL") return [];
    const rows = await this.csv("teams/teams_colors_logos.csv", 7 * 86_400_000);
    return rows.flatMap((row): TeamDTO[] => {
      const abbreviation = value(row, "team_abbr");
      const name = value(row, "team_name");
      const shortName = value(row, "team_nick");
      if (!abbreviation || !CURRENT_NFL_TEAMS.has(abbreviation) || !name || !shortName) return [];
      return [{
        providerId: abbreviation,
        leagueSlug: "NFL",
        slug: slugify(name),
        name,
        shortName,
        abbreviation,
        city: name.endsWith(shortName) ? name.slice(0, -shortName.length).trim() : null,
        stadium: null,
        conference: value(row, "team_conf"),
        division: value(row, "team_division"),
        primaryColor: value(row, "team_color"),
        secondaryColor: value(row, "team_color2"),
        logoUrl: value(row, "team_logo_espn") ?? value(row, "team_logo_wikipedia"),
      }];
    });
  }

  private mapGame(row: CsvRow): GameDTO | null {
    const providerId = value(row, "game_id");
    const seasonYear = integer(row, "season");
    const week = integer(row, "week");
    const rawHomeTeam = value(row, "home_team");
    const rawAwayTeam = value(row, "away_team");
    const gameday = value(row, "gameday");
    if (!providerId || seasonYear == null || week == null || !rawHomeTeam || !rawAwayTeam || !gameday) return null;
    const homeTeam = canonicalTeamId(rawHomeTeam);
    const awayTeam = canonicalTeamId(rawAwayTeam);
    const kickoff = easternLocalToUtc(gameday, value(row, "gametime") ?? "13:00");
    const type = value(row, "game_type");
    return {
      providerId,
      leagueSlug: "NFL",
      seasonYear,
      week,
      stage: stageName(type),
      seasonType: seasonType(type),
      homeTeamProviderId: homeTeam,
      awayTeamProviderId: awayTeam,
      homeTeamName: homeTeam,
      awayTeamName: awayTeam,
      scheduledAt: kickoff.toISOString(),
      status: gameStatus(row, kickoff, this.now()),
      homeScore: integer(row, "home_score") ?? 0,
      awayScore: integer(row, "away_score") ?? 0,
      quarter: null,
      clock: null,
      venue: value(row, "stadium"),
      broadcast: null,
    };
  }

  async getSchedule(leagueSlug: "NFL" | "NCAAF", seasonYear: number, week?: number): Promise<GameDTO[]> {
    if (leagueSlug !== "NFL") return [];
    const [rows, preseason] = await Promise.all([
      this.csv("schedules/games.csv", 4 * 60_000),
      this.preseasonSchedule(seasonYear),
    ]);
    const games = rows.flatMap((row) => {
      const game = this.mapGame(row);
      if (!game || game.seasonYear !== seasonYear || (week != null && game.week !== week)) return [];
      return [game];
    });
    const preseasonFiltered = preseason.filter((game) => week == null || game.week === week);
    return [...preseasonFiltered, ...games];
  }

  async getGames(leagueSlug: "NFL" | "NCAAF", status?: GameDTO["status"]): Promise<GameDTO[]> {
    const season = await this.getCurrentSeason(leagueSlug);
    const games = await this.getSchedule(leagueSlug, season.year);
    return status ? games.filter((game) => game.status === status) : games;
  }

  async getGame(providerGameId: string): Promise<GameDTO | null> {
    const season = await this.getCurrentSeason("NFL");
    return (await this.getSchedule("NFL", season.year)).find((game) => game.providerId === providerGameId) ?? null;
  }

  async getStandings(leagueSlug: "NFL" | "NCAAF", seasonYear: number): Promise<StandingDTO[]> {
    if (leagueSlug !== "NFL") return [];
    const [games, teams] = await Promise.all([this.getSchedule("NFL", seasonYear), this.getTeams("NFL", seasonYear)]);
    const teamById = new Map(teams.map((team) => [team.providerId, team]));
    const records = new Map<string, { wins: number; losses: number; ties: number; pointsFor: number; pointsAgainst: number; results: string[] }>();
    for (const team of teams) records.set(team.providerId, { wins: 0, losses: 0, ties: 0, pointsFor: 0, pointsAgainst: 0, results: [] });
    for (const game of games.filter((entry) => entry.seasonType === "REGULAR" && entry.status === "FINAL").sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))) {
      const home = records.get(game.homeTeamProviderId);
      const away = records.get(game.awayTeamProviderId);
      if (!home || !away) continue;
      home.pointsFor += game.homeScore; home.pointsAgainst += game.awayScore;
      away.pointsFor += game.awayScore; away.pointsAgainst += game.homeScore;
      if (game.homeScore === game.awayScore) {
        home.ties++; away.ties++; home.results.push("T"); away.results.push("T");
      } else if (game.homeScore > game.awayScore) {
        home.wins++; away.losses++; home.results.push("W"); away.results.push("L");
      } else {
        away.wins++; home.losses++; away.results.push("W"); home.results.push("L");
      }
    }
    const rank = (ids: string[]) => new Map(ids.sort((a, b) => {
      const left = records.get(a)!; const right = records.get(b)!;
      const leftPct = (left.wins + left.ties * 0.5) / Math.max(1, left.wins + left.losses + left.ties);
      const rightPct = (right.wins + right.ties * 0.5) / Math.max(1, right.wins + right.losses + right.ties);
      return rightPct - leftPct || (right.pointsFor - right.pointsAgainst) - (left.pointsFor - left.pointsAgainst);
    }).map((id, index) => [id, index + 1]));
    const conferenceRanks = new Map<string, Map<string, number>>();
    const divisionRanks = new Map<string, Map<string, number>>();
    for (const conference of new Set(teams.map((team) => team.conference).filter(Boolean))) {
      conferenceRanks.set(conference!, rank(teams.filter((team) => team.conference === conference).map((team) => team.providerId)));
    }
    for (const division of new Set(teams.map((team) => team.division).filter(Boolean))) {
      divisionRanks.set(division!, rank(teams.filter((team) => team.division === division).map((team) => team.providerId)));
    }
    return teams.map((team) => {
      const record = records.get(team.providerId)!;
      const last = record.results.at(-1);
      let streakCount = 0;
      for (let index = record.results.length - 1; index >= 0 && record.results[index] === last; index--) streakCount++;
      return {
        teamProviderId: team.providerId,
        conference: team.conference,
        division: team.division,
        divisionRank: team.division ? divisionRanks.get(team.division)?.get(team.providerId) ?? null : null,
        conferenceRank: team.conference ? conferenceRanks.get(team.conference)?.get(team.providerId) ?? null : null,
        wins: record.wins,
        losses: record.losses,
        ties: record.ties,
        pointsFor: record.pointsFor,
        pointsAgainst: record.pointsAgainst,
        streak: last ? `${last}${streakCount}` : "—",
      };
    });
  }

  async getPlayers(teamProviderId?: string, seasonYear?: number): Promise<PlayerDTO[]> {
    const year = seasonYear ?? currentNflSeasonYear(this.now());
    const rows = await this.csv(`rosters/roster_${year}.csv`, 12 * 60 * 60_000, true);
    return rows.flatMap((row): PlayerDTO[] => {
      const providerId = value(row, "gsis_id");
      const name = value(row, "full_name");
      const rawTeam = value(row, "team");
      if (!providerId || !name || !rawTeam) return [];
      const team = canonicalTeamId(rawTeam);
      if (!CURRENT_NFL_TEAMS.has(team) || (teamProviderId && team !== canonicalTeamId(teamProviderId))) return [];
      return [{
        providerId,
        teamProviderId: team,
        slug: `${slugify(name)}-${slugify(providerId)}`,
        name,
        firstName: value(row, "first_name"),
        lastName: value(row, "last_name"),
        position: value(row, "position"),
        jerseyNumber: integer(row, "jersey_number"),
        height: formatHeight(integer(row, "height")),
        weight: integer(row, "weight"),
        college: value(row, "college"),
        imageUrl: value(row, "headshot_url"),
        status: value(row, "status_description_abbr") ?? value(row, "status"),
      }];
    });
  }

  async getInjuries(_teamProviderId: string): Promise<InjuryDTO[]> {
    return [];
  }

  async getGameStats(providerGameId: string): Promise<GameStatsDTO[]> {
    const season = Number(providerGameId.slice(0, 4));
    const rows = await this.csv(`stats_team/stats_team_week_${season}.csv`, 2 * 60 * 60_000, true);
    const game = await this.getGame(providerGameId);
    if (!game) return [];
    return rows.filter((row) => value(row, "game_id") === providerGameId).flatMap((row): GameStatsDTO[] => {
      const rawTeam = value(row, "team");
      if (!rawTeam) return [];
      const team = canonicalTeamId(rawTeam);
      const passYards = integer(row, "passing_yards");
      const rushYards = integer(row, "rushing_yards");
      return [{
        gameProviderId: providerGameId,
        teamProviderId: team,
        isHome: team === game.homeTeamProviderId,
        totalYards: passYards != null && rushYards != null ? passYards + rushYards : null,
        passYards,
        rushYards,
        turnovers: (integer(row, "passing_interceptions") ?? 0) + (integer(row, "fumbles_lost_total") ?? 0),
        firstDowns: (integer(row, "passing_first_downs") ?? 0) + (integer(row, "rushing_first_downs") ?? 0),
      }];
    });
  }

  async getPlayerGameStats(providerGameId: string): Promise<PlayerGameStatsDTO[]> {
    const season = Number(providerGameId.slice(0, 4));
    const rows = await this.csv(`stats_player/stats_player_week_${season}.csv`, 2 * 60 * 60_000, true);
    return rows.filter((row) => value(row, "game_id") === providerGameId).flatMap((row): PlayerGameStatsDTO[] => {
      const playerId = value(row, "player_id");
      if (!playerId) return [];
      return [{
        gameProviderId: providerGameId,
        playerProviderId: playerId,
        teamProviderId: value(row, "team") ? canonicalTeamId(value(row, "team")!) : null,
        passingYards: integer(row, "passing_yards"),
        passingTds: integer(row, "passing_tds"),
        interceptions: integer(row, "passing_interceptions"),
        rushingYards: integer(row, "rushing_yards"),
        rushingTds: integer(row, "rushing_tds"),
        receptions: integer(row, "receptions"),
        receivingYards: integer(row, "receiving_yards"),
        receivingTds: integer(row, "receiving_tds"),
        fantasyPoints: numeric(row, "fantasy_points"),
      }];
    });
  }

  async getGameEvents(_providerGameId: string): Promise<GameEventDTO[]> {
    return [];
  }
}

export const nflverseInternals = { currentNflSeasonYear, easternLocalToUtc, gameStatus, canonicalTeamId };
