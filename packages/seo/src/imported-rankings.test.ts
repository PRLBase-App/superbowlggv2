import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseSemrushKeywordMarkdown, selectCurrentImportedRankings } from "./imported-rankings";

const source = readFileSync(new URL("../../../keyword.md", import.meta.url), "utf8");

describe("SEMrush keyword markdown import", () => {
  it("parses every supplied regional observation without losing intent or nullable difficulty", () => {
    const rows = parseSemrushKeywordMarkdown(source);

    expect(rows).toHaveLength(7);
    expect(rows.filter((row) => row.database === "us")).toHaveLength(4);
    expect(rows.filter((row) => row.database === "ca")).toHaveLength(2);
    expect(rows.filter((row) => row.database === "mx")).toHaveLength(1);
    expect(rows.find((row) => row.keyword === "las vegas super bowl spread")?.intents).toEqual(["C", "I"]);
    expect(rows.find((row) => row.database === "ca")?.difficulty).toBeNull();
    expect(rows.every((row) => row.url === "https://superbowl.gg/")).toBe(true);
  });

  it("keeps duplicate observations and selects the best supplied position as current", () => {
    const rows = parseSemrushKeywordMarkdown(source);
    const canada = rows.filter((row) => row.database === "ca" && row.keyword === "super bowl lx odds");
    const current = selectCurrentImportedRankings(rows);

    expect(canada.map((row) => row.position)).toEqual([66, 72]);
    expect(canada[1]?.reportedDateLabel).toBe("Jul 17");
    expect(current.get("ca\u0000super bowl lx odds")?.position).toBe(66);
  });
});
