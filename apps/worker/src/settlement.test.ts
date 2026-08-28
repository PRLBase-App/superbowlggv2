import { describe, expect, it } from "vitest";
import { needsSettlementRecovery } from "./settlement";

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
