import type { PredictionMarket } from "@sbgg/db";

export const MAX_ODDS_AGE_MS = 12 * 60 * 60 * 1_000;
export const MAX_FUTURE_ODDS_SKEW_MS = 5 * 60 * 1_000;

export const SUPPORTED_PROP_MARKETS = [
  "player_pass_yds",
  "player_pass_tds",
  "player_pass_interceptions",
  "player_rush_yds",
  "player_receptions",
  "player_reception_yds",
  "player_anytime_td",
] as const;

export type PredictionAvailability = "AVAILABLE" | "CLOSED" | "STALE" | "UNAVAILABLE";

export interface PredictionOptionOutcome {
  id: string;
  name: string;
  description: string | null;
  price: number;
  point: number | null;
  capturedAt: string;
}

export interface PredictionOptionMarket {
  id: string;
  key: string;
  name: string;
  bookmaker: string;
  outcomes: PredictionOptionOutcome[];
}

export interface PredictionOptionsResult {
  availability: PredictionAvailability;
  reason: string;
  markets: PredictionOptionMarket[];
  refreshedAt: string;
}

interface OptionGame {
  id: string;
  scheduledAt: Date;
  status: string;
  homeTeam: { name: string; abbreviation: string };
  awayTeam: { name: string; abbreviation: string };
  markets: Array<{
    id: string;
    key: string;
    name: string;
    active: boolean;
    bookmaker: { id: string; name: string; active: boolean } | null;
    outcomes: Array<{
      id: string;
      providerOutcomeKey: string | null;
      name: string;
      description: string | null;
    }>;
  }>;
}

interface OptionSnapshot {
  id: string;
  gameId: string;
  bookmakerId: string;
  marketId: string | null;
  outcomeKey: string | null;
  price: number;
  line: number | null;
  capturedAt: Date;
}

export function normalizeOutcome(value: string): string {
  return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]/g, "");
}

export function selectionForOutcome(
  marketKey: string,
  outcomeName: string,
  homeTeam: { name: string; abbreviation: string },
  awayTeam: { name: string; abbreviation: string },
): { marketType: PredictionMarket; selection: string; marketKey: string } | null {
  const outcome = normalizeOutcome(outcomeName);
  const homeNames = [normalizeOutcome(homeTeam.name), normalizeOutcome(homeTeam.abbreviation)];
  const awayNames = [normalizeOutcome(awayTeam.name), normalizeOutcome(awayTeam.abbreviation)];
  if (marketKey === "h2h" || marketKey === "spreads") {
    const selection = homeNames.includes(outcome) ? "home" : awayNames.includes(outcome) ? "away" : null;
    if (!selection) return null;
    return {
      marketType: marketKey === "h2h" ? "MONEYLINE" : "SPREAD",
      selection,
      marketKey: `${marketKey}_${selection}`,
    };
  }
  if (marketKey === "totals") {
    const selection = outcome === "over" ? "over" : outcome === "under" ? "under" : null;
    return selection ? { marketType: "TOTAL", selection, marketKey: `${marketKey}_${selection}` } : null;
  }
  if ((SUPPORTED_PROP_MARKETS as readonly string[]).includes(marketKey)) {
    const selection = outcome === "over" ? "over" : outcome === "under" ? "under" : marketKey === "player_anytime_td" && outcome === "yes" ? "over" : null;
    return selection ? { marketType: "PLAYER_PROP", selection, marketKey } : null;
  }
  return null;
}

export function isFreshOdds(capturedAt: Date, now = new Date()): boolean {
  const age = now.getTime() - capturedAt.getTime();
  return age >= -MAX_FUTURE_ODDS_SKEW_MS && age <= MAX_ODDS_AGE_MS;
}

/** Build a public-safe option set exclusively from immutable provider snapshots. */
export function buildPredictionOptions(game: OptionGame, snapshots: OptionSnapshot[], now = new Date()): PredictionOptionsResult {
  if (game.status !== "SCHEDULED" || game.scheduledAt <= now) {
    return { availability: "CLOSED", reason: "This game has started and picks are closed.", markets: [], refreshedAt: now.toISOString() };
  }

  let hasSupportedProviderOutcome = false;
  let hasStaleSnapshot = false;
  const markets: PredictionOptionMarket[] = [];

  for (const market of game.markets) {
    if (!market.active || !market.bookmaker?.active) continue;
    const outcomes: PredictionOptionOutcome[] = [];
    for (const outcome of market.outcomes) {
      if (!outcome.providerOutcomeKey || !selectionForOutcome(market.key, outcome.name, game.homeTeam, game.awayTeam)) continue;
      hasSupportedProviderOutcome = true;
      const snapshot = snapshots.find((candidate) =>
        candidate.gameId === game.id
        && candidate.bookmakerId === market.bookmaker?.id
        && candidate.marketId === market.id
        && candidate.outcomeKey === outcome.providerOutcomeKey,
      );
      if (!snapshot) continue;
      if (!isFreshOdds(snapshot.capturedAt, now)) {
        hasStaleSnapshot = true;
        continue;
      }
      outcomes.push({
        id: outcome.id,
        name: outcome.name,
        description: outcome.description,
        price: snapshot.price,
        point: snapshot.line,
        capturedAt: snapshot.capturedAt.toISOString(),
      });
    }
    if (outcomes.length) markets.push({ id: market.id, key: market.key, name: market.name, bookmaker: market.bookmaker.name, outcomes });
  }

  if (markets.length) {
    const priority = (key: string) => key === "h2h" ? 0 : key === "spreads" ? 1 : key === "totals" ? 2 : 3;
    markets.sort((left, right) => priority(left.key) - priority(right.key));
    return { availability: "AVAILABLE", reason: "Provider-verified picks are open.", markets, refreshedAt: now.toISOString() };
  }
  if (hasStaleSnapshot) {
    return { availability: "STALE", reason: "Odds are being refreshed. Try again shortly.", markets: [], refreshedAt: now.toISOString() };
  }
  return {
    availability: "UNAVAILABLE",
    reason: hasSupportedProviderOutcome ? "Verified odds are not available yet." : "Prediction markets are not available yet.",
    markets: [],
    refreshedAt: now.toISOString(),
  };
}
