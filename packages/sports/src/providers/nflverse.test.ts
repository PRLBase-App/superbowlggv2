import { describe, expect, it, vi } from "vitest";
import { NflverseProvider, nflverseInternals } from "./nflverse";

describe("NflverseProvider", () => {
  it("uses the NFL season year in which the season begins", () => {
    expect(nflverseInternals.currentNflSeasonYear(new Date("2026-08-11T12:00:00Z"))).toBe(2026);
    expect(nflverseInternals.currentNflSeasonYear(new Date("2027-02-11T12:00:00Z"))).toBe(2026);
  });

  it("maps real schedule rows without inventing scores", async () => {
    const csv = [
      "game_id,season,game_type,week,gameday,gametime,away_team,away_score,home_team,home_score,stadium",
      "2026_01_DAL_PHI,2026,REG,1,2026-09-10,20:20,DAL,,PHI,,Lincoln Financial Field",
    ].join("\n");
    const fetcher = vi.fn(async () => new Response(csv, { status: 200 })) as unknown as typeof fetch;
    const provider = new NflverseProvider(fetcher, () => new Date("2026-08-11T12:00:00Z"));
    const games = await provider.getSchedule("NFL", 2026);

    expect(games).toHaveLength(1);
    expect(games[0]).toMatchObject({ providerId: "2026_01_DAL_PHI", status: "SCHEDULED", homeScore: 0, awayScore: 0 });
    expect(games[0]?.scheduledAt).toBe("2026-09-11T00:20:00.000Z");
  });

  it("normalizes nflverse roster aliases to current franchise IDs", () => {
    expect(nflverseInternals.canonicalTeamId("AZ")).toBe("ARI");
    expect(nflverseInternals.canonicalTeamId("LA")).toBe("LAR");
    expect(nflverseInternals.canonicalTeamId("LAC")).toBe("LAC");
  });
});
