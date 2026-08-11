-- Ranking positions and demand metrics are scoped to a SEMrush regional
-- database. The former global keyword uniqueness would overwrite CA/MX data
-- with US data (and vice versa).
ALTER TABLE "SeoKeyword"
ADD COLUMN "database" TEXT NOT NULL DEFAULT 'us',
ADD COLUMN "semrushIntents" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

DROP INDEX "SeoKeyword_keyword_key";
CREATE UNIQUE INDEX "SeoKeyword_keyword_database_key" ON "SeoKeyword"("keyword", "database");
CREATE INDEX "SeoKeyword_database_status_idx" ON "SeoKeyword"("database", "status");

-- Imported exports can contain several observations for the same localized
-- keyword. Preserve all of them and make repeated imports idempotent.
ALTER TABLE "SeoKeywordSnapshot"
ADD COLUMN "sourceKey" TEXT,
ADD COLUMN "trafficShare" TEXT,
ADD COLUMN "source" TEXT NOT NULL DEFAULT 'SEMRUSH',
ADD COLUMN "isCurrent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "metadata" JSONB;

CREATE UNIQUE INDEX "SeoKeywordSnapshot_sourceKey_key" ON "SeoKeywordSnapshot"("sourceKey");
