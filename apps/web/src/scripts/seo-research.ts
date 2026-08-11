import { CORE_PUBLIC_PATHS, SeoService } from "@sbgg/seo";
import { prisma } from "@sbgg/db";
import { env } from "@sbgg/core";

/** Safe research command: it stores research data but never publishes pages. */
async function main(): Promise<void> {
  const configuration = env();
  const seo = new SeoService();
  const domain = new URL(configuration.APP_URL).hostname;
  const run = await prisma.seoResearchRun.create({ data: { runType: "FULL", status: "RUNNING" } });
  try {
    console.info(`[seo] research started for ${domain}`);
    const existing = await seo.refreshExistingRankings(domain);
    const opportunities = await seo.researchKeywords();
    const pages = await seo.recordPages(CORE_PUBLIC_PATHS.map((path) => ({ path })));
    await prisma.seoResearchRun.update({
      where: { id: run.id },
      data: {
        status: "SUCCESS",
        keywordsFound: existing.keywordsFound + opportunities.researched,
        unitsUsed: seo.unitsUsed,
        finishedAt: new Date(),
        metadata: { existingSource: existing.source, opportunitiesScored: opportunities.scored, pagesRecorded: pages },
      },
    });
    console.info(`[seo] complete: ${existing.keywordsFound} rankings, ${opportunities.researched} researched keywords, ${opportunities.scored} scored opportunities`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await prisma.seoResearchRun.update({ where: { id: run.id }, data: { status: "FAILED", unitsUsed: seo.unitsUsed, error: message.slice(0, 2_000), finishedAt: new Date() } });
    throw error;
  } finally {
    await seo.close();
  }
}

main()
  .catch((error) => {
    console.error(`[seo] failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
