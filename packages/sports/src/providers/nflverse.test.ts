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

  it("merges ESPN preseason games into the current-season schedule", async () => {
    const csv = [
      "game_id,season,game_type,week,gameday,gametime,away_team,away_score,home_team,home_score,stadium",
      "2026_01_DAL_PHI,2026,REG,1,2026-09-10,20:20,DAL,,PHI,,Lincoln Financial Field",
    ].join("\n");
    const espn = {
      events: [
        {
          id: "401873272",
          date: "2026-08-13T23:00Z",
          week: { number: 2 },
          season: { type: 1 },
          status: { type: { state: "pre" } },
          competitions: [{
            venue: { fullName: "Paycor Stadium" },
            broadcasts: [{ names: ["NFL Network"] }],
            competitors: [
              { homeAway: "home", team: { id: "4", abbreviation: "CIN" }, score: "0" },
              { homeAway: "away", team: { id: "8", abbreviation: "DET" }, score: "0" },
            ],
          }],
        },
      ],
    };
    const fetcher = vi.fn(async (input: string | URL | Request) => {
      const url = String(input);
      return url.includes("espn.com")
        ? new Response(JSON.stringify(espn), { status: 200, headers: { "content-type": "application/json" } })
        : new Response(csv, { status: 200 });
    }) as unknown as typeof fetch;
    const provider = new NflverseProvider(fetcher, () => new Date("2026-08-11T12:00:00Z"));
    const games = await provider.getSchedule("NFL", 2026);

    expect(games).toHaveLength(2);
    const preseason = games.find((game) => game.seasonType === "PRE");
    expect(preseason).toMatchObject({
      providerId: "espn-401873272",
      week: 2,
      stage: "Preseason",
      seasonType: "PRE",
      homeTeamProviderId: "CIN",
      awayTeamProviderId: "DET",
      status: "SCHEDULED",
      venue: "Paycor Stadium",
      broadcast: "NFL Network",
    });
    expect(preseason?.scheduledAt).toBe("2026-08-13T23:00Z");
  });

  it("keeps the schedule intact when the ESPN preseason feed is unavailable", async () => {
    const csv = [
      "game_id,season,game_type,week,gameday,gametime,away_team,away_score,home_team,home_score,stadium",
      "2026_01_DAL_PHI,2026,REG,1,2026-09-10,20:20,DAL,,PHI,,Lincoln Financial Field",
    ].join("\n");
    const fetcher = vi.fn(async (input: string | URL | Request) => {
      const url = String(input);
      if (url.includes("espn.com")) throw new Error("ESPN unreachable");
      return new Response(csv, { status: 200 });
    }) as unknown as typeof fetch;
    const provider = new NflverseProvider(fetcher, () => new Date("2026-08-11T12:00:00Z"));
    const games = await provider.getSchedule("NFL", 2026);

    expect(games).toHaveLength(1);
    expect(games[0]?.providerId).toBe("2026_01_DAL_PHI");
  });
});
