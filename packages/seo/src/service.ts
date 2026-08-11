import { prisma, type SeoIntent, type SeoKeywordPriority } from "@sbgg/db";
import { env } from "@sbgg/core";
import { SemrushMcpClient } from "./semrush-mcp";
import { SEED_KEYWORDS, opportunityScore, priorityBucket } from "./keywords";

export const CORE_PUBLIC_PATHS = [
  "/", "/games", "/predictions", "/leaderboard/all-time", "/leaderboard/weekly", "/leaderboard/monthly", "/leaderboard/season",
  "/marketplace", "/nfl", "/nfl/schedule", "/nfl/scores", "/nfl/standings", "/nfl/predictions", "/nfl/odds",
  "/nfl/stats", "/nfl/teams", "/nfl/players", "/nfl/injuries", "/nfl/playoffs", "/nfl/power-rankings",
  "/super-bowl", "/super-bowl/predictions", "/super-bowl/odds", "/super-bowl/schedule", "/super-bowl/history",
  "/super-bowl/winners", "/super-bowl/mvp", "/super-bowl/records", "/super-bowl/locations", "/super-bowl/stadiums",
  "/how-it-works", "/affiliate-disclosure", "/responsible-gaming", "/privacy", "/terms",
] as const;

function htmlText(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return value.replace(/<[^>]+>/g, " ").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/\s+/g, " ").trim() || undefined;
}

function capture(html: string, expression: RegExp): string | undefined {
  return htmlText(expression.exec(html)?.[1]);
}

/**
 * SEO research service. RESEARCH is separate from CONTENT DEPLOYMENT:
 * this never publishes pages — it only populates SeoKeyword /
 * SeoOpportunity / SeoPage tables + the /data/seo artifacts.
 */
export class SeoService {
  private client: SemrushMcpClient | null = null;

  private semrush(): SemrushMcpClient | null {
    const e = env();
    if (!e.SEMRUSH_API_KEY || e.SEMRUSH_RESEARCH_ENABLED !== "true") return null;
    if (!this.client) {
      this.client = new SemrushMcpClient(e.SEMRUSH_API_KEY, e.SEMRUSH_MCP_URL, e.SEMRUSH_MAX_UNITS_PER_RUN, e.SEMRUSH_CACHE_DAYS);
    }
    return this.client;
  }

  get unitsUsed(): number {
    return this.client?.unitsSpent ?? 0;
  }

  async close(): Promise<void> {
    await this.client?.close();
  }

  /** 1) Load current rankings for the domain (existing SEO footprint). */
  async refreshExistingRankings(domain: string): Promise<{ keywordsFound: number; source: string }> {
    const c = this.semrush();
    if (!c) return { keywordsFound: 0, source: "disabled" };
    const rows = await c.organicResearch(domain, 200);
    if (!rows) return { keywordsFound: 0, source: "semrush:no-units-or-none" };

    let count = 0;
    for (const row of rows) {
      const kw = await prisma.seoKeyword.upsert({
        where: { keyword: row.keyword },
        update: { currentPosition: row.position, currentUrl: row.url, searchVolume: row.searchVolume, source: "SEMRUSH", lastRefreshed: new Date(), status: "RANKING" },
        create: { keyword: row.keyword, currentPosition: row.position, currentUrl: row.url, searchVolume: row.searchVolume, source: "SEMRUSH", lastRefreshed: new Date(), status: "RANKING", cluster: "existing" },
      });
      await prisma.seoKeywordSnapshot.create({
        data: { keywordId: kw.id, searchVolume: row.searchVolume, position: row.position },
      });
      count++;
    }
    return { keywordsFound: count, source: "semrush" };
  }

  /** 2) Seed + refresh keyword research for the seed library. */
  async researchKeywords(): Promise<{ researched: number; scored: number; unitsUsed: number }> {
    const c = this.semrush();
    let researched = 0;
    let scored = 0;
    for (const seed of SEED_KEYWORDS) {
      const kw = await prisma.seoKeyword.upsert({
        where: { keyword: seed.keyword },
        update: {
          cluster: seed.cluster,
          intent: seed.intent as SeoIntent,
          targetUrl: seed.targetUrl,
          relevance: seed.relevance,
          productFit: seed.productFit,
          freshness: seed.freshness,
          linkPotential: seed.linkPotential,
        },
        create: {
          keyword: seed.keyword,
          cluster: seed.cluster,
          intent: seed.intent as SeoIntent,
          targetUrl: seed.targetUrl,
          relevance: seed.relevance,
          productFit: seed.productFit,
          freshness: seed.freshness,
          linkPotential: seed.linkPotential,
          source: "SEED",
        },
      });

      let volume = kw.searchVolume;
      let difficulty = kw.difficulty;
      if (c) {
        const m = await c.keywordResearch(seed.keyword);
        if (m) {
          volume = m.searchVolume ?? volume;
          difficulty = m.difficulty ?? difficulty;
          researched++;
          await prisma.seoKeyword.update({
            where: { id: kw.id },
            data: { searchVolume: m.searchVolume, difficulty: m.difficulty, cpc: m.cpc, competition: m.competition, source: "SEMRUSH", lastRefreshed: new Date() },
          });
          await prisma.seoKeywordSnapshot.create({ data: { keywordId: kw.id, searchVolume: m.searchVolume, difficulty: m.difficulty, cpc: m.cpc } });
        }
      }

      // Opportunity scores require measured demand and difficulty. Seed
      // relevance alone is never presented as third-party SEO data.
      if (volume == null || difficulty == null) continue;

      const score = opportunityScore({
        searchVolume: volume,
        difficulty,
        relevance: seed.relevance,
        productFit: seed.productFit,
        freshnessPotential: seed.freshness,
        internalLinkPotential: seed.linkPotential,
        competitionFactor: seed.intent === "HISTORICAL" ? 0.4 : 0.7,
      });
      const bucket = priorityBucket(score);
      await prisma.seoOpportunity.upsert({
        where: { keywordId: kw.id },
        update: { score, status: "NEW", targetUrl: seed.targetUrl, rationale: `Cluster ${seed.cluster}; intent ${seed.intent}` },
        create: { keywordId: kw.id, score, status: "NEW", targetUrl: seed.targetUrl, rationale: `Cluster ${seed.cluster}; intent ${seed.intent}` },
      });
      await prisma.seoKeyword.update({ where: { id: kw.id }, data: { priority: bucket as SeoKeywordPriority } });
      scored++;
    }
    return { researched, scored, unitsUsed: c?.unitsSpent ?? 0 };
  }

  /** 3) Record the app's real page inventory for technical audits. */
  async recordPages(pages: { path: string; title?: string; h1?: string; wordCount?: number }[]): Promise<number> {
    let n = 0;
    for (const p of pages) {
      await prisma.seoPage.upsert({
        where: { path: p.path },
        update: { title: p.title, h1: p.h1, wordCount: p.wordCount, lastAudited: new Date() },
        create: { path: p.path, title: p.title, h1: p.h1, wordCount: p.wordCount, lastAudited: new Date() },
      });
      n++;
    }
    return n;
  }

  /** Crawl a bounded canonical page set and persist only observed technical signals. */
  async auditPages(baseUrl: string, paths: readonly string[] = CORE_PUBLIC_PATHS): Promise<{ audited: number; issues: number }> {
    const origin = new URL(baseUrl).origin;
    let issuesFound = 0;
    for (const path of paths) {
      const url = new URL(path, origin);
      let statusCode = 0;
      let title: string | undefined;
      let metaDescription: string | undefined;
      let h1: string | undefined;
      let canonical: string | undefined;
      let wordCount = 0;
      let indexable = false;
      const issues: string[] = [];
      try {
        const response = await fetch(url, {
          headers: { "User-Agent": "SuperbowlGG-TechnicalSEO/2.0" },
          redirect: "manual",
          signal: AbortSignal.timeout(10_000),
        });
        statusCode = response.status;
        const html = (response.headers.get("content-type") ?? "").includes("text/html") ? await response.text() : "";
        title = capture(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
        metaDescription = capture(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["'][^>]*>/i)
          ?? capture(html, /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["'][^>]*>/i);
        h1 = capture(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i);
        canonical = /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["'][^>]*>/i.exec(html)?.[1]
          ?? /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["'][^>]*>/i.exec(html)?.[1];
        const robots = /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)["'][^>]*>/i.exec(html)?.[1]?.toLowerCase() ?? "";
        indexable = statusCode === 200 && !robots.includes("noindex");
        wordCount = (htmlText(html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ")) ?? "").split(/\s+/).filter(Boolean).length;
        if (statusCode !== 200) issues.push(`HTTP_${statusCode}`);
        if (!title) issues.push("MISSING_TITLE");
        if (!metaDescription) issues.push("MISSING_META_DESCRIPTION");
        if (!h1) issues.push("MISSING_H1");
        if (!canonical) issues.push("MISSING_CANONICAL");
      } catch (error) {
        issues.push(error instanceof Error && error.name === "TimeoutError" ? "REQUEST_TIMEOUT" : "REQUEST_FAILED");
      }
      issuesFound += issues.length;
      await prisma.seoPage.upsert({
        where: { path },
        update: { title, metaDescription, h1, canonical, statusCode, indexable, wordCount, issues, lastAudited: new Date() },
        create: { path, title, metaDescription, h1, canonical, statusCode, indexable, wordCount, issues, lastAudited: new Date() },
      });
    }
    return { audited: paths.length, issues: issuesFound };
  }
}
