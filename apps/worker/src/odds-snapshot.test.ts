import { describe, expect, it } from "vitest";
import { shouldCaptureOddsSnapshot } from "./odds-snapshot";

describe("odds snapshot capture", () => {
  const previous = new Date("2026-08-27T13:30:00.000Z");
  const refreshed = new Date("2026-08-27T21:30:00.000Z");

  it("captures a newer provider observation even when the price is unchanged", () => {
    expect(shouldCaptureOddsSnapshot({ capturedAt: previous }, refreshed)).toBe(true);
  });

  it("does not duplicate the same or an older provider observation", () => {
    expect(shouldCaptureOddsSnapshot({ capturedAt: refreshed }, refreshed)).toBe(false);
    expect(shouldCaptureOddsSnapshot({ capturedAt: refreshed }, previous)).toBe(false);
  });

  it("captures the first observation", () => {
    expect(shouldCaptureOddsSnapshot(null, refreshed)).toBe(true);
  });
});
