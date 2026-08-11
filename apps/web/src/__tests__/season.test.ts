import { describe, expect, it } from "vitest";
import { currentNflSeasonYear, isHistoricalNflSeason, nflSeasonLabel } from "@/lib/season";

describe("NFL season presentation", () => {
  it("uses the previous year during the January/February postseason", () => {
    expect(currentNflSeasonYear(new Date("2026-02-08T12:00:00Z"))).toBe(2025);
    expect(currentNflSeasonYear(new Date("2026-08-11T12:00:00Z"))).toBe(2026);
  });

  it("labels plan-limited historical provider data as an archive", () => {
    const now = new Date("2026-08-11T12:00:00Z");
    expect(isHistoricalNflSeason(2024, now)).toBe(true);
    expect(nflSeasonLabel(2024, now)).toBe("2024 NFL archive");
    expect(nflSeasonLabel(2026, now)).toBe("2026 NFL season");
  });
});
