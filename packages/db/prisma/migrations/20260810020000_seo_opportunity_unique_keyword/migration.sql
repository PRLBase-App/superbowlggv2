-- Enforce one scored opportunity per keyword so refresh jobs can upsert safely.
CREATE UNIQUE INDEX "SeoOpportunity_keywordId_key" ON "SeoOpportunity"("keywordId");
