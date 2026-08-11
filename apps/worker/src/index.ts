import { env } from "@sbgg/core";
import { Prisma, prisma, type SyncJobType } from "@sbgg/db";
import { SeoService } from "@sbgg/seo";
import { providerName } from "@sbgg/sports";
import {
  processReferrals,
  sendFollowNotifications,
  settlePredictions,
  syncGames,
  syncInjuries,
  syncLiveGames,
  syncNews,
  syncOdds,
  syncPlayers,
  syncStandings,
  syncTeams,
  withLog,
  type JobResult,
} from "./jobs";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const FAILURE_RETRY_CEILING = 6 * HOUR;

async function isDue(jobType: SyncJobType, intervalMs: number): Promise<boolean> {
  const latest = await prisma.integrationSyncLog.findFirst({
    where: { jobType, status: { in: ["SUCCESS", "FAILED"] }, finishedAt: { not: null } },
    orderBy: { startedAt: "desc" },
    select: { status: true, finishedAt: true },
  });
  if (!latest?.finishedAt) return true;
  const requiredWait = latest.status === "FAILED" ? Math.min(intervalMs, FAILURE_RETRY_CEILING) : intervalMs;
  return Date.now() - latest.finishedAt.getTime() >= requiredWait;
}

async function execute(name: string, job: () => Promise<JobResult>, results: JobResult[]): Promise<JobResult> {
  console.info(`[worker] running ${name}`);
  const result = await job();
  results.push(result);
  return result;
}

async function claimRequestedJob(jobType: SyncJobType): Promise<string | null> {
  const pending = await prisma.integrationSyncLog.findFirst({
    where: { jobType, status: "PENDING" },
    orderBy: { startedAt: "asc" },
    select: { id: true },
  });
  if (!pending) return null;
  const claim = await prisma.integrationSyncLog.updateMany({
    where: { id: pending.id, status: "PENDING" },
    data: { status: "RUNNING", startedAt: new Date() },
  });
  return claim.count === 1 ? pending.id : null;
}

async function rejectRequestedJob(jobType: SyncJobType, message: string): Promise<void> {
  const requestLogId = await claimRequestedJob(jobType);
  if (!requestLogId) return;
  await prisma.integrationSyncLog.update({
    where: { id: requestLogId },
    data: { status: "FAILED", finishedAt: new Date(), error: message.slice(0, 2_000) },
  });
}

async function runScheduled(
  jobType: SyncJobType,
  intervalMs: number,
  name: string,
  job: () => Promise<JobResult>,
  results: JobResult[],
): Promise<void> {
  const requestLogId = await claimRequestedJob(jobType);
  if (!requestLogId && !await isDue(jobType, intervalMs)) return;
  const result = await execute(name, job, results);
  if (requestLogId) {
    await prisma.integrationSyncLog.update({
      where: { id: requestLogId },
      data: {
        status: result.error ? "FAILED" : "SUCCESS",
        finishedAt: new Date(),
        itemsProcessed: result.processed,
        error: result.error?.slice(0, 2_000),
      },
    });
  }
}

async function withSeoRun(
  seo: SeoService,
  runType: "EXISTING" | "OPPORTUNITIES" | "TECHNICAL",
  fn: () => Promise<{ processed: number; keywordsFound?: number; metadata?: Record<string, unknown> }>,
): Promise<JobResult> {
  const run = await prisma.seoResearchRun.create({ data: { runType, status: "RUNNING" } });
  const startingUnits = seo.unitsUsed;
  try {
    const result = await fn();
    await prisma.seoResearchRun.update({
      where: { id: run.id },
      data: {
        status: "SUCCESS",
        keywordsFound: result.keywordsFound ?? 0,
        unitsUsed: Math.max(0, seo.unitsUsed - startingUnits),
        ...(result.metadata ? { metadata: result.metadata as Prisma.InputJsonValue } : {}),
        finishedAt: new Date(),
      },
    });
    return { processed: result.processed };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await prisma.seoResearchRun.update({
      where: { id: run.id },
      data: { status: "FAILED", unitsUsed: Math.max(0, seo.unitsUsed - startingUnits), error: message.slice(0, 2_000), finishedAt: new Date() },
    });
    throw error;
  }
}

/**
 * One-shot dispatcher for Railway Cron. It performs only jobs whose durable
 * success timestamp is stale, then exits so overlapping schedulers cannot
 * silently accumulate in long-lived processes.
 */
async function runDue(): Promise<JobResult[]> {
  const results: JobResult[] = [];
  const configuration = env();
  const sportsJobs: SyncJobType[] = ["SYNC_TEAMS", "SYNC_SCHEDULE", "SYNC_STANDINGS", "SYNC_PLAYERS", "SYNC_INJURIES", "SYNC_LIVE_GAMES"];

  if (providerName() !== "unconfigured") {
    await runScheduled("SYNC_TEAMS", 7 * DAY, "teams", syncTeams, results);
    await runScheduled("SYNC_SCHEDULE", 6 * HOUR, "schedule", syncGames, results);
    await runScheduled("SYNC_STANDINGS", 12 * HOUR, "standings", syncStandings, results);
    await runScheduled("SYNC_PLAYERS", 6 * HOUR, "players", syncPlayers, results);
    await runScheduled("SYNC_INJURIES", 6 * HOUR, "injuries", syncInjuries, results);
    await runScheduled("SYNC_LIVE_GAMES", 15 * MINUTE, "live games", syncLiveGames, results);
  } else {
    console.warn("[worker] sports data provider is not configured; synchronization is unavailable");
    await Promise.all(sportsJobs.map((jobType) => rejectRequestedJob(jobType, "Sports data provider is not configured")));
  }

  if (configuration.THE_ODDS_API_KEY) {
    // Three core markets every eight hours plus four prop markets once daily
    // stays below The Odds API's documented free monthly quota.
    await runScheduled("SYNC_ODDS", 8 * HOUR, "odds", syncOdds, results);
  } else {
    console.warn("[worker] THE_ODDS_API_KEY is not configured; live odds synchronization is unavailable");
    await rejectRequestedJob("SYNC_ODDS", "THE_ODDS_API_KEY is not configured");
  }
  await runScheduled("SETTLE_PREDICTIONS", 15 * MINUTE, "settlement", settlePredictions, results);
  await runScheduled("PROCESS_GAMIFICATION", 30 * MINUTE, "referrals", processReferrals, results);
  await runScheduled("SEND_NOTIFICATIONS", 15 * MINUTE, "notifications", sendFollowNotifications, results);
  await runScheduled("SYNC_NEWS", 30 * MINUTE, "NFL news", syncNews, results);

  const seo = new SeoService();
  try {
    if (configuration.SEMRUSH_API_KEY && configuration.SEMRUSH_RESEARCH_ENABLED === "true") {
      await runScheduled("SEO_REFRESH_EXISTING_RANKINGS", 30 * DAY, "SEO rankings", () => withLog("SEO_REFRESH_EXISTING_RANKINGS", "semrush", () => withSeoRun(seo, "EXISTING", async () => {
          const value = await seo.refreshExistingRankings(new URL(configuration.APP_URL).hostname);
          return { processed: value.keywordsFound, keywordsFound: value.keywordsFound, metadata: { source: value.source } };
        })), results);
      await runScheduled("SEO_RESEARCH_KEYWORDS", 30 * DAY, "SEO research", () => withLog("SEO_RESEARCH_KEYWORDS", "semrush", () => withSeoRun(seo, "OPPORTUNITIES", async () => {
          const value = await seo.researchKeywords();
          return { processed: value.researched, keywordsFound: value.researched, metadata: { opportunitiesScored: value.scored } };
        })), results);
    }
    await runScheduled("SEO_TECHNICAL_AUDIT", DAY, "technical SEO audit", () => withLog("SEO_TECHNICAL_AUDIT", "internal-crawler", () => withSeoRun(seo, "TECHNICAL", async () => {
        const value = await seo.auditPages(configuration.APP_URL);
        return { processed: value.audited, metadata: { issues: value.issues } };
      })), results);
  } finally {
    await seo.close();
  }
  return results;
}

let stopRequested = false;
let releaseWait: (() => void) | undefined;

function requestStop(signal: string): void {
  if (!stopRequested) console.info(`[worker] received ${signal}; stopping after the current cycle`);
  stopRequested = true;
  releaseWait?.();
}

async function waitForNextCycle(durationMs: number): Promise<void> {
  if (stopRequested) return;
  await new Promise<void>((resolve) => {
    let timer: NodeJS.Timeout;
    const finish = () => {
      clearTimeout(timer);
      releaseWait = undefined;
      resolve();
    };
    releaseWait = finish;
    timer = setTimeout(finish, durationMs);
  });
}

/** Always-on Railway worker wrapper around the durable due dispatcher. */
async function runLoop(): Promise<JobResult[]> {
  const handleSigterm = () => requestStop("SIGTERM");
  const handleSigint = () => requestStop("SIGINT");
  process.once("SIGTERM", handleSigterm);
  process.once("SIGINT", handleSigint);
  try {
    while (!stopRequested) {
      const startedAt = Date.now();
      try {
        const results = await runDue();
        const failed = results.filter((result) => result.error).length;
        if (failed > 0) console.error(`[worker] cycle completed with ${failed} failed job(s); due jobs will retry`);
      } catch (error) {
        console.error("[worker] cycle failed; due jobs will retry", error);
      }
      if (!stopRequested) await waitForNextCycle(Math.max(MINUTE, 10 * MINUTE - (Date.now() - startedAt)));
    }
  } finally {
    process.off("SIGTERM", handleSigterm);
    process.off("SIGINT", handleSigint);
  }
  return [];
}

const commands: Record<string, () => Promise<JobResult | JobResult[]>> = {
  due: runDue,
  loop: runLoop,
  teams: syncTeams,
  schedule: syncGames,
  standings: syncStandings,
  players: syncPlayers,
  injuries: syncInjuries,
  live: syncLiveGames,
  odds: syncOdds,
  news: syncNews,
  settle: settlePredictions,
  referrals: processReferrals,
  notifications: sendFollowNotifications,
};

async function main(): Promise<void> {
  const command = process.argv[2] ?? "due";
  const run = commands[command];
  if (!run) throw new Error(`Unknown worker command: ${command}`);
  console.info(`[worker] ${command} started at ${new Date().toISOString()}`);
  const value = await run();
  const results = Array.isArray(value) ? value : [value];
  if (results.some((result) => result.error)) process.exitCode = 1;
  console.info(`[worker] ${command} finished at ${new Date().toISOString()}`);
}

main()
  .catch((error) => {
    console.error("[worker] fatal", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
