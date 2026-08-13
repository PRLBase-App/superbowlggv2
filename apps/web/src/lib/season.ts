/** NFL seasons are named for the calendar year in which they begin. */
export function currentNflSeasonYear(now = new Date()): number {
  return now.getUTCMonth() <= 1 ? now.getUTCFullYear() - 1 : now.getUTCFullYear();
}

export function isHistoricalNflSeason(year: number, now = new Date()): boolean {
  return year < currentNflSeasonYear(now);
}

export function nflSeasonLabel(year: number, now = new Date()): string {
  return isHistoricalNflSeason(year, now) ? `${year} NFL archive` : `${year} NFL season`;
}

/** Compact week label, e.g. "PS2" for preseason week 2, "W1" for regular season week 1. */
export function gameWeekLabel(seasonType?: string | null, week?: number | null): string {
  if (seasonType === "PRE") return `PS${week ?? ""}`;
  if (seasonType === "POST") return `PO${week ?? ""}`;
  return `W${week ?? ""}`;
}

/** Human-readable week heading, e.g. "Preseason Week 2" vs "NFL Week 1". */
export function gameWeekTitle(seasonType?: string | null, week?: number | null): string {
  if (seasonType === "PRE") return `Preseason Week ${week ?? ""}`;
  return `NFL Week ${week ?? ""}`;
}

/** Canonical week-scoped URL for a game's week. */
export function gameWeekHref(seasonType?: string | null, week?: number | null): string {
  if (seasonType === "PRE") return `/nfl/schedule?type=pre&week=${week ?? 1}`;
  return `/nfl/week/${week ?? 1}`;
}
