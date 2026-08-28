-- Additive account theme preference. Existing and new accounts intentionally
-- remain on the current light presentation unless they opt in.
CREATE TYPE "ThemePreference" AS ENUM ('LIGHT', 'DARK', 'SYSTEM');

ALTER TABLE "User"
  ADD COLUMN "themePreference" "ThemePreference" NOT NULL DEFAULT 'LIGHT';

-- Side-effect completion markers let the worker retry only incomplete work.
ALTER TABLE "Prediction"
  ADD COLUMN "rewardsProcessedAt" TIMESTAMP(3),
  ADD COLUMN "achievementsProcessedAt" TIMESTAMP(3),
  ADD COLUMN "notificationProcessedAt" TIMESTAMP(3);

-- Settled rows that predate this migration were already processed by the old
-- recurring worker. Mark them complete so the first deploy does not revisit
-- the historical settlement set.
UPDATE "Prediction"
SET
  "rewardsProcessedAt" = COALESCE("settledAt", "updatedAt"),
  "achievementsProcessedAt" = COALESCE("settledAt", "updatedAt"),
  "notificationProcessedAt" = COALESCE("settledAt", "updatedAt")
WHERE "status" IN ('SETTLED', 'VOIDED');

CREATE INDEX "Prediction_status_rewardsProcessedAt_achievementsProcessedAt_notificationProcessedAt_idx"
  ON "Prediction"("status", "rewardsProcessedAt", "achievementsProcessedAt", "notificationProcessedAt");
