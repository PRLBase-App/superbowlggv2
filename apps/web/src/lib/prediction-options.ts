import type { PredictionMarket } from "@sbgg/db";
import { COMMUNITY_STAT_CATALOG } from "@sbgg/core";

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
  isBestOdds: boolean;
}

export type PredictionMarketGroupKey = "MONEYLINE" | "SPREAD" | "TOTAL" | "PLAYER_PROP";

export interface PredictionOptionMarket {
  id: string;
  key: string;
  name: string;
  bookmaker: string;
  bookmakerKey: string;
  group: PredictionMarketGroupKey;
  outcomes: PredictionOptionOutcome[];
}

export interface PredictionOptionGroup {
  key: PredictionMarketGroupKey;
  label: string;
  markets: PredictionOptionMarket[];
}

export interface CommunityPlayerOption {
  id: string;
  name: string;
  position: string | null;
  teamId: string | null;
  teamAbbreviation: string;
}

export interface PredictionOptionsResult {
  availability: PredictionAvailability;
  reason: string;
  markets: PredictionOptionMarket[];
  groups: PredictionOptionGroup[];
  bookmakers: Array<{ key: string; name: string }>;
  community: {
    available: boolean;
    players: CommunityPlayerOption[];
    stats: Array<{ key: string; label: string; max: number }>;
  };
  refreshedAt: string;
}

/** Keep an immediately actionable game above the fold during schedule windows
 * where nearer games do not have supported provider markets (for example, the
 * transition from preseason to the regular season). Remaining games preserve
 * their existing chronological order.
 */
export function prioritizePickBoardGames<T extends { options: { availability: PredictionAvailability } }>(
  games: T[],
  limit: number,
): T[] {
  if (limit <= 0) return [];
  return [
    ...games.filter((game) => game.options.availability === "AVAILABLE"),
    ...games.filter((game) => game.options.availability !== "AVAILABLE"),
  ].slice(0, limit);
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
    bookmaker: { id: string; key: string; name: string; active: boolean } | null;
    outcomes: Array<{
      id: string;
      providerOutcomeKey: string | null;
      name: string;
      description: string | null;
    }>;
  }>;
}

function emptyResult(
  availability: PredictionAvailability,
  reason: string,
  now: Date,
  communityPlayers: CommunityPlayerOption[] = [],
): PredictionOptionsResult {
  return {
    availability,
    reason,
    markets: [],
    groups: [],
    bookmakers: [],
    community: {
      available: availability !== "CLOSED" && communityPlayers.length > 0,
      players: communityPlayers,
      stats: COMMUNITY_STAT_CATALOG.map(({ key, label, max }) => ({ key, label, max })),
    },
    refreshedAt: now.toISOString(),
  };
}

export function marketGroupForKey(key: string): PredictionMarketGroupKey | null {
  if (key === "h2h") return "MONEYLINE";
  if (key === "spreads") return "SPREAD";
  if (key === "totals") return "TOTAL";
  if ((SUPPORTED_PROP_MARKETS as readonly string[]).includes(key)) return "PLAYER_PROP";
  return null;
}

const GROUP_LABELS: Record<PredictionMarketGroupKey, string> = {
  MONEYLINE: "Moneyline",
  SPREAD: "Spread",
  TOTAL: "Total",
  PLAYER_PROP: "Player Props",
};

export function groupPredictionMarkets(markets: PredictionOptionMarket[]): PredictionOptionGroup[] {
  const order: PredictionMarketGroupKey[] = ["MONEYLINE", "SPREAD", "TOTAL", "PLAYER_PROP"];
  return order.flatMap((key) => {
    const grouped = markets.filter((market) => market.group === key);
    return grouped.length ? [{ key, label: GROUP_LABELS[key], markets: grouped }] : [];
  });
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
export function buildPredictionOptions(
  game: OptionGame,
  snapshots: OptionSnapshot[],
  now = new Date(),
  communityPlayers: CommunityPlayerOption[] = [],
): PredictionOptionsResult {
  if (game.status !== "SCHEDULED" || game.scheduledAt <= now) {
    return emptyResult("CLOSED", "This game has started and picks are closed.", now, communityPlayers);
  }

  let hasSupportedProviderOutcome = false;
  let hasStaleSnapshot = false;
  const markets: PredictionOptionMarket[] = [];

  for (const market of game.markets) {
    if (!market.active || !market.bookmaker?.active) continue;
    const group = marketGroupForKey(market.key);
    if (!group) continue;
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
        isBestOdds: false,
      });
    }
    if (outcomes.length) markets.push({
      id: market.id,
      key: market.key,
      name: market.name,
      bookmaker: market.bookmaker.name,
      bookmakerKey: market.bookmaker.key,
      group,
      outcomes,
    });
  }

  if (markets.length) {
    const priority = (key: string) => key === "h2h" ? 0 : key === "spreads" ? 1 : key === "totals" ? 2 : 3;
    markets.sort((left, right) => priority(left.key) - priority(right.key));
    for (const market of markets) {
      for (const outcome of market.outcomes) {
        const comparable = markets.flatMap((candidate) => candidate.outcomes.map((item) => ({ candidate, item }))).filter(({ candidate, item }) =>
          candidate.key === market.key
          && normalizeOutcome(item.name) === normalizeOutcome(outcome.name)
          && item.point === outcome.point,
        );
        outcome.isBestOdds = comparable.every(({ item }) => outcome.price >= item.price);
      }
    }
    const bookmakers = Array.from(new Map(markets.map((market) => [market.bookmakerKey, { key: market.bookmakerKey, name: market.bookmaker }])).values());
    return {
      availability: "AVAILABLE",
      reason: "Provider-verified picks are open.",
      markets,
      groups: groupPredictionMarkets(markets),
      bookmakers,
      community: {
        available: communityPlayers.length > 0,
        players: communityPlayers,
        stats: COMMUNITY_STAT_CATALOG.map(({ key, label, max }) => ({ key, label, max })),
      },
      refreshedAt: now.toISOString(),
    };
  }
  if (communityPlayers.length) {
    return emptyResult("AVAILABLE", "Community lines are open; sportsbook odds are not required.", now, communityPlayers);
  }
  if (hasStaleSnapshot) {
    return emptyResult("STALE", "Odds are being refreshed. Try again shortly.", now, communityPlayers);
  }
  return emptyResult(
    "UNAVAILABLE",
    hasSupportedProviderOutcome ? "Verified odds are not available yet." : "Prediction markets are not available yet.",
    now,
    communityPlayers,
  );
}
