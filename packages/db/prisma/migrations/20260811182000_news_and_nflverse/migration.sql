ALTER TYPE "SyncJobType" ADD VALUE IF NOT EXISTS 'SYNC_NEWS';

CREATE TABLE "NewsItem" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "sourceGuid" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT,
    "author" TEXT,
    "url" TEXT NOT NULL,
    "sourceImageUrl" TEXT,
    "teamId" TEXT,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewsItem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "NewsItem_sourceGuid_key" ON "NewsItem"("sourceGuid");
CREATE UNIQUE INDEX "NewsItem_url_key" ON "NewsItem"("url");
CREATE INDEX "NewsItem_publishedAt_idx" ON "NewsItem"("publishedAt");
CREATE INDEX "NewsItem_teamId_publishedAt_idx" ON "NewsItem"("teamId", "publishedAt");

ALTER TABLE "NewsItem" ADD CONSTRAINT "NewsItem_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
