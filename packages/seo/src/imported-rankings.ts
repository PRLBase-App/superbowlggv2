import { createHash } from "node:crypto";
import { Prisma, prisma } from "@sbgg/db";

const REGIONAL_DATABASES = {
  US: { database: "us", country: "United States" },
  Canada: { database: "ca", country: "Canada" },
  Mexico: { database: "mx", country: "Mexico" },
} as const;

type RegionLabel = keyof typeof REGIONAL_DATABASES;

export interface ImportedSemrushRanking {
  database: string;
  country: string;
  keyword: string;
  intents: string[];
  position: number;
  traffic: number;
  trafficShare: string;
  searchVolume: number;
  difficulty: number | null;
  url: string;
  reportedDateLabel?: string;
}

export interface SemrushRankingImportResult {
  rowsImported: number;
  localizedKeywords: number;
  databases: string[];
}

function requiredInteger(value: string | undefined, field: string, keyword: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) throw new Error(`Invalid ${field} for keyword "${keyword}"`);
  return parsed;
}

function requiredNumber(value: string | undefined, field: string, keyword: string): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) throw new Error(`Invalid ${field} for keyword "${keyword}"`);
  return parsed;
}

function normalizedUrl(value: string | undefined, keyword: string): string {
  if (!value) throw new Error(`Missing URL for keyword "${keyword}"`);
  try {
    return new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`).toString();
  } catch {
    throw new Error(`Invalid URL for keyword "${keyword}"`);
  }
}

function parseBlock(block: string, region: RegionLabel): ImportedSemrushRanking {
  const lines = block.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const keyword = lines[0];
  if (!keyword) throw new Error(`Empty keyword block in ${region}`);

  const positionIndex = lines.findIndex((line, index) => index > 0 && /^\d+$/.test(line));
  if (positionIndex < 2) throw new Error(`Missing intent or position for keyword "${keyword}"`);
  const intents = lines.slice(1, positionIndex);
  if (intents.some((intent) => !/^[A-Z]$/.test(intent))) {
    throw new Error(`Invalid SEMrush intent code for keyword "${keyword}"`);
  }

  const position = requiredInteger(lines[positionIndex], "position", keyword);
  const traffic = requiredNumber(lines[positionIndex + 1], "traffic", keyword);
  const trafficShare = lines[positionIndex + 2];
  if (!trafficShare) throw new Error(`Missing traffic share for keyword "${keyword}"`);
  const searchVolume = requiredInteger(lines[positionIndex + 3], "search volume", keyword);
  const difficultyRaw = lines[positionIndex + 4];
  const difficulty = difficultyRaw?.toLowerCase() === "n/a"
    ? null
    : requiredInteger(difficultyRaw, "difficulty", keyword);
  const url = normalizedUrl(lines[positionIndex + 5], keyword);
  const reportedDateLabel = lines.slice(positionIndex + 6).join(" ") || undefined;
  const regional = REGIONAL_DATABASES[region];

  return {
    database: regional.database,
    country: regional.country,
    keyword,
    intents,
    position,
    traffic,
    trafficShare,
    searchVolume,
    difficulty,
    url,
    reportedDateLabel,
  };
}

/** Parse the compact SEMrush copy/paste format used by keyword.md. */
export function parseSemrushKeywordMarkdown(source: string): ImportedSemrushRanking[] {
  const heading = /^(US|Canada|Mexico) Keywords:\s*$/gm;
  const matches = [...source.matchAll(heading)];
  if (matches.length === 0) throw new Error("No supported regional keyword sections found");

  const rows: ImportedSemrushRanking[] = [];
  for (const [index, match] of matches.entries()) {
    const region = match[1] as RegionLabel;
    const start = (match.index ?? 0) + match[0].length;
    const end = matches[index + 1]?.index ?? source.length;
    const blocks = source.slice(start, end).trim().split(/\r?\n\s*\r?\n+/).filter(Boolean);
    for (const block of blocks) rows.push(parseBlock(block, region));
  }
  return rows;
}

function groupKey(row: ImportedSemrushRanking): string {
  return `${row.database}\u0000${row.keyword.toLowerCase()}`;
}

/** The best supplied position is the current aggregate; all rows remain snapshots. */
export function selectCurrentImportedRankings(rows: ImportedSemrushRanking[]): Map<string, ImportedSemrushRanking> {
  const current = new Map<string, ImportedSemrushRanking>();
  for (const row of rows) {
    const key = groupKey(row);
    const existing = current.get(key);
    if (!existing || row.position < existing.position) current.set(key, row);
  }
  return current;
}

function snapshotSourceKey(row: ImportedSemrushRanking): string {
  return createHash("sha256").update(JSON.stringify({
    database: row.database,
    keyword: row.keyword.toLowerCase(),
    position: row.position,
    traffic: row.traffic,
    trafficShare: row.trafficShare,
    searchVolume: row.searchVolume,
    difficulty: row.difficulty,
    url: row.url,
    reportedDateLabel: row.reportedDateLabel ?? null,
  })).digest("hex");
}

/** Persist user-provided SEMrush observations without making any API request. */
export async function importSemrushRankings(
  rows: ImportedSemrushRanking[],
  options: { sourceFile?: string; importedAt?: Date } = {},
): Promise<SemrushRankingImportResult> {
  if (rows.length === 0) throw new Error("The SEMrush import contains no rankings");
  const sourceFile = options.sourceFile ?? "keyword.md";
  const importedAt = options.importedAt ?? new Date();
  const current = selectCurrentImportedRankings(rows);
  const groups = new Map<string, ImportedSemrushRanking[]>();
  for (const row of rows) groups.set(groupKey(row), [...(groups.get(groupKey(row)) ?? []), row]);
  const run = await prisma.seoResearchRun.create({
    data: { runType: "IMPORTED_RANKINGS", status: "RUNNING", unitsUsed: 0, metadata: { sourceFile } },
  });

  try {
    for (const [key, observations] of groups) {
      const selected = current.get(key)!;
      const intents = [...new Set(observations.flatMap((row) => row.intents))].sort();
      const keyword = await prisma.seoKeyword.upsert({
        where: { keyword_database: { keyword: selected.keyword, database: selected.database } },
        update: {
          semrushIntents: intents,
          searchVolume: selected.searchVolume,
          difficulty: selected.difficulty,
          currentPosition: selected.position,
          currentUrl: selected.url,
          source: "SEMRUSH_IMPORT",
          status: "RANKING",
          lastRefreshed: importedAt,
        },
        create: {
          keyword: selected.keyword,
          database: selected.database,
          semrushIntents: intents,
          cluster: "existing",
          searchVolume: selected.searchVolume,
          difficulty: selected.difficulty,
          currentPosition: selected.position,
          currentUrl: selected.url,
          source: "SEMRUSH_IMPORT",
          status: "RANKING",
          lastRefreshed: importedAt,
        },
      });

      await prisma.$transaction([
        prisma.seoKeywordSnapshot.updateMany({
          where: { keywordId: keyword.id, isCurrent: true },
          data: { isCurrent: false },
        }),
        ...observations.map((observation) => {
          const metadata = {
            country: observation.country,
            sourceFile,
            ...(observation.reportedDateLabel ? { reportedDateLabel: observation.reportedDateLabel } : {}),
          } as Prisma.InputJsonValue;
          const data = {
            keywordId: keyword.id,
            searchVolume: observation.searchVolume,
            difficulty: observation.difficulty,
            position: observation.position,
            traffic: observation.traffic,
            trafficShare: observation.trafficShare,
            source: "SEMRUSH_IMPORT",
            isCurrent: observation === selected,
            metadata,
          };
          return prisma.seoKeywordSnapshot.upsert({
            where: { sourceKey: snapshotSourceKey(observation) },
            update: data,
            create: { ...data, sourceKey: snapshotSourceKey(observation), capturedAt: importedAt },
          });
        }),
      ]);
    }

    const result = {
      rowsImported: rows.length,
      localizedKeywords: groups.size,
      databases: [...new Set(rows.map((row) => row.database))].sort(),
    };
    await prisma.seoResearchRun.update({
      where: { id: run.id },
      data: {
        status: "SUCCESS",
        keywordsFound: result.localizedKeywords,
        finishedAt: new Date(),
        metadata: { sourceFile, rowsImported: result.rowsImported, databases: result.databases },
      },
    });
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await prisma.seoResearchRun.update({
      where: { id: run.id },
      data: { status: "FAILED", error: message.slice(0, 2_000), finishedAt: new Date() },
    });
    throw error;
  }
}
