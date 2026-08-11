import { env } from "@sbgg/core";
import { createHash } from "node:crypto";
import { Prisma, prisma } from "@sbgg/db";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

/**
 * SEMrush MCP client — streamable HTTP JSON-RPC (https://mcp.semrush.com/v2/mcp).
 * Auth: `Authorization: Apikey <SEMRUSH_API_KEY>`. The key is server-side only.
 *
 * Units are metered: every call checks SEMRUSH_MAX_UNITS_PER_RUN and results
 * are cached (SEMRUSH_CACHE_DAYS) so repeated research never burns credits.
 */

export interface SemrushDomainOverview {
  domain: string;
  rank?: number;
  organicKeywords?: number;
  organicTraffic?: number;
  organicCost?: number;
  adwordsKeywords?: number;
  adwordsTraffic?: number;
}

export interface SemrushKeywordMetrics {
  keyword: string;
  searchVolume?: number;
  difficulty?: number;
  cpc?: number;
  competition?: number;
  resultsCount?: number;
  intent?: string;
}

export interface SemrushOrganicRow {
  keyword: string;
  position?: number;
  previousPosition?: number;
  searchVolume?: number;
  traffic?: number;
  url?: string;
  intent?: string;
}

export interface SemrushMCPTool {
  name: string;
  description?: string;
  inputSchema?: unknown;
}

function asRows(value: unknown): Record<string, unknown>[] {
  if (typeof value === "string") {
    const trimmed = value.trim().replace(/^```(?:json|csv)?\s*/i, "").replace(/\s*```$/, "");
    try {
      return asRows(JSON.parse(trimmed) as unknown);
    } catch {
      const lines = trimmed.split(/\r?\n/).filter(Boolean);
      if (lines.length < 2) return [];
      const headerLine = lines[0]!;
      const separator = headerLine.includes(";") ? ";" : ",";
      const headers = headerLine.split(separator).map((header) => header.trim());
      return lines.slice(1).map((line) => Object.fromEntries(line.split(separator).map((cell, index) => [headers[index], cell.trim()])));
    }
  }
  if (Array.isArray(value)) return value.filter((row): row is Record<string, unknown> => !!row && typeof row === "object");
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    for (const key of ["rows", "data", "results", "items"]) {
      if (record[key] !== undefined) return asRows(record[key]);
    }
    return [record];
  }
  return [];
}

function field(row: Record<string, unknown>, aliases: string[]): unknown {
  const normalizedAliases = aliases.map((alias) => alias.toLowerCase().replace(/[^a-z0-9]/g, ""));
  for (const [key, value] of Object.entries(row)) {
    if (normalizedAliases.includes(key.toLowerCase().replace(/[^a-z0-9]/g, ""))) return value;
  }
  return undefined;
}

function numeric(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.replace(/,/g, ""));
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

function text(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export class SemrushMcpClient {
  readonly name = "semrush-mcp";
  private unitsUsed = 0;
  private client: Client | null = null;
  private transport: StreamableHTTPClientTransport | null = null;
  private connecting: Promise<Client> | null = null;

  constructor(
    private apiKey: string,
    private endpoint = "https://mcp.semrush.com/v2/mcp",
    private maxUnits = 500,
    private cacheDays = 30,
  ) {}

  get unitsSpent(): number {
    return this.unitsUsed;
  }

  private cacheKey(parts: string[]): string {
    return createHash("sha256").update(parts.join("::")).digest("hex");
  }

  private async cached<T>(key: string): Promise<T | null> {
    const hit = await prisma.seoApiCache.findUnique({ where: { cacheKey: key } });
    if (!hit || hit.expiresAt <= new Date()) return null;
    return hit.payload as T;
  }

  private async connected(): Promise<Client> {
    if (this.client) return this.client;
    if (!this.connecting) {
      this.connecting = (async () => {
        const transport = new StreamableHTTPClientTransport(new URL(this.endpoint), {
          requestInit: {
            headers: { Authorization: `Apikey ${this.apiKey}` },
          },
          reconnectionOptions: {
            initialReconnectionDelay: 500,
            maxReconnectionDelay: 2_000,
            reconnectionDelayGrowFactor: 1.5,
            maxRetries: 1,
          },
        });
        const client = new Client({ name: "superbowl-gg-seo", version: "2.0.0" }, { capabilities: {} });
        await client.connect(transport);
        this.transport = transport;
        this.client = client;
        return client;
      })().finally(() => {
        this.connecting = null;
      });
    }
    return this.connecting;
  }

  async listTools(): Promise<SemrushMCPTool[]> {
    const result = await (await this.connected()).listTools(undefined, { timeout: 30_000 });
    return result.tools.map((tool) => ({ name: tool.name, description: tool.description, inputSchema: tool.inputSchema }));
  }

  /**
   * Call a research tool. Cached by (tool, args); returns null when the
   * account is out of units (so callers can fall back gracefully).
   */
  async callResearch<T>(tool: string, args: Record<string, unknown>): Promise<T | null> {
    const key = this.cacheKey([tool, JSON.stringify(args)]);
    const hit = await this.cached<T>(key);
    if (hit !== null) return hit;

    if (this.unitsUsed >= this.maxUnits) {
      console.warn(`[seo] unit budget exhausted (${this.maxUnits}) — skipping ${tool}`);
      return null;
    }

    const r = await (await this.connected()).callTool({ name: tool, arguments: args }, undefined, { timeout: 30_000 });
    this.unitsUsed++;
    const structured = "structuredContent" in r ? r.structuredContent : undefined;
    const content = Array.isArray(r.content) ? r.content : [];
    const textContent = content.find((item) => {
      if (!item || typeof item !== "object") return false;
      const block = item as Record<string, unknown>;
      return block.type === "text" && typeof block.text === "string";
    }) as { type: "text"; text: string } | undefined;
    const responseText = textContent?.text;
    if (r.isError || (structured == null && responseText == null)) {
      if (responseText && /not enough API units/i.test(responseText)) {
        console.warn("[seo] SEMrush units exhausted — further research disabled");
        this.unitsUsed = this.maxUnits; // lock
      }
      return null;
    }
    let data: T = structured as T;
    if (structured == null && responseText != null) {
      try {
        data = JSON.parse(responseText) as T;
      } catch {
        data = responseText as unknown as T;
      }
    }
    if (data == null) return null;
    const now = new Date();
    await prisma.seoApiCache.upsert({
      where: { cacheKey: key },
      update: {
        tool,
        payload: data as Prisma.InputJsonValue,
        capturedAt: now,
        expiresAt: new Date(now.getTime() + this.cacheDays * 86_400_000),
      },
      create: {
        cacheKey: key,
        tool,
        payload: data as Prisma.InputJsonValue,
        capturedAt: now,
        expiresAt: new Date(now.getTime() + this.cacheDays * 86_400_000),
      },
    });
    return data;
  }

  private async executeReport(reportGroup: "domain_overview" | "organic_research" | "keyword_research", report: string, params: Record<string, unknown>): Promise<unknown | null> {
    const discovery = await this.callResearch<unknown>(reportGroup, {});
    if (discovery == null) return null;
    const available = typeof discovery === "string" ? discovery : JSON.stringify(discovery);
    if (!available.toLowerCase().includes(report.toLowerCase())) {
      console.warn(`[seo] SEMrush report ${report} is unavailable for this subscription`);
      return null;
    }
    const schema = await this.callResearch<unknown>("get_report_schema", { report });
    if (schema == null) return null;
    return this.callResearch<unknown>("execute_report", { report, params });
  }

  async close(): Promise<void> {
    await this.transport?.close();
    this.transport = null;
    this.client = null;
  }

  async domainOverview(domain: string): Promise<SemrushDomainOverview | null> {
    const result = await this.executeReport("domain_overview", "domain_ranks", {
      domain,
      database: env().SEMRUSH_DATABASE,
      export_columns: "Dn,Rk,Or,Ot,Oc,Ad,At,Ac",
    });
    const row = asRows(result)[0];
    if (!row) return null;
    return {
      domain: text(field(row, ["domain", "Dn"])) ?? domain,
      rank: numeric(field(row, ["rank", "Rk"])),
      organicKeywords: numeric(field(row, ["organic keywords", "Or"])),
      organicTraffic: numeric(field(row, ["organic traffic", "Ot"])),
      organicCost: numeric(field(row, ["organic cost", "Oc"])),
      adwordsKeywords: numeric(field(row, ["adwords keywords", "Ad"])),
      adwordsTraffic: numeric(field(row, ["adwords traffic", "At"])),
    };
  }

  async organicResearch(domain: string, limit = 100): Promise<SemrushOrganicRow[] | null> {
    const result = await this.executeReport("organic_research", "domain_organic", {
      domain,
      database: env().SEMRUSH_DATABASE,
      display_limit: Math.min(1_000, Math.max(1, limit)),
      display_positions_type: "all",
      export_columns: "Ph,Po,Pp,Nq,Cp,Co,Tr,Ur,In",
    });
    if (result == null) return null;
    return asRows(result).flatMap((row): SemrushOrganicRow[] => {
      const keyword = text(field(row, ["keyword", "Ph"]));
      if (!keyword) return [];
      return [{
        keyword,
        position: numeric(field(row, ["position", "Po"])),
        previousPosition: numeric(field(row, ["previous position", "Pp"])),
        searchVolume: numeric(field(row, ["search volume", "volume", "Nq"])),
        traffic: numeric(field(row, ["traffic", "Tr"])),
        url: text(field(row, ["url", "Ur"])),
        intent: text(field(row, ["intent", "In"])),
      }];
    });
  }

  async keywordResearch(keyword: string): Promise<SemrushKeywordMetrics | null> {
    const result = await this.executeReport("keyword_research", "phrase_this", {
      phrase: keyword,
      database: env().SEMRUSH_DATABASE,
      export_columns: "Ph,Nq,Kd,Cp,Co,Nr,In",
    });
    const row = asRows(result)[0];
    if (!row) return null;
    return {
      keyword: text(field(row, ["keyword", "Ph"])) ?? keyword,
      searchVolume: numeric(field(row, ["search volume", "volume", "Nq"])),
      difficulty: numeric(field(row, ["keyword difficulty", "difficulty", "Kd"])),
      cpc: numeric(field(row, ["cpc", "Cp"])),
      competition: numeric(field(row, ["competition", "Co"])),
      resultsCount: numeric(field(row, ["results", "results count", "Nr"])),
      intent: text(field(row, ["intent", "In"])),
    };
  }
}
