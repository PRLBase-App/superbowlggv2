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
