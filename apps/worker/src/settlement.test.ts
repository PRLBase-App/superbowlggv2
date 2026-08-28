import { describe, expect, it } from "vitest";
import { computePredictionResult, needsSettlementRecovery } from "./settlement";

const completed = {
  status: "SETTLED",
  rewardsProcessedAt: new Date(),
  achievementsProcessedAt: new Date(),
  notificationProcessedAt: new Date(),
};

describe("settlement recovery selection", () => {
  it("does not revisit a fully processed settlement", () => {
    expect(needsSettlementRecovery(completed)).toBe(false);
  });

  it("retries each incomplete side-effect group", () => {
    expect(needsSettlementRecovery({ ...completed, rewardsProcessedAt: null })).toBe(true);
    expect(needsSettlementRecovery({ ...completed, achievementsProcessedAt: null })).toBe(true);
    expect(needsSettlementRecovery({ ...completed, notificationProcessedAt: null })).toBe(true);
  });

  it("always selects a newly locked prediction", () => {
    expect(needsSettlementRecovery({ ...completed, status: "LOCKED" })).toBe(true);
  });
});

describe("community line settlement", () => {
  it("settles half-step player lines without a synthetic push", () => {
    expect(computePredictionResult({ marketType: "PLAYER_PROP", selection: "over", line: 249.5, homeScore: 0, awayScore: 0, playerPropValue: 250 })).toBe("WIN");
    expect(computePredictionResult({ marketType: "PLAYER_PROP", selection: "under", line: 249.5, homeScore: 0, awayScore: 0, playerPropValue: 250 })).toBe("LOSS");
  });

  it("voids when the required official statistic is missing", () => {
    expect(computePredictionResult({ marketType: "PLAYER_PROP", selection: "over", line: 0.5, homeScore: 0, awayScore: 0, playerPropValue: null })).toBe("VOID");
  });
});
