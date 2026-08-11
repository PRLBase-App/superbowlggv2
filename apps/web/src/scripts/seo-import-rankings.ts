import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { prisma } from "@sbgg/db";
import { importSemrushRankings, parseSemrushKeywordMarkdown } from "@sbgg/seo";

async function main(): Promise<void> {
  const sourcePath = resolve(process.argv[2] ?? resolve(process.cwd(), "../../keyword.md"));
  const source = await readFile(sourcePath, "utf8");
  const rows = parseSemrushKeywordMarkdown(source);
  const result = await importSemrushRankings(rows, { sourceFile: "keyword.md" });
  console.info(`[seo] imported ${result.rowsImported} observations as ${result.localizedKeywords} localized keywords (${result.databases.join(", ")}); 0 API units used`);
}

main()
  .catch((error) => {
    console.error(`[seo] ranking import failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
