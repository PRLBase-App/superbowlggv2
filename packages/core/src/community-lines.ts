import type { PlayerGameStats } from "@sbgg/db";
import { z } from "zod";

export const COMMUNITY_STAT_CATALOG = [
  { key: "passing_yards", label: "Passing Yards", max: 600.5 },
  { key: "passing_tds", label: "Passing TDs", max: 8.5 },
  { key: "passing_interceptions", label: "Passing Interceptions", max: 8.5 },
  { key: "rushing_yards", label: "Rushing Yards", max: 400.5 },
  { key: "rushing_tds", label: "Rushing TDs", max: 6.5 },
  { key: "receptions", label: "Receptions", max: 25.5 },
  { key: "receiving_yards", label: "Receiving Yards", max: 400.5 },
  { key: "receiving_tds", label: "Receiving TDs", max: 6.5 },
  { key: "pass_rush_yards", label: "Pass + Rush Yards", max: 700.5 },
  { key: "rush_receiving_yards", label: "Rush + Receiving Yards", max: 500.5 },
  { key: "total_tds", label: "Total TDs", max: 6.5 },
  { key: "fantasy_points", label: "Fantasy Points", max: 100.5 },
] as const;

export type CommunityStatKey = (typeof COMMUNITY_STAT_CATALOG)[number]["key"];

const statKeys = COMMUNITY_STAT_CATALOG.map(({ key }) => key) as [CommunityStatKey, ...CommunityStatKey[]];

export const communityStatKeySchema = z.enum(statKeys);

export function communityStat(key: string) {
  return COMMUNITY_STAT_CATALOG.find((stat) => stat.key === key);
}

export function isHalfLine(line: number): boolean {
  return Number.isFinite(line) && Math.abs(line - (Math.floor(line) + 0.5)) < 0.000_001;
}

export function isValidCommunityLine(statKey: string, line: number): boolean {
  const stat = communityStat(statKey);
  return Boolean(stat && line >= 0.5 && line <= stat.max && isHalfLine(line));
}

/** A missing component never becomes an assumed zero. */
export function communityStatValue(statKey: string, stats: PlayerGameStats): number | null {
  switch (statKey as CommunityStatKey) {
    case "passing_yards": return stats.passingYards;
    case "passing_tds": return stats.passingTds;
    case "passing_interceptions": return stats.interceptions;
    case "rushing_yards": return stats.rushingYards;
    case "rushing_tds": return stats.rushingTds;
    case "receptions": return stats.receptions;
    case "receiving_yards": return stats.receivingYards;
    case "receiving_tds": return stats.receivingTds;
    case "fantasy_points": return stats.fantasyPoints;
    case "pass_rush_yards":
      return stats.passingYards == null || stats.rushingYards == null ? null : stats.passingYards + stats.rushingYards;
    case "rush_receiving_yards":
      return stats.rushingYards == null || stats.receivingYards == null ? null : stats.rushingYards + stats.receivingYards;
    case "total_tds":
      return stats.rushingTds == null || stats.receivingTds == null ? null : stats.rushingTds + stats.receivingTds;
    default:
      return null;
  }
}

export function communityMarketLabel(statKey: string): string {
  return communityStat(statKey)?.label ?? "Community stat";
}
