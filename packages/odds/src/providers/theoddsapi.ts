import type {
  BookmakerOdds,
  CoreOddsMarket,
  GameOdds,
  OddsMarket,
  OddsOutcome,
  OddsProvider,
  OddsUsage,
} from "../types";

interface ApiOutcome {
  name?: unknown;
  description?: unknown;
  price?: unknown;
  point?: unknown;
}

interface ApiMarket {
  key?: unknown;
  last_update?: unknown;
  outcomes?: unknown;
}

interface ApiBookmaker {
  key?: unknown;
  title?: unknown;
  last_update?: unknown;
  markets?: unknown;
}

interface ApiEvent {
  id?: unknown;
  commence_time?: unknown;
  home_team?: unknown;
  away_team?: unknown;
  bookmakers?: unknown;
}

function string(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function number(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function headerNumber(value: string | null): number | null {
  if (value == null || value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function providerOutcomeId(marketKey: string, outcome: OddsOutcome): string {
  return `${marketKey}:${outcome.name}:${outcome.description ?? ""}:${outcome.point ?? ""}`.toLowerCase();
}

export class TheOddsApiProvider implements OddsProvider {
  readonly name = "the-odds-api";
  readonly usage: OddsUsage = { remaining: null, used: null, lastRequestCost: null };

  constructor(
    private readonly apiKey: string,
    private readonly baseUrl = "https://api.the-odds-api.com/v4",
  ) {}

  async getOdds(leagueSlug: "NFL" | "NCAAF", markets: CoreOddsMarket[] = ["h2h", "spreads", "totals"]): Promise<GameOdds[]> {
    const events = await this.request<ApiEvent[]>(`sports/${this.sport(leagueSlug)}/odds`, {
      regions: "us",
      markets: markets.join(","),
      oddsFormat: "decimal",
      dateFormat: "iso",
    });
    return events.flatMap((event) => this.mapEvent(event));
  }

  async getEventOdds(leagueSlug: "NFL" | "NCAAF", providerEventId: string, markets: string[]): Promise<GameOdds | null> {
    if (!markets.length) return null;
    const event = await this.request<ApiEvent>(`sports/${this.sport(leagueSlug)}/events/${encodeURIComponent(providerEventId)}/odds`, {
      regions: "us",
      markets: markets.join(","),
      oddsFormat: "decimal",
      dateFormat: "iso",
    });
    return this.mapEvent(event)[0] ?? null;
  }

  private async request<T>(path: string, params: Record<string, string>): Promise<T> {
    const url = new URL(path, `${this.baseUrl.replace(/\/$/, "")}/`);
    url.searchParams.set("apiKey", this.apiKey);
    for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
    const response = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(15_000) });
    this.usage.remaining = headerNumber(response.headers.get("x-requests-remaining"));
    this.usage.used = headerNumber(response.headers.get("x-requests-used"));
    this.usage.lastRequestCost = headerNumber(response.headers.get("x-requests-last"));
    if (!response.ok) throw new Error(`The Odds API request failed (${response.status})`);
    return (await response.json()) as T;
  }

  private mapEvent(value: ApiEvent): GameOdds[] {
    const providerEventId = string(value.id);
    const commenceTime = string(value.commence_time);
    const homeTeam = string(value.home_team);
    const awayTeam = string(value.away_team);
    if (!providerEventId || !commenceTime || !homeTeam || !awayTeam) return [];
    const rawBookmakers = Array.isArray(value.bookmakers) ? (value.bookmakers as ApiBookmaker[]) : [];
    return [{
      providerEventId,
      commenceTime,
      homeTeam,
      awayTeam,
      bookmakers: rawBookmakers.flatMap((bookmaker): BookmakerOdds[] => {
        const key = string(bookmaker.key);
        const title = string(bookmaker.title);
        const bookmakerUpdated = string(bookmaker.last_update);
        if (!key || !title) return [];
        const rawMarkets = Array.isArray(bookmaker.markets) ? (bookmaker.markets as ApiMarket[]) : [];
        const markets = rawMarkets.flatMap((market): OddsMarket[] => {
            const marketKey = string(market.key);
            const marketUpdated = string(market.last_update) ?? bookmakerUpdated;
            if (!marketKey || !marketUpdated) return [];
            const rawOutcomes = Array.isArray(market.outcomes) ? (market.outcomes as ApiOutcome[]) : [];
            const outcomes = rawOutcomes.flatMap((outcome): OddsOutcome[] => {
              const name = string(outcome.name);
              const price = number(outcome.price);
              if (!name || price == null || price <= 1) return [];
              const mapped: OddsOutcome = {
                providerId: "",
                name,
                description: string(outcome.description),
                price,
                point: number(outcome.point),
              };
              mapped.providerId = providerOutcomeId(marketKey, mapped);
              return [mapped];
            });
            return outcomes.length ? [{ key: marketKey, lastUpdated: marketUpdated, outcomes }] : [];
          });
        if (!markets.length) return [];
        return [{ key, title, lastUpdated: bookmakerUpdated ?? markets[0]!.lastUpdated, markets }];
      }),
    }];
  }

  private sport(leagueSlug: "NFL" | "NCAAF"): string {
    return leagueSlug === "NFL" ? "americanfootball_nfl" : "americanfootball_ncaaf";
  }
}
