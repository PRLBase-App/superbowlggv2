/** Provider-neutral American-football data contracts. */

export interface ProviderUsage {
  dailyLimit: number | null;
  dailyRemaining: number | null;
  minuteLimit: number | null;
  minuteRemaining: number | null;
}

export interface CoverageDTO {
  events: boolean;
  teamGameStats: boolean;
  playerGameStats: boolean;
  seasonPlayerStats: boolean;
  players: boolean;
  injuries: boolean;
  standings: boolean;
}

export interface SeasonDTO {
  year: number;
  start: string;
  end: string;
  current: boolean;
  coverage: CoverageDTO;
}

export interface LeagueDTO {
  providerId: string;
  slug: "NFL" | "NCAAF";
  name: string;
  shortName: string;
  country: string;
  logoUrl: string | null;
  seasons: SeasonDTO[];
}

export interface TeamDTO {
  providerId: string;
  leagueSlug: "NFL" | "NCAAF";
  slug: string;
  name: string;
  shortName: string;
  abbreviation: string;
  city: string | null;
  stadium: string | null;
  conference: string | null;
  division: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  logoUrl: string | null;
}

export interface GameDTO {
  providerId: string;
  leagueSlug: "NFL" | "NCAAF";
  seasonYear: number;
  week: number;
  stage: string;
  seasonType: "REGULAR" | "POST" | "PRE";
  homeTeamProviderId: string;
  awayTeamProviderId: string;
  homeTeamName: string;
  awayTeamName: string;
  scheduledAt: string;
  status: "SCHEDULED" | "LIVE" | "FINAL" | "POSTPONED" | "CANCELLED" | "SUSPENDED";
  homeScore: number;
  awayScore: number;
  quarter: number | null;
  clock: string | null;
  venue: string | null;
  broadcast: string | null;
}

export interface StandingDTO {
  teamProviderId: string;
  conference: string | null;
  division: string | null;
  divisionRank: number | null;
  conferenceRank: number | null;
  wins: number;
  losses: number;
  ties: number;
  pointsFor: number;
  pointsAgainst: number;
  streak: string | null;
}

export interface PlayerDTO {
  providerId: string;
  teamProviderId: string | null;
  slug: string;
  name: string;
  firstName: string | null;
  lastName: string | null;
  position: string | null;
  jerseyNumber: number | null;
  height: string | null;
  weight: number | null;
  college: string | null;
  imageUrl: string | null;
  status: string | null;
}

export interface InjuryDTO {
  playerProviderId: string;
  teamProviderId: string | null;
  gameProviderId: string | null;
  status: string;
  bodyPart: string | null;
  description: string | null;
  reportedAt: string;
}

export interface GameStatsDTO {
  gameProviderId: string;
  teamProviderId: string;
  isHome: boolean;
  totalYards: number | null;
  passYards: number | null;
  rushYards: number | null;
  turnovers: number | null;
  firstDowns: number | null;
}

export interface PlayerGameStatsDTO {
  gameProviderId: string;
  playerProviderId: string;
  teamProviderId: string | null;
  passingYards: number | null;
  passingTds: number | null;
  interceptions: number | null;
  rushingYards: number | null;
  rushingTds: number | null;
  receptions: number | null;
  receivingYards: number | null;
  receivingTds: number | null;
  fantasyPoints: number | null;
}

export interface GameEventDTO {
  gameProviderId: string;
  quarter: string | null;
  clock: string | null;
  teamProviderId: string | null;
  playerProviderId: string | null;
  type: string;
  description: string | null;
  homeScore: number | null;
  awayScore: number | null;
}

export interface SportsProvider {
  readonly name: string;
  readonly usage: ProviderUsage;
  getLeagues(): Promise<LeagueDTO[]>;
  getCurrentSeason(leagueSlug: "NFL" | "NCAAF"): Promise<SeasonDTO>;
  getTeams(leagueSlug: "NFL" | "NCAAF", seasonYear: number): Promise<TeamDTO[]>;
  getSchedule(leagueSlug: "NFL" | "NCAAF", seasonYear: number, week?: number): Promise<GameDTO[]>;
  getGames(leagueSlug: "NFL" | "NCAAF", status?: GameDTO["status"]): Promise<GameDTO[]>;
  getGame(providerGameId: string): Promise<GameDTO | null>;
  getStandings(leagueSlug: "NFL" | "NCAAF", seasonYear: number): Promise<StandingDTO[]>;
  getPlayers(teamProviderId?: string, seasonYear?: number): Promise<PlayerDTO[]>;
  getInjuries(teamProviderId: string): Promise<InjuryDTO[]>;
  getGameStats(providerGameId: string): Promise<GameStatsDTO[]>;
  getPlayerGameStats(providerGameId: string): Promise<PlayerGameStatsDTO[]>;
  getGameEvents(providerGameId: string): Promise<GameEventDTO[]>;
}
