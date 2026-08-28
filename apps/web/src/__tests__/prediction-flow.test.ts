import { describe, expect, it } from "vitest";
import { buildPredictionOptions, isFreshOdds, prioritizePickBoardGames } from "@/lib/prediction-options";
import { publicationDecision } from "@/lib/prediction-publication";
import { safeReturnTo } from "@/lib/return-url";
import { themePreferenceSchema } from "@/lib/theme";

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
    bookmaker: { id: "book-1", name: "Verified book", active: true },
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

describe("prediction publication idempotency", () => {
  it("replays the same user's request and rejects a cross-user collision", () => {
    expect(publicationDecision(null, "user-a")).toBe("CREATE");
    expect(publicationDecision("user-a", "user-a")).toBe("REPLAY");
    expect(publicationDecision("user-b", "user-a")).toBe("CONFLICT");
  });
});
