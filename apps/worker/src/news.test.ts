import { describe, expect, it } from "vitest";
import { matchNewsTeam } from "./news";

const teams = [
  { id: "kc", name: "Kansas City Chiefs", shortName: "Chiefs", abbreviation: "KC" },
  { id: "phi", name: "Philadelphia Eagles", shortName: "Eagles", abbreviation: "PHI" },
];

describe("matchNewsTeam", () => {
  it("matches a complete franchise nickname", () => {
    expect(matchNewsTeam("Chiefs prepare for a new season", teams)).toBe("kc");
  });

  it("matches an unambiguous three-character abbreviation", () => {
    expect(matchNewsTeam("PHI updates its training camp roster", teams)).toBe("phi");
  });

  it("does not match short abbreviations or substrings", () => {
    expect(matchNewsTeam("The kickoff plan is official", teams)).toBeNull();
    expect(matchNewsTeam("Seahawks announce a transaction", teams)).toBeNull();
  });
});
