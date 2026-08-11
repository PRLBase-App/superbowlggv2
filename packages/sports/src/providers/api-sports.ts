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

type JsonObject = Record<string, unknown>;

interface ApiEnvelope<T> {
  errors?: unknown;
  results?: number;
  response?: T;
}

const LEAGUE_IDS = { NFL: 1, NCAAF: 2 } as const;

function object(value: unknown): JsonObject {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as JsonObject) : {};
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function number(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) return Number(value);
  return null;
}

function bool(value: unknown): boolean {
  return value === true;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function errorsPresent(value: unknown): boolean {
  if (Array.isArray(value)) return value.length > 0;
  if (value && typeof value === "object") return Object.keys(value as JsonObject).length > 0;
  return Boolean(value);
}

function coverage(value: unknown): CoverageDTO {
  const root = object(value);
  const games = object(root.games);
  const gameStats = object(games.statisitcs ?? games.statistics);
  const statistics = object(root.statistics);
  const season = object(statistics.season);
  return {
    events: bool(games.events),
    teamGameStats: bool(gameStats.teams),
    playerGameStats: bool(gameStats.players),
    seasonPlayerStats: bool(season.players),
    players: bool(root.players),
    injuries: bool(root.injuries),
    standings: bool(root.standings),
  };
}

function parseSeason(value: unknown): SeasonDTO | null {
  const row = object(value);
  const year = number(row.year);
  const start = text(row.start);
  const end = text(row.end);
  if (year == null || !start || !end) return null;
  return { year, start, end, current: bool(row.current), coverage: coverage(row.coverage) };
}

function gameStatus(short: string | null): GameDTO["status"] {
  if (["Q1", "Q2", "Q3", "Q4", "1Q", "2Q", "3Q", "4Q", "HT", "OT", "BT", "END"].includes(short ?? "")) return "LIVE";
  if (["FT", "AOT", "FINAL"].includes(short ?? "")) return "FINAL";
  if (short === "PST") return "POSTPONED";
  if (short === "CANC") return "CANCELLED";
  if (short === "SUSP") return "SUSPENDED";
  return "SCHEDULED";
}

function seasonType(stage: string): GameDTO["seasonType"] {
  const normalized = stage.toLowerCase();
  if (normalized.includes("preseason")) return "PRE";
  if (normalized.includes("post") || normalized.includes("playoff") || normalized.includes("super bowl")) return "POST";
  return "REGULAR";
}

function weekNumber(value: unknown): number {
  const raw = text(value);
  const parsed = raw?.match(/\d+/)?.[0];
  return parsed ? Number(parsed) : 0;
}

function splitName(name: string): [string | null, string | null] {
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) return [name, null];
  return [parts[0] ?? null, parts.slice(1).join(" ") || null];
}

export class ApiSportsProvider implements SportsProvider {
  readonly name = "api-sports";
  readonly usage: ProviderUsage = {
    dailyLimit: null,
    dailyRemaining: null,
    minuteLimit: null,
    minuteRemaining: null,
  };

  constructor(
    private readonly apiKey: string,
    private readonly baseUrl = "https://v1.american-football.api-sports.io",
    private readonly configuredSeason?: number,
  ) {}

  private async get<T>(path: string, params: Record<string, string | number | boolean | undefined> = {}): Promise<T> {
    const url = new URL(path, `${this.baseUrl.replace(/\/$/, "")}/`);
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
    const response = await fetch(url, {
      headers: { "x-apisports-key": this.apiKey },
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    this.usage.dailyLimit = number(response.headers.get("x-ratelimit-requests-limit"));
    this.usage.dailyRemaining = number(response.headers.get("x-ratelimit-requests-remaining"));
    this.usage.minuteLimit = number(response.headers.get("x-ratelimit-limit"));
    this.usage.minuteRemaining = number(response.headers.get("x-ratelimit-remaining"));
    if (!response.ok) throw new Error(`API-Sports request failed (${response.status})`);
    const payload = (await response.json()) as ApiEnvelope<T>;
    if (errorsPresent(payload.errors)) throw new Error(`API-Sports rejected ${path}: ${JSON.stringify(payload.errors).slice(0, 500)}`);
    if (payload.response === undefined) throw new Error(`API-Sports returned no response for ${path}`);
    return payload.response;
  }

  async getLeagues(): Promise<LeagueDTO[]> {
    const rows = await this.get<unknown[]>("leagues");
    return rows.flatMap((value): LeagueDTO[] => {
      const row = object(value);
      const league = object(row.league);
      const country = object(row.country);
      const providerId = number(league.id);
      const name = text(league.name);
      if (providerId == null || !name) return [];
      const slug: LeagueDTO["slug"] = providerId === LEAGUE_IDS.NCAAF ? "NCAAF" : "NFL";
      return [{
        providerId: String(providerId),
        slug,
        name,
        shortName: slug,
        country: text(country.code) ?? text(country.name) ?? "US",
        logoUrl: text(league.logo),
        seasons: Array.isArray(row.seasons) ? row.seasons.flatMap((season) => parseSeason(season) ?? []) : [],
      }];
    });
  }

  async getCurrentSeason(leagueSlug: "NFL" | "NCAAF"): Promise<SeasonDTO> {
    const rows = await this.get<unknown[]>("leagues", {
      id: LEAGUE_IDS[leagueSlug],
      current: this.configuredSeason == null ? true : undefined,
    });
    const seasons = rows.flatMap((value) => {
      const candidates = object(value).seasons;
      return Array.isArray(candidates) ? candidates.flatMap((season) => parseSeason(season) ?? []) : [];
    });
    const selected = this.configuredSeason == null
      ? seasons.find((season) => season.current) ?? seasons.sort((a, b) => b.year - a.year)[0]
      : seasons.find((season) => season.year === this.configuredSeason);
    if (!selected) {
      const qualifier = this.configuredSeason == null ? "current" : `configured ${this.configuredSeason}`;
      throw new Error(`API-Sports has no ${qualifier} ${leagueSlug} season`);
    }
    // `isCurrent` in our database means the active provider dataset. Preserve
    // the provider dates/coverage while allowing a plan-limited historical
    // season to be selected explicitly without presenting invented data.
    return this.configuredSeason == null ? selected : { ...selected, current: true };
  }

  async getTeams(leagueSlug: "NFL" | "NCAAF", seasonYear: number): Promise<TeamDTO[]> {
    const rows = await this.get<unknown[]>("teams", { league: LEAGUE_IDS[leagueSlug], season: seasonYear });
    return rows.flatMap((value): TeamDTO[] => {
      const row = object(value);
      const id = number(row.id);
      const name = text(row.name);
      if (id == null || !name) return [];
      const code = text(row.code) ?? name.split(/\s+/).map((part) => part[0]).join("").slice(0, 4).toUpperCase();
      return [{
        providerId: String(id),
        leagueSlug,
        slug: slugify(name),
        name,
        shortName: name.split(/\s+/).at(-1) ?? name,
        abbreviation: code,
        city: text(row.city),
        stadium: text(row.stadium),
        conference: text(row.conference),
        division: text(row.division),
        logoUrl: text(row.logo),
      }];
    });
  }

  async getSchedule(leagueSlug: "NFL" | "NCAAF", seasonYear: number, week?: number): Promise<GameDTO[]> {
    const rows = await this.get<unknown[]>("games", { league: LEAGUE_IDS[leagueSlug], season: seasonYear });
    const games = rows.flatMap((value) => this.mapGame(value, leagueSlug));
    return week === undefined ? games : games.filter((game) => game.week === week);
  }

  async getGames(leagueSlug: "NFL" | "NCAAF", status?: GameDTO["status"]): Promise<GameDTO[]> {
    const season = await this.getCurrentSeason(leagueSlug);
    const games = await this.getSchedule(leagueSlug, season.year);
    return status ? games.filter((game) => game.status === status) : games;
  }

  async getGame(providerGameId: string): Promise<GameDTO | null> {
    const rows = await this.get<unknown[]>("games", { id: providerGameId });
    return this.mapGame(rows[0], "NFL")[0] ?? null;
  }

  async getStandings(leagueSlug: "NFL" | "NCAAF", seasonYear: number): Promise<StandingDTO[]> {
    const rows = await this.get<unknown[]>("standings", { league: LEAGUE_IDS[leagueSlug], season: seasonYear });
    return rows.flatMap((value): StandingDTO[] => {
      const row = object(value);
      const team = object(row.team);
      const providerId = number(team.id);
      if (providerId == null) return [];
      const points = object(row.points);
      return [{
        teamProviderId: String(providerId),
        conference: text(row.conference),
        division: text(row.division),
        divisionRank: number(row.position),
        conferenceRank: null,
        wins: number(row.won) ?? 0,
        losses: number(row.lost) ?? 0,
        ties: number(row.ties) ?? 0,
        pointsFor: number(points.for) ?? 0,
        pointsAgainst: number(points.against) ?? 0,
        streak: text(row.streak),
      }];
    });
  }

  async getPlayers(teamProviderId?: string, seasonYear?: number): Promise<PlayerDTO[]> {
    if (!teamProviderId && !seasonYear) throw new Error("API-Sports players require a team or season");
    const rows = await this.get<unknown[]>("players", { team: teamProviderId, season: seasonYear });
    return rows.flatMap((value): PlayerDTO[] => {
      const row = object(value);
      const providerId = number(row.id);
      const name = text(row.name);
      if (providerId == null || !name) return [];
      const [firstName, lastName] = splitName(name);
      return [{
        providerId: String(providerId),
        teamProviderId: teamProviderId ?? null,
        slug: `${slugify(name)}-${providerId}`,
        name,
        firstName,
        lastName,
        position: text(row.position),
        jerseyNumber: number(row.number),
        height: text(row.height),
        weight: number(text(row.weight)?.match(/\d+/)?.[0]),
        college: text(row.college),
        imageUrl: text(row.image),
        status: text(row.group),
      }];
    });
  }

  async getInjuries(teamProviderId: string): Promise<InjuryDTO[]> {
    const rows = await this.get<unknown[]>("injuries", { team: teamProviderId });
    return rows.flatMap((value): InjuryDTO[] => {
      const row = object(value);
      const player = object(row.player);
      const team = object(row.team);
      const playerId = number(player.id);
      if (playerId == null) return [];
      const date = text(row.date) ?? new Date().toISOString();
      return [{
        playerProviderId: String(playerId),
        teamProviderId: number(team.id)?.toString() ?? teamProviderId,
        gameProviderId: null,
        status: text(row.status) ?? "UNKNOWN",
        bodyPart: text(row.type),
        description: text(row.description),
        reportedAt: date,
      }];
    });
  }

  async getGameStats(providerGameId: string): Promise<GameStatsDTO[]> {
    const game = await this.getGame(providerGameId);
    if (!game) return [];
    const rows = await this.get<unknown[]>("games/statistics/teams", { id: providerGameId });
    return rows.flatMap((value): GameStatsDTO[] => {
      const row = object(value);
      const team = object(row.team);
      const providerId = number(team.id);
      if (providerId == null) return [];
      const stats = this.statistics(row.statistics);
      return [{
        gameProviderId: providerGameId,
        teamProviderId: String(providerId),
        isHome: String(providerId) === game.homeTeamProviderId,
        totalYards: stats.get("total yards") ?? null,
        passYards: stats.get("passing yards") ?? stats.get("net passing yards") ?? null,
        rushYards: stats.get("rushing yards") ?? null,
        turnovers: stats.get("turnovers") ?? null,
        firstDowns: stats.get("first downs") ?? null,
      }];
    });
  }

  async getPlayerGameStats(providerGameId: string): Promise<PlayerGameStatsDTO[]> {
    const rows = await this.get<unknown[]>("games/statistics/players", { id: providerGameId });
    return rows.flatMap((value): PlayerGameStatsDTO[] => {
      const row = object(value);
      const player = object(row.player);
      const team = object(row.team);
      const providerId = number(player.id);
      if (providerId == null) return [];
      const stats = this.statistics(row.statistics);
      return [{
        gameProviderId: providerGameId,
        playerProviderId: String(providerId),
        teamProviderId: number(team.id)?.toString() ?? null,
        passingYards: stats.get("passing.yards") ?? stats.get("passing.passing yards") ?? stats.get("passing yards") ?? null,
        passingTds: stats.get("passing.touchdowns") ?? stats.get("passing.passing touchdowns") ?? stats.get("passing touchdowns") ?? null,
        interceptions: stats.get("passing.interceptions") ?? stats.get("interceptions") ?? null,
        rushingYards: stats.get("rushing.yards") ?? stats.get("rushing.rushing yards") ?? stats.get("rushing yards") ?? null,
        rushingTds: stats.get("rushing.touchdowns") ?? stats.get("rushing.rushing touchdowns") ?? stats.get("rushing touchdowns") ?? null,
        receptions: stats.get("receiving.receptions") ?? stats.get("receptions") ?? null,
        receivingYards: stats.get("receiving.yards") ?? stats.get("receiving.receiving yards") ?? stats.get("receiving yards") ?? null,
        receivingTds: stats.get("receiving.touchdowns") ?? stats.get("receiving.receiving touchdowns") ?? stats.get("receiving touchdowns") ?? null,
        fantasyPoints: stats.get("fantasy.fantasy points") ?? stats.get("fantasy points") ?? null,
      }];
    });
  }

  async getGameEvents(providerGameId: string): Promise<GameEventDTO[]> {
    const rows = await this.get<unknown[]>("games/events", { id: providerGameId });
    return rows.map((value): GameEventDTO => {
      const row = object(value);
      const team = object(row.team);
      const player = object(row.player);
      const score = object(row.score);
      return {
        gameProviderId: providerGameId,
        quarter: text(row.quarter),
        clock: text(row.minute),
        teamProviderId: number(team.id)?.toString() ?? null,
        playerProviderId: number(player.id)?.toString() ?? null,
        type: text(row.type) ?? "EVENT",
        description: text(row.comment),
        homeScore: number(score.home),
        awayScore: number(score.away),
      };
    });
  }

  private mapGame(value: unknown, leagueSlug: "NFL" | "NCAAF"): GameDTO[] {
    const row = object(value);
    const game = object(row.game);
    const league = object(row.league);
    const teams = object(row.teams);
    const home = object(teams.home);
    const away = object(teams.away);
    const scores = object(row.scores);
    const homeScores = object(scores.home);
    const awayScores = object(scores.away);
    const date = object(game.date);
    const venue = object(game.venue);
    const status = object(game.status);
    const providerId = number(game.id);
    const homeId = number(home.id);
    const awayId = number(away.id);
    const homeName = text(home.name);
    const awayName = text(away.name);
    const timestamp = number(date.timestamp);
    if (providerId == null || homeId == null || awayId == null || !homeName || !awayName || timestamp == null) return [];
    const stage = text(game.stage) ?? "Regular Season";
    const short = text(status.short);
    const quarterMatch = short?.match(/^(?:Q(\d)|(\d)Q)$/);
    return [{
      providerId: String(providerId),
      leagueSlug,
      seasonYear: number(league.season) ?? new Date(timestamp * 1000).getUTCFullYear(),
      week: weekNumber(game.week),
      stage,
      seasonType: seasonType(stage),
      homeTeamProviderId: String(homeId),
      awayTeamProviderId: String(awayId),
      homeTeamName: homeName,
      awayTeamName: awayName,
      scheduledAt: new Date(timestamp * 1000).toISOString(),
      status: gameStatus(short),
      homeScore: number(homeScores.total) ?? 0,
      awayScore: number(awayScores.total) ?? 0,
      quarter: quarterMatch ? Number(quarterMatch[1] ?? quarterMatch[2]) : short === "OT" ? 5 : null,
      clock: text(status.timer),
      venue: text(venue.name),
      broadcast: null,
    }];
  }

  private statistics(value: unknown): Map<string, number> {
    const output = new Map<string, number>();
    const visit = (entry: unknown, prefix = "") => {
      if (Array.isArray(entry)) {
        for (const item of entry) visit(item, prefix);
        return;
      }
      const row = object(entry);
      const name = text(row.name);
      const valueNumber = number(row.value ?? row.total);
      if (name && valueNumber != null) {
        const key = name.toLowerCase();
        output.set(prefix ? `${prefix}.${key}` : key, valueNumber);
        if (!output.has(key)) output.set(key, valueNumber);
      }
      const group = text(row.group) ?? (row.statistics ? name : null);
      const nestedPrefix = group ? [prefix, group.toLowerCase()].filter(Boolean).join(".") : prefix;
      for (const nested of [row.statistics, row.groups]) if (nested) visit(nested, nestedPrefix);
    };
    visit(value);
    return output;
  }
}
