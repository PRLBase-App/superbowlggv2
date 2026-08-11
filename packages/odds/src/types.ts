export type CoreOddsMarket = "h2h" | "spreads" | "totals";

export interface OddsOutcome {
  providerId: string;
  name: string;
  description: string | null;
  price: number;
  point: number | null;
}

export interface OddsMarket {
  key: string;
  lastUpdated: string;
  outcomes: OddsOutcome[];
}

export interface BookmakerOdds {
  key: string;
  title: string;
  lastUpdated: string;
  markets: OddsMarket[];
}

export interface GameOdds {
  providerEventId: string;
  commenceTime: string;
  awayTeam: string;
  homeTeam: string;
  bookmakers: BookmakerOdds[];
}

export interface OddsUsage {
  remaining: number | null;
  used: number | null;
  lastRequestCost: number | null;
}

export interface OddsProvider {
  readonly name: string;
  readonly usage: OddsUsage;
  getOdds(leagueSlug: "NFL" | "NCAAF", markets?: CoreOddsMarket[]): Promise<GameOdds[]>;
  getEventOdds(leagueSlug: "NFL" | "NCAAF", providerEventId: string, markets: string[]): Promise<GameOdds | null>;
}
