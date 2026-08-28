import { describe, expect, it } from "vitest";
import { buildPredictionOptions, groupPredictionMarkets, isFreshOdds, prioritizePickBoardGames } from "@/lib/prediction-options";
import { COMMUNITY_STAT_CATALOG, communityStatValue, isValidCommunityLine } from "@sbgg/core";
import { publicationDecision } from "@/lib/prediction-publication";
import { safeReturnTo } from "@/lib/return-url";
import { themePreferenceSchema } from "@/lib/theme";
import { predictionPublishSchema } from "@/lib/prediction-payload";

const now = new Date("2026-08-27T12:00:00.000Z");
const game = {
  id: "game-1",
  scheduledAt: new Date("2026-08-28T12:00:00.000Z"),
  status: "SCHEDULED",
  homeTeam: { name: "Philadelphia Eagles", abbreviation: "PHI" },
  awayTeam: { name: "Dallas Cowboys", abbreviation: "DAL" },
  markets: [{
    id: "market-1",
    key: "h2h",
    name: "Moneyline",
    active: true,
    bookmaker: { id: "book-1", key: "verified-book", name: "Verified book", active: true },
    outcomes: [
      { id: "outcome-away", providerOutcomeKey: "away", name: "Dallas Cowboys", description: null },
      { id: "outcome-home", providerOutcomeKey: "home", name: "Philadelphia Eagles", description: null },
    ],
  }],
};

function snapshots(capturedAt: Date) {
  return [
    { id: "snap-1", gameId: "game-1", bookmakerId: "book-1", marketId: "market-1", outcomeKey: "away", price: 2.1, line: null, capturedAt },
    { id: "snap-2", gameId: "game-1", bookmakerId: "book-1", marketId: "market-1", outcomeKey: "home", price: 1.8, line: null, capturedAt },
  ];
}

describe("safe authentication return paths", () => {
  it("keeps a relative return-to-pick URL", () => {
    expect(safeReturnTo("/predict?game=g1&outcome=o1", "/")).toBe("/predict?game=g1&outcome=o1");
  });

  it("rejects absolute, protocol-relative, encoded and backslash redirects", () => {
    expect(safeReturnTo("https://evil.example/pick", "/")).toBe("/");
    expect(safeReturnTo("//evil.example/pick", "/")).toBe("/");
    expect(safeReturnTo("/%2f%2fevil.example", "/")).toBe("/");
    expect(safeReturnTo("/\\evil.example", "/")).toBe("/");
  });
});

describe("theme validation", () => {
  it("accepts only the three account themes", () => {
    expect(["LIGHT", "DARK", "SYSTEM"].every((value) => themePreferenceSchema.safeParse(value).success)).toBe(true);
    expect(themePreferenceSchema.safeParse("AUTO").success).toBe(false);
    expect(themePreferenceSchema.safeParse("dark").success).toBe(false);
  });
});

describe("prediction option availability", () => {
  it("returns supported outcomes backed by fresh provider snapshots", () => {
    const result = buildPredictionOptions(game, snapshots(new Date("2026-08-27T11:55:00.000Z")), now);
    expect(result.availability).toBe("AVAILABLE");
    expect(result.markets[0]?.outcomes).toHaveLength(2);
    expect(result.markets[0]?.outcomes[0]?.price).toBe(2.1);
    expect(result.groups).toHaveLength(1);
    expect(result.groups[0]).toMatchObject({ key: "MONEYLINE", label: "Moneyline" });
    expect(result.bookmakers).toEqual([{ key: "verified-book", name: "Verified book" }]);
  });

  it("closes a game at kickoff", () => {
    const result = buildPredictionOptions({ ...game, scheduledAt: now }, snapshots(now), now);
    expect(result).toMatchObject({ availability: "CLOSED", markets: [] });
  });

  it("rejects stale or future-dated odds", () => {
    expect(isFreshOdds(new Date("2026-08-26T23:59:59.000Z"), now)).toBe(false);
    expect(isFreshOdds(new Date("2026-08-27T12:06:00.000Z"), now)).toBe(false);
    expect(buildPredictionOptions(game, snapshots(new Date("2026-08-26T23:00:00.000Z")), now).availability).toBe("STALE");
  });

  it("surfaces open picks before nearer games without markets", () => {
    const games = [
      { id: "next-closed", options: { availability: "UNAVAILABLE" as const } },
      { id: "later-open", options: { availability: "AVAILABLE" as const } },
      { id: "next-stale", options: { availability: "STALE" as const } },
    ];
    expect(prioritizePickBoardGames(games, 2).map(({ id }) => id)).toEqual(["later-open", "next-closed"]);
  });
});

describe("market grouping and community catalog", () => {
  it("groups repeated bookmaker markets into one semantic entry", () => {
    const markets = [
      { id: "a", key: "h2h", name: "Moneyline", bookmaker: "A", bookmakerKey: "a", group: "MONEYLINE" as const, outcomes: [] },
      { id: "b", key: "h2h", name: "Moneyline", bookmaker: "B", bookmakerKey: "b", group: "MONEYLINE" as const, outcomes: [] },
      { id: "c", key: "totals", name: "Total", bookmaker: "A", bookmakerKey: "a", group: "TOTAL" as const, outcomes: [] },
    ];
    const groups = groupPredictionMarkets(markets);
    expect(groups.map(({ key }) => key)).toEqual(["MONEYLINE", "TOTAL"]);
    expect(groups[0]?.markets).toHaveLength(2);
  });

  it("enforces half-step lines and every configured cap", () => {
    expect(COMMUNITY_STAT_CATALOG).toHaveLength(12);
    for (const stat of COMMUNITY_STAT_CATALOG) {
      expect(isValidCommunityLine(stat.key, 0.5)).toBe(true);
      expect(isValidCommunityLine(stat.key, stat.max)).toBe(true);
      expect(isValidCommunityLine(stat.key, stat.max + 1)).toBe(false);
      expect(isValidCommunityLine(stat.key, 1)).toBe(false);
    }
    expect(isValidCommunityLine("client_formula", 0.5)).toBe(false);
  });

  it("derives combined stats but never assumes missing components are zero", () => {
    const stats = {
      passingYards: 220, passingTds: 2, interceptions: 1, rushingYards: 35, rushingTds: 1,
      receptions: 4, receivingYards: 60, receivingTds: 1, fantasyPoints: 25,
    } as Parameters<typeof communityStatValue>[1];
    expect(communityStatValue("pass_rush_yards", stats)).toBe(255);
    expect(communityStatValue("total_tds", stats)).toBe(2);
    expect(communityStatValue("pass_rush_yards", { ...stats, rushingYards: null })).toBeNull();
  });
});

describe("prediction payload validation", () => {
  const common = {
    clientRequestId: "550e8400-e29b-41d4-a716-446655440000",
    gameId: "game-1",
    confidence: "MEDIUM",
    virtualUnits: 1,
  } as const;

  it("accepts one allowlisted Community statistic without client odds", () => {
    expect(predictionPublishSchema.safeParse({ ...common, source: "COMMUNITY", playerId: "player-1", statKey: "passing_yards", selection: "over", line: 249.5 }).success).toBe(true);
  });

  it("rejects client odds, formulas, unknown statistics and whole-number lines", () => {
    expect(predictionPublishSchema.safeParse({ ...common, source: "COMMUNITY", playerId: "player-1", statKey: "passing_yards", selection: "over", line: 249.5, odds: 2 }).success).toBe(false);
    expect(predictionPublishSchema.safeParse({ ...common, source: "COMMUNITY", playerId: "player-1", statKey: "client_formula", selection: "over", line: 0.5 }).success).toBe(false);
    expect(predictionPublishSchema.safeParse({ ...common, source: "COMMUNITY", playerId: "player-1", statKey: "passing_yards", selection: "over", line: 250 }).success).toBe(false);
    expect(predictionPublishSchema.safeParse({ ...common, source: "PROVIDER", marketOutcomeId: "outcome-1", odds: 2 }).success).toBe(false);
  });
});

describe("prediction publication idempotency", () => {
  it("replays the same user's request and rejects a cross-user collision", () => {
    expect(publicationDecision(null, "user-a")).toBe("CREATE");
    expect(publicationDecision("user-a", "user-a")).toBe("REPLAY");
    expect(publicationDecision("user-b", "user-a")).toBe("CONFLICT");
  });
});
