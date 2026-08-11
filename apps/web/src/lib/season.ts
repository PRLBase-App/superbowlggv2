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
