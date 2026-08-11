import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiSportsProvider } from "./api-sports";

const seasons = [
  { year: 2024, start: "2024-08-01", end: "2025-02-28", current: false, coverage: {} },
  { year: 2026, start: "2026-08-01", end: "2027-02-28", current: true, coverage: {} },
];

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ApiSportsProvider season selection", () => {
  it("uses the provider current season by default", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ response: [{ seasons }] }), { status: 200 })));
    const provider = new ApiSportsProvider("test-key", "https://sports.example.test");

    await expect(provider.getCurrentSeason("NFL")).resolves.toMatchObject({ year: 2026, current: true });
  });

  it("selects an explicitly configured real season", async () => {
    const fetchMock = vi.fn(async (_input: Parameters<typeof fetch>[0]) => new Response(JSON.stringify({ response: [{ seasons }] }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const provider = new ApiSportsProvider("test-key", "https://sports.example.test", 2024);

    await expect(provider.getCurrentSeason("NFL")).resolves.toMatchObject({ year: 2024, current: true });
    expect(String(fetchMock.mock.calls[0]?.[0])).not.toContain("current=true");
  });
});
