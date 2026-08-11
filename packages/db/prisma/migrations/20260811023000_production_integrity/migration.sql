-- Preserve provider provenance and make all reward-bearing operations idempotent.
ALTER TABLE "Season"
  ADD COLUMN "isCurrent" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "providerCoverage" JSONB;

ALTER TABLE "Game"
  ADD COLUMN "stage" TEXT,
  ADD COLUMN "providerUpdatedAt" TIMESTAMP(3);

ALTER TABLE "Prediction"
  ADD COLUMN "clientRequestId" TEXT,
  ADD COLUMN "marketOutcomeId" TEXT,
  ADD COLUMN "oddsSnapshotId" TEXT,
  ADD COLUMN "bookmakerKey" TEXT,
  ADD COLUMN "oddsProvider" TEXT,
  ADD COLUMN "oddsCapturedAt" TIMESTAMP(3);

ALTER TABLE "MarketOutcome"
  ADD COLUMN "providerOutcomeKey" TEXT;

ALTER TABLE "OddsSnapshot"
  ADD COLUMN "outcomeKey" TEXT;

ALTER TABLE "GamificationEvent"
  ADD COLUMN "refType" TEXT,
  ADD COLUMN "refId" TEXT;

ALTER TABLE "Notification"
  ADD COLUMN "dedupeKey" TEXT;

CREATE TABLE "GameEvent" (
  "id" TEXT NOT NULL,
  "gameId" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "providerEventKey" TEXT NOT NULL,
  "quarter" TEXT,
  "clock" TEXT,
  "teamId" TEXT,
  "playerId" TEXT,
  "type" TEXT NOT NULL,
  "description" TEXT,
  "homeScore" INTEGER,
  "awayScore" INTEGER,
  "occurredAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "GameEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SeoApiCache" (
  "id" TEXT NOT NULL,
  "cacheKey" TEXT NOT NULL,
  "tool" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SeoApiCache_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "GameEvent_provider_providerEventKey_key" ON "GameEvent"("provider", "providerEventKey");
CREATE UNIQUE INDEX "SeoApiCache_cacheKey_key" ON "SeoApiCache"("cacheKey");
CREATE INDEX "SeoApiCache_expiresAt_idx" ON "SeoApiCache"("expiresAt");
CREATE INDEX "GameEvent_gameId_createdAt_idx" ON "GameEvent"("gameId", "createdAt");
CREATE INDEX "Prediction_oddsSnapshotId_idx" ON "Prediction"("oddsSnapshotId");
CREATE UNIQUE INDEX "Prediction_clientRequestId_key" ON "Prediction"("clientRequestId");
CREATE UNIQUE INDEX "MarketOutcome_marketId_providerOutcomeKey_key" ON "MarketOutcome"("marketId", "providerOutcomeKey");
CREATE INDEX "OddsSnapshot_marketId_outcomeKey_capturedAt_idx" ON "OddsSnapshot"("marketId", "outcomeKey", "capturedAt");
CREATE UNIQUE INDEX "WalletTransaction_walletId_refType_refId_key" ON "WalletTransaction"("walletId", "refType", "refId");
CREATE UNIQUE INDEX "GamificationEvent_userId_refType_refId_key" ON "GamificationEvent"("userId", "refType", "refId");
CREATE UNIQUE INDEX "Notification_dedupeKey_key" ON "Notification"("dedupeKey");
CREATE UNIQUE INDEX "AffiliateConversion_externalRef_key" ON "AffiliateConversion"("externalRef");
CREATE UNIQUE INDEX "MarketplaceRedemption_userId_offerId_key" ON "MarketplaceRedemption"("userId", "offerId");

ALTER TABLE "GameEvent"
  ADD CONSTRAINT "GameEvent_gameId_fkey"
  FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Remove values that the previous implementation modeled without a provider.
DELETE FROM "SeoOpportunity"
WHERE "keywordId" IN (
  SELECT "id" FROM "SeoKeyword" WHERE "source" = 'SEED' AND "lastRefreshed" IS NULL
);
UPDATE "SeoKeyword"
SET "searchVolume" = NULL, "difficulty" = NULL, "priority" = NULL
WHERE "source" = 'SEED' AND "lastRefreshed" IS NULL;
