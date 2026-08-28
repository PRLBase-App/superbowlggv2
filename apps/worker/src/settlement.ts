import type { PredictionMarket, SettlementResult } from "@sbgg/db";
import { settlePrediction } from "@sbgg/core";

export interface SettlementInput {
  marketType: PredictionMarket | string;
  selection: string;
  line: number | null;
  homeScore: number;
  awayScore: number;
  playerPropValue?: number | null;
}

export function computePredictionResult(input: SettlementInput): SettlementResult {
  if (!(["MONEYLINE", "SPREAD", "TOTAL", "PLAYER_PROP"] as const).includes(input.marketType as PredictionMarket)) return "VOID";
  return settlePrediction({
    marketType: input.marketType as PredictionMarket,
    selection: input.selection,
    line: input.line,
    homeScore: input.homeScore,
    awayScore: input.awayScore,
    playerStat: input.playerPropValue,
  }).result;
}

export function needsSettlementRecovery(input: {
  status: string;
  rewardsProcessedAt: Date | null;
  achievementsProcessedAt: Date | null;
  notificationProcessedAt: Date | null;
}): boolean {
  return input.status === "LOCKED"
    || ((input.status === "SETTLED" || input.status === "VOIDED")
      && (!input.rewardsProcessedAt || !input.achievementsProcessedAt || !input.notificationProcessedAt));
}
