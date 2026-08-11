export interface NewsTeamCandidate {
  id: string;
  name: string;
  shortName: string;
  abbreviation: string;
}

function escapePattern(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Match only complete team names, nicknames or unambiguous abbreviations. */
export function matchNewsTeam(text: string, teams: NewsTeamCandidate[]): string | null {
  for (const team of teams) {
    const candidates = [team.name, team.shortName, team.abbreviation.length >= 3 ? team.abbreviation : ""].filter(Boolean);
    if (candidates.some((candidate) => new RegExp(`(^|[^a-z0-9])${escapePattern(candidate)}([^a-z0-9]|$)`, "i").test(text))) {
      return team.id;
    }
  }
  return null;
}
