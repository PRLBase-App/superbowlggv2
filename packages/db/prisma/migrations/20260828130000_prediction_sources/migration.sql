CREATE TYPE "PredictionSource" AS ENUM ('PROVIDER', 'COMMUNITY');

ALTER TABLE "Prediction"
  ADD COLUMN "source" "PredictionSource" NOT NULL DEFAULT 'PROVIDER',
  ALTER COLUMN "oddsAtCreation" DROP NOT NULL;

CREATE INDEX "Prediction_source_idx" ON "Prediction"("source");
