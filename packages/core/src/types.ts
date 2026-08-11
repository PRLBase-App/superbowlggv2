import type { PredictionMarket, PredictionStatus, SettlementResult } from "@sbgg/db";

/** Settlement math is pure — unit-testable without a DB. */
export interface SettlementInput {
  marketType: PredictionMarket;
  selection: string;
  line: number | null;
  homeScore: number;
  awayScore: number;
  /** For PLAYER_PROP: the player's actual stat value. */
  playerStat?: number | null;
}

export function settlePrediction(input: SettlementInput): {
  result: SettlementResult;
  reason: string;
} {
  const { marketType, line, homeScore, awayScore } = input;
  const selection = input.selection.toLowerCase();
  switch (marketType) {
    case "MONEYLINE": {
      if (selection !== "home" && selection !== "away") {
        return { result: "VOID", reason: "Unsupported moneyline selection" };
      }
      if (homeScore === awayScore) return { result: "PUSH", reason: "Moneyline push" };
      const homeWon = homeScore > awayScore;
      const selectedHome = selection === "home";
      const win = homeWon === selectedHome;
      return win
        ? { result: "WIN", reason: `${selectedHome ? "Home" : "Away"} team won` }
        : { result: "LOSS", reason: `${selectedHome ? "Home" : "Away"} team lost` };
    }
    case "SPREAD": {
      if (line == null) return { result: "VOID", reason: "Missing spread line" };
      if (selection !== "home" && selection !== "away") {
        return { result: "VOID", reason: "Unsupported spread selection" };
      }
      const margin = homeScore - awayScore;
      const selectedHome = selection === "home";
      const effective = selectedHome ? margin + line : -margin + line;
      if (Math.abs(effective) < 0.001) return { result: "PUSH", reason: "Spread push" };
      return effective > 0
        ? { result: "WIN", reason: "Covered the spread" }
        : { result: "LOSS", reason: "Failed to cover the spread" };
    }
    case "TOTAL": {
      if (line == null) return { result: "VOID", reason: "Missing total line" };
      if (selection !== "over" && selection !== "under") {
        return { result: "VOID", reason: "Unsupported total selection" };
      }
      const total = homeScore + awayScore;
      const over = selection === "over";
      if (Math.abs(total - line) < 0.001) return { result: "PUSH", reason: "Total push" };
      const wentOver = total > line;
      return wentOver === over
        ? { result: "WIN", reason: `Total went ${wentOver ? "over" : "under"} ${line}` }
        : { result: "LOSS", reason: `Total went ${wentOver ? "over" : "under"} ${line}` };
    }
    case "PLAYER_PROP": {
      if (line == null || input.playerStat == null)
        return { result: "VOID", reason: "Missing prop stat or line" };
      if (selection !== "over" && selection !== "under") {
        return { result: "VOID", reason: "Unsupported player prop selection" };
      }
      const stat = input.playerStat;
      const over = selection === "over";
      if (Math.abs(stat - line) < 0.001) return { result: "PUSH", reason: "Prop push" };
      const wentOver = stat > line;
      return wentOver === over
        ? { result: "WIN", reason: `Prop went ${wentOver ? "over" : "under"} ${line}` }
        : { result: "LOSS", reason: `Prop went ${wentOver ? "over" : "under"} ${line}` };
    }
    default:
      return { result: "VOID", reason: `Unsupported market ${marketType}` };
  }
}

export function predictionStatusLabel(status: PredictionStatus): string {
  switch (status) {
    case "PENDING":
      return "Pending";
    case "LOCKED":
      return "Locked";
    case "SETTLED":
      return "Settled";
    case "VOIDED":
      return "Voided";
    default:
      return status;
  }
}
