/**
 * Keyword opportunity scoring — normalized model.
 *
 * OpportunityScore = SearchDemand × Relevance × ProductFit × FreshnessPotential
 *                    × InternalLinkPotential / CompetitionFactor
 *
 * All inputs normalized to 0..1; output 0..100. Logic documented in
 * /docs/seo/strategy.md. Deterministic and unit-testable.
 */

export interface KeywordSignals {
  searchVolume: number; // monthly
  difficulty: number; // 0..100
  relevance: number; // 0..1 (fit with NFL/Super Bowl product)
  productFit: number; // 0..1 (page type exists / can be built from real data)
  freshnessPotential: number; // 0..1 (weekly-seasonal content)
  internalLinkPotential: number; // 0..1 (can be linked from games/teams/weeks)
  competitionFactor: number; // 0..1 (1 = brutal)
  cpc?: number;
  intent?: string;
}

const VOLUME_SCALE = 100_000;

export function opportunityScore(s: KeywordSignals): number {
  const demand = Math.min(1, Math.log10(1 + s.searchVolume) / Math.log10(1 + VOLUME_SCALE));
  const feasibility = Math.max(0, Math.sqrt(1 - s.difficulty / 100)); // softened difficulty penalty
  const competition = Math.max(0.5, 1 - 0.5 * s.competitionFactor); // softened competition penalty
  const raw =
    demand *
    s.relevance *
    s.productFit *
    s.freshnessPotential *
    s.internalLinkPotential *
    feasibility *
    competition;
  return Math.round(raw * 1000) / 10; // 0..100
}

export function priorityBucket(score: number): "P1" | "P2" | "P3" | "P4" | "P5" {
  if (score >= 45) return "P1";
  if (score >= 30) return "P2";
  if (score >= 18) return "P3";
  if (score >= 8) return "P4";
  return "P5";
}

/** Seed keyword library — the starting point for SEMrush research. */
export const SEED_KEYWORDS: { keyword: string; cluster: string; intent: string; targetUrl: string; relevance: number; productFit: number; freshness: number; linkPotential: number }[] = [
  // Super Bowl hub
  { keyword: "super bowl", cluster: "super-bowl", intent: "INFORMATIONAL", targetUrl: "/super-bowl", relevance: 1, productFit: 1, freshness: 0.8, linkPotential: 1 },
  { keyword: "super bowl predictions", cluster: "super-bowl-predictions", intent: "PREDICTION", targetUrl: "/super-bowl/predictions", relevance: 1, productFit: 1, freshness: 0.9, linkPotential: 1 },
  { keyword: "super bowl odds", cluster: "super-bowl-odds", intent: "ODDS", targetUrl: "/super-bowl/odds", relevance: 1, productFit: 1, freshness: 0.9, linkPotential: 1 },
  { keyword: "super bowl picks", cluster: "super-bowl-predictions", intent: "PREDICTION", targetUrl: "/super-bowl/predictions", relevance: 1, productFit: 1, freshness: 0.9, linkPotential: 1 },
  { keyword: "super bowl schedule", cluster: "super-bowl", intent: "SCHEDULE", targetUrl: "/super-bowl/schedule", relevance: 1, productFit: 0.9, freshness: 0.7, linkPotential: 0.9 },
  { keyword: "super bowl history", cluster: "super-bowl-history", intent: "HISTORICAL", targetUrl: "/super-bowl/history", relevance: 1, productFit: 1, freshness: 0.3, linkPotential: 0.9 },
  { keyword: "super bowl winners", cluster: "super-bowl-history", intent: "HISTORICAL", targetUrl: "/super-bowl/winners", relevance: 1, productFit: 1, freshness: 0.2, linkPotential: 0.9 },
  { keyword: "super bowl winners list", cluster: "super-bowl-history", intent: "HISTORICAL", targetUrl: "/super-bowl/winners", relevance: 1, productFit: 1, freshness: 0.2, linkPotential: 0.9 },
  { keyword: "super bowl mvp list", cluster: "super-bowl-history", intent: "HISTORICAL", targetUrl: "/super-bowl/mvp", relevance: 1, productFit: 0.9, freshness: 0.2, linkPotential: 0.8 },
  { keyword: "super bowl records", cluster: "super-bowl-history", intent: "STATISTICAL", targetUrl: "/super-bowl/records", relevance: 1, productFit: 1, freshness: 0.2, linkPotential: 0.8 },
  { keyword: "super bowl locations", cluster: "super-bowl-history", intent: "HISTORICAL", targetUrl: "/super-bowl/locations", relevance: 0.9, productFit: 0.9, freshness: 0.2, linkPotential: 0.8 },
  { keyword: "super bowl stadiums", cluster: "super-bowl-history", intent: "HISTORICAL", targetUrl: "/super-bowl/stadiums", relevance: 0.9, productFit: 0.9, freshness: 0.2, linkPotential: 0.8 },
  { keyword: "super bowl 2027", cluster: "super-bowl", intent: "LIVE_EVENT", targetUrl: "/super-bowl", relevance: 1, productFit: 0.9, freshness: 0.9, linkPotential: 0.9 },
  { keyword: "when is the super bowl", cluster: "super-bowl", intent: "INFORMATIONAL", targetUrl: "/super-bowl", relevance: 1, productFit: 0.9, freshness: 0.9, linkPotential: 0.9 },
  { keyword: "where is the super bowl", cluster: "super-bowl", intent: "INFORMATIONAL", targetUrl: "/super-bowl", relevance: 1, productFit: 0.9, freshness: 0.7, linkPotential: 0.9 },
  // NFL core
  { keyword: "nfl predictions", cluster: "nfl-predictions", intent: "PREDICTION", targetUrl: "/nfl/predictions", relevance: 1, productFit: 1, freshness: 0.9, linkPotential: 1 },
  { keyword: "nfl picks", cluster: "nfl-predictions", intent: "PREDICTION", targetUrl: "/nfl/picks", relevance: 1, productFit: 1, freshness: 0.9, linkPotential: 1 },
  { keyword: "nfl picks today", cluster: "nfl-predictions", intent: "PREDICTION", targetUrl: "/nfl/predictions", relevance: 1, productFit: 1, freshness: 1, linkPotential: 1 },
  { keyword: "nfl picks this week", cluster: "nfl-predictions", intent: "PREDICTION", targetUrl: "/nfl/week/1/predictions", relevance: 1, productFit: 1, freshness: 1, linkPotential: 1 },
  { keyword: "nfl predictions this week", cluster: "nfl-predictions", intent: "PREDICTION", targetUrl: "/nfl/week/1/predictions", relevance: 1, productFit: 1, freshness: 1, linkPotential: 1 },
  { keyword: "nfl odds", cluster: "nfl-odds", intent: "ODDS", targetUrl: "/nfl/odds", relevance: 1, productFit: 1, freshness: 0.9, linkPotential: 1 },
  { keyword: "nfl odds today", cluster: "nfl-odds", intent: "ODDS", targetUrl: "/nfl/odds", relevance: 1, productFit: 1, freshness: 1, linkPotential: 1 },
  { keyword: "nfl scores", cluster: "nfl-scores", intent: "SCORE", targetUrl: "/nfl/scores", relevance: 1, productFit: 1, freshness: 1, linkPotential: 1 },
  { keyword: "nfl scores today", cluster: "nfl-scores", intent: "SCORE", targetUrl: "/nfl/scores", relevance: 1, productFit: 1, freshness: 1, linkPotential: 1 },
  { keyword: "nfl schedule", cluster: "nfl-schedule", intent: "SCHEDULE", targetUrl: "/nfl/schedule", relevance: 1, productFit: 1, freshness: 0.9, linkPotential: 1 },
  { keyword: "nfl schedule today", cluster: "nfl-schedule", intent: "SCHEDULE", targetUrl: "/nfl/schedule", relevance: 1, productFit: 1, freshness: 1, linkPotential: 1 },
  { keyword: "nfl schedule this week", cluster: "nfl-schedule", intent: "SCHEDULE", targetUrl: "/nfl/week/1/schedule", relevance: 1, productFit: 1, freshness: 1, linkPotential: 1 },
  { keyword: "nfl standings", cluster: "nfl-standings", intent: "STATISTICAL", targetUrl: "/nfl/standings", relevance: 1, productFit: 1, freshness: 0.6, linkPotential: 0.9 },
  { keyword: "nfl playoff picture", cluster: "nfl-playoffs", intent: "STATISTICAL", targetUrl: "/nfl/playoff-picture", relevance: 1, productFit: 0.9, freshness: 0.7, linkPotential: 0.9 },
  { keyword: "nfl playoffs", cluster: "nfl-playoffs", intent: "LIVE_EVENT", targetUrl: "/nfl/playoffs", relevance: 1, productFit: 0.9, freshness: 0.8, linkPotential: 0.9 },
  { keyword: "nfl playoff predictions", cluster: "nfl-predictions", intent: "PREDICTION", targetUrl: "/nfl/playoffs", relevance: 1, productFit: 1, freshness: 0.9, linkPotential: 0.9 },
  { keyword: "nfl power rankings", cluster: "nfl-stats", intent: "STATISTICAL", targetUrl: "/nfl/power-rankings", relevance: 1, productFit: 0.9, freshness: 0.8, linkPotential: 0.9 },
  { keyword: "nfl stats", cluster: "nfl-stats", intent: "STATISTICAL", targetUrl: "/nfl/stats", relevance: 1, productFit: 1, freshness: 0.5, linkPotential: 0.9 },
  { keyword: "nfl player stats", cluster: "nfl-stats", intent: "STATISTICAL", targetUrl: "/nfl/players", relevance: 1, productFit: 1, freshness: 0.5, linkPotential: 0.9 },
  { keyword: "nfl team stats", cluster: "nfl-stats", intent: "STATISTICAL", targetUrl: "/nfl/stats", relevance: 1, productFit: 1, freshness: 0.5, linkPotential: 0.9 },
  { keyword: "nfl injuries", cluster: "nfl-injuries", intent: "STATISTICAL", targetUrl: "/nfl/injuries", relevance: 1, productFit: 1, freshness: 1, linkPotential: 0.9 },
  { keyword: "nfl injury report", cluster: "nfl-injuries", intent: "STATISTICAL", targetUrl: "/nfl/injuries", relevance: 1, productFit: 1, freshness: 1, linkPotential: 0.9 },
  { keyword: "nfl betting odds", cluster: "nfl-odds", intent: "ODDS", targetUrl: "/nfl/odds", relevance: 1, productFit: 1, freshness: 0.9, linkPotential: 1 },
  { keyword: "nfl spreads", cluster: "nfl-odds", intent: "ODDS", targetUrl: "/nfl/odds", relevance: 1, productFit: 1, freshness: 0.9, linkPotential: 1 },
  { keyword: "nfl moneyline", cluster: "nfl-odds", intent: "ODDS", targetUrl: "/nfl/odds", relevance: 1, productFit: 1, freshness: 0.9, linkPotential: 1 },
  { keyword: "nfl over under", cluster: "nfl-odds", intent: "ODDS", targetUrl: "/nfl/odds", relevance: 1, productFit: 1, freshness: 0.9, linkPotential: 1 },
  { keyword: "nfl player props", cluster: "nfl-odds", intent: "ODDS", targetUrl: "/nfl/odds", relevance: 1, productFit: 1, freshness: 0.9, linkPotential: 1 },
  { keyword: "nfl touchdown props", cluster: "nfl-odds", intent: "ODDS", targetUrl: "/nfl/odds", relevance: 0.95, productFit: 1, freshness: 0.9, linkPotential: 0.9 },
  { keyword: "nfl expert picks", cluster: "nfl-predictions", intent: "PREDICTION", targetUrl: "/nfl/picks", relevance: 1, productFit: 0.9, freshness: 0.9, linkPotential: 0.9 },
  { keyword: "nfl community picks", cluster: "nfl-predictions", intent: "PREDICTION", targetUrl: "/nfl/predictions", relevance: 1, productFit: 1, freshness: 0.9, linkPotential: 1 },
  { keyword: "nfl prediction leaderboard", cluster: "nfl-community", intent: "PREDICTION", targetUrl: "/leaderboard", relevance: 1, productFit: 1, freshness: 0.8, linkPotential: 0.8 },
  { keyword: "football predictions", cluster: "nfl-predictions", intent: "PREDICTION", targetUrl: "/nfl/predictions", relevance: 0.9, productFit: 1, freshness: 0.8, linkPotential: 0.9 },
  { keyword: "american football predictions", cluster: "nfl-predictions", intent: "PREDICTION", targetUrl: "/nfl/predictions", relevance: 1, productFit: 1, freshness: 0.8, linkPotential: 0.9 },
  // Programmatic long-tail patterns (team pages, week pages, game pages)
  { keyword: "[team] vs [team] prediction", cluster: "game-predictions", intent: "PREDICTION", targetUrl: "/nfl/games/[slug]", relevance: 1, productFit: 1, freshness: 1, linkPotential: 1 },
  { keyword: "[team] vs [team] odds", cluster: "game-odds", intent: "ODDS", targetUrl: "/nfl/games/[slug]", relevance: 1, productFit: 1, freshness: 1, linkPotential: 1 },
  { keyword: "[team] vs [team] picks", cluster: "game-predictions", intent: "PREDICTION", targetUrl: "/nfl/games/[slug]", relevance: 1, productFit: 1, freshness: 1, linkPotential: 1 },
  { keyword: "[team] vs [team] stats", cluster: "game-stats", intent: "STATISTICAL", targetUrl: "/nfl/games/[slug]", relevance: 1, productFit: 1, freshness: 0.8, linkPotential: 1 },
  { keyword: "[team] schedule", cluster: "team-pages", intent: "SCHEDULE", targetUrl: "/nfl/teams/[slug]", relevance: 1, productFit: 1, freshness: 0.8, linkPotential: 1 },
  { keyword: "[team] standings", cluster: "team-pages", intent: "STATISTICAL", targetUrl: "/nfl/teams/[slug]", relevance: 1, productFit: 1, freshness: 0.6, linkPotential: 1 },
  { keyword: "[team] predictions", cluster: "team-pages", intent: "PREDICTION", targetUrl: "/nfl/teams/[slug]/predictions", relevance: 1, productFit: 1, freshness: 0.9, linkPotential: 1 },
  { keyword: "[team] odds", cluster: "team-pages", intent: "ODDS", targetUrl: "/nfl/teams/[slug]", relevance: 1, productFit: 1, freshness: 0.9, linkPotential: 1 },
  { keyword: "[player] stats", cluster: "player-pages", intent: "STATISTICAL", targetUrl: "/nfl/players/[slug]", relevance: 1, productFit: 1, freshness: 0.5, linkPotential: 1 },
  { keyword: "[player] passing yards", cluster: "player-pages", intent: "STATISTICAL", targetUrl: "/nfl/players/[slug]", relevance: 0.95, productFit: 1, freshness: 0.9, linkPotential: 1 },
  { keyword: "[player] touchdown odds", cluster: "player-pages", intent: "ODDS", targetUrl: "/nfl/players/[slug]", relevance: 0.9, productFit: 1, freshness: 0.9, linkPotential: 1 },
  { keyword: "[player] injury", cluster: "player-pages", intent: "STATISTICAL", targetUrl: "/nfl/players/[slug]", relevance: 0.95, productFit: 1, freshness: 1, linkPotential: 1 },
  { keyword: "[player] game log", cluster: "player-pages", intent: "STATISTICAL", targetUrl: "/nfl/players/[slug]/game-log", relevance: 0.95, productFit: 1, freshness: 0.5, linkPotential: 1 },
  { keyword: "nfl week 1 predictions", cluster: "week-pages", intent: "PREDICTION", targetUrl: "/nfl/week/1/predictions", relevance: 1, productFit: 1, freshness: 1, linkPotential: 1 },
  { keyword: "nfl week 1 picks", cluster: "week-pages", intent: "PREDICTION", targetUrl: "/nfl/week/1/predictions", relevance: 1, productFit: 1, freshness: 1, linkPotential: 1 },
  { keyword: "nfl week 1 odds", cluster: "week-pages", intent: "ODDS", targetUrl: "/nfl/week/1/odds", relevance: 1, productFit: 1, freshness: 1, linkPotential: 1 },
  { keyword: "nfl week 1 schedule", cluster: "week-pages", intent: "SCHEDULE", targetUrl: "/nfl/week/1/schedule", relevance: 1, productFit: 1, freshness: 1, linkPotential: 1 },
  { keyword: "super bowl 2026 predictions", cluster: "super-bowl-predictions", intent: "PREDICTION", targetUrl: "/super-bowl/predictions", relevance: 1, productFit: 1, freshness: 0.9, linkPotential: 1 },
  { keyword: "super bowl 2027 odds", cluster: "super-bowl-odds", intent: "ODDS", targetUrl: "/super-bowl/odds", relevance: 1, productFit: 1, freshness: 0.9, linkPotential: 1 },
];
