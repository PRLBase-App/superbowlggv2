import { describe, it, expect } from "vitest";
import { settlePrediction } from "@sbgg/core";
import { levelForXp, predictionPoints, nextStreak, streakMilestoneReward } from "@sbgg/gamification";
import { isOfferAllowed, parseGeoRestrictions } from "@sbgg/affiliate";
import { opportunityScore, priorityBucket } from "@sbgg/seo";

describe("settlement — moneyline", () => {
  it("home win when home selected", () => {
    expect(settlePrediction({ marketType: "MONEYLINE", selection: "home", line: null, homeScore: 24, awayScore: 10 }).result).toBe("WIN");
  });
  it("loss when away selected and home wins", () => {
    expect(settlePrediction({ marketType: "MONEYLINE", selection: "away", line: null, homeScore: 24, awayScore: 10 }).result).toBe("LOSS");
  });
  it("win when away selected and away wins", () => {
    expect(settlePrediction({ marketType: "MONEYLINE", selection: "away", line: null, homeScore: 10, awayScore: 24 }).result).toBe("WIN");
  });
  it("pushes a tied final score", () => {
    expect(settlePrediction({ marketType: "MONEYLINE", selection: "home", line: null, homeScore: 21, awayScore: 21 }).result).toBe("PUSH");
  });
  it("voids an invalid selection", () => {
    expect(settlePrediction({ marketType: "MONEYLINE", selection: "draw", line: null, homeScore: 21, awayScore: 17 }).result).toBe("VOID");
  });
});

describe("settlement — spread", () => {
  it("home covers -3.5 with 4pt win", () => {
    expect(settlePrediction({ marketType: "SPREAD", selection: "home", line: -3.5, homeScore: 24, awayScore: 20 }).result).toBe("WIN");
  });
  it("home fails to cover -3.5 with 3pt win", () => {
    expect(settlePrediction({ marketType: "SPREAD", selection: "home", line: -3.5, homeScore: 23, awayScore: 20 }).result).toBe("LOSS");
  });
  it("push on exact line", () => {
    expect(settlePrediction({ marketType: "SPREAD", selection: "away", line: 3, homeScore: 20, awayScore: 17 }).result).toBe("PUSH");
  });
  it("away covers +3 with 2pt loss", () => {
    expect(settlePrediction({ marketType: "SPREAD", selection: "away", line: 3, homeScore: 22, awayScore: 20 }).result).toBe("WIN");
  });
  it("voids a spread without a line", () => {
    expect(settlePrediction({ marketType: "SPREAD", selection: "home", line: null, homeScore: 22, awayScore: 20 }).result).toBe("VOID");
  });
});

describe("settlement — totals", () => {
  it("over 47.5 with 51 total", () => {
    expect(settlePrediction({ marketType: "TOTAL", selection: "over", line: 47.5, homeScore: 27, awayScore: 24 }).result).toBe("WIN");
  });
  it("under 47.5 with 44 total", () => {
    expect(settlePrediction({ marketType: "TOTAL", selection: "under", line: 47.5, homeScore: 27, awayScore: 17 }).result).toBe("WIN");
  });
  it("push on exact total", () => {
    expect(settlePrediction({ marketType: "TOTAL", selection: "over", line: 44, homeScore: 27, awayScore: 17 }).result).toBe("PUSH");
  });
  it("voids an invalid total selection", () => {
    expect(settlePrediction({ marketType: "TOTAL", selection: "home", line: 44, homeScore: 27, awayScore: 17 }).result).toBe("VOID");
  });
});

describe("settlement — player props", () => {
  it("over 250.5 passing yards", () => {
    expect(settlePrediction({ marketType: "PLAYER_PROP", selection: "over", line: 250.5, homeScore: 0, awayScore: 0, playerStat: 302 }).result).toBe("WIN");
  });
  it("under when stat below line", () => {
    expect(settlePrediction({ marketType: "PLAYER_PROP", selection: "under", line: 250.5, homeScore: 0, awayScore: 0, playerStat: 198 }).result).toBe("WIN");
  });
  it("void without stat data", () => {
    expect(settlePrediction({ marketType: "PLAYER_PROP", selection: "over", line: 250.5, homeScore: 0, awayScore: 0, playerStat: null }).result).toBe("VOID");
  });
  it("pushes when the player stat equals the line", () => {
    expect(settlePrediction({ marketType: "PLAYER_PROP", selection: "under", line: 250, homeScore: 0, awayScore: 0, playerStat: 250 }).result).toBe("PUSH");
  });
});

describe("gamification — levels", () => {
  it("rookie at 0", () => expect(levelForXp(0).title).toBe("Rookie"));
  it("legend at 7000", () => expect(levelForXp(7000).title).toBe("Legend"));
  it("progression within level", () => {
    const l = levelForXp(75);
    expect(l.level).toBe(1);
    expect(l.progressPct).toBeGreaterThan(0);
    expect(l.progressPct).toBeLessThan(1);
  });
});

describe("gamification — points", () => {
  it("win at 2.0 odds = 100 pts", () => expect(predictionPoints({ result: "WIN", odds: 2 })).toBe(100));
  it("loss = -50 pts", () => expect(predictionPoints({ result: "LOSS", odds: 1.5 })).toBe(-50));
  it("push = 0", () => expect(predictionPoints({ result: "PUSH", odds: 1.9 })).toBe(0));
});

describe("gamification — streaks", () => {
  const base = { currentStreak: 3, longestStreak: 7, lastActivityDate: new Date("2026-08-10T10:00:00Z") };
  it("same day no change", () => {
    const r = nextStreak(base, new Date("2026-08-10T22:00:00Z"));
    expect(r.updated).toBe(false);
    expect(r.currentStreak).toBe(3);
  });
  it("next day increments", () => {
    const r = nextStreak(base, new Date("2026-08-11T10:00:00Z"));
    expect(r.currentStreak).toBe(4);
    expect(r.longestStreak).toBe(7);
  });
  it("gap resets", () => {
    const r = nextStreak(base, new Date("2026-08-14T10:00:00Z"));
    expect(r.currentStreak).toBe(1);
  });
  it("milestone rewards", () => {
    expect(streakMilestoneReward(7)).toBe(100);
    expect(streakMilestoneReward(4)).toBeNull();
  });
});

describe("affiliate geo", () => {
  it("blocked country", () => {
    const r = parseGeoRestrictions(JSON.stringify({ blockedCountries: ["US"] }));
    expect(isOfferAllowed(r, { country: "US" }).allowed).toBe(false);
  });
  it("allowed country passes", () => {
    const r = parseGeoRestrictions(JSON.stringify({ blockedCountries: ["US"] }));
    expect(isOfferAllowed(r, { country: "DE" }).allowed).toBe(true);
  });
  it("allowedCountries restricts", () => {
    const r = parseGeoRestrictions(JSON.stringify({ allowedCountries: ["US"] }));
    expect(isOfferAllowed(r, { country: "DE" }).allowed).toBe(false);
  });
  it("blocked region", () => {
    const r = parseGeoRestrictions(JSON.stringify({ blockedRegions: ["US-WA"] }));
    expect(isOfferAllowed(r, { country: "US", region: "US-WA" }).allowed).toBe(false);
  });
  it("minimum age", () => {
    const r = parseGeoRestrictions(JSON.stringify({ minimumAge: 21 }));
    expect(isOfferAllowed(r, { age: 19 }).allowed).toBe(false);
    expect(isOfferAllowed(r, { age: 24 }).allowed).toBe(true);
  });
  it("restricted data fails closed when visitor attributes are unknown", () => {
    expect(isOfferAllowed({ allowedCountries: ["US"] }, {}).allowed).toBe(false);
    expect(isOfferAllowed({ minimumAge: 21 }, {}).allowed).toBe(false);
  });
  it("no rule = allowed", () => expect(isOfferAllowed(null, { country: "US" }).allowed).toBe(true));
});

describe("seo scoring", () => {
  it("high potential keyword scores high", () => {
    const score = opportunityScore({ searchVolume: 40000, difficulty: 35, relevance: 1, productFit: 1, freshnessPotential: 0.9, internalLinkPotential: 1, competitionFactor: 0.6 });
    expect(score).toBeGreaterThan(40);
    expect(priorityBucket(score)).toBe("P1");
  });
  it("low value keyword scores low", () => {
    const score = opportunityScore({ searchVolume: 100, difficulty: 90, relevance: 0.2, productFit: 0.2, freshnessPotential: 0.1, internalLinkPotential: 0.1, competitionFactor: 1 });
    expect(score).toBeLessThan(10);
    expect(priorityBucket(score)).toBe("P5");
  });
  it("deterministic", () => {
    const a = opportunityScore({ searchVolume: 5000, difficulty: 50, relevance: 0.8, productFit: 0.9, freshnessPotential: 0.8, internalLinkPotential: 0.9, competitionFactor: 0.7 });
    const b = opportunityScore({ searchVolume: 5000, difficulty: 50, relevance: 0.8, productFit: 0.9, freshnessPotential: 0.8, internalLinkPotential: 0.9, competitionFactor: 0.7 });
    expect(a).toBe(b);
  });
});
