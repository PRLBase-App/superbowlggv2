/**
 * Provider timestamps define snapshot freshness. Even when a price has not
 * moved, a newer provider observation must be recorded so that an unchanged
 * outcome does not become stale while the other side of its market changes.
 */
export function shouldCaptureOddsSnapshot(
  latest: { capturedAt: Date } | null,
  capturedAt: Date,
): boolean {
  return !latest || latest.capturedAt < capturedAt;
}
