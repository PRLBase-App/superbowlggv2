import { describe, expect, it } from "vitest";
import { editorialSeedArticles } from "../../../../packages/db/prisma/blog-seed";
import { articleHeadings, articleReadingMinutes, articleSources, articleWordCount, slugify } from "@/lib/articles";
import { articleInputSchema } from "@/lib/article-validation";

describe("editorial article helpers", () => {
  it("calculates useful reading metadata", () => {
    const body = Array.from({ length: 441 }, (_, index) => `word${index}`).join(" ");
    expect(articleWordCount(body)).toBe(441);
    expect(articleReadingMinutes(body)).toBe(3);
    expect(articleReadingMinutes("")).toBe(1);
  });

  it("creates stable heading anchors and handles duplicates", () => {
    expect(articleHeadings("## First Section\ntext\n## First Section")).toEqual([
      { id: "first-section", label: "First Section" },
      { id: "first-section-2", label: "First Section" },
    ]);
    expect(slugify("NFL Spread vs. Moneyline")).toBe("nfl-spread-vs-moneyline");
  });

  it("keeps only identifiable HTTP sources", () => {
    expect(articleSources([
      { title: "NFL", url: "https://www.nfl.com/schedules/2026/by-team" },
      { title: "Unsafe", url: "javascript:alert(1)" },
      { title: 12, url: "https://example.com" },
    ])).toEqual([{ title: "NFL", url: "https://www.nfl.com/schedules/2026/by-team" }]);
  });
});

describe("article publishing validation", () => {
  const valid = {
    authorId: "author-id",
    title: "A complete NFL article title",
    slug: "complete-nfl-article",
    excerpt: "A complete explanatory excerpt with enough useful detail for the reader.",
    body: "A".repeat(500),
    category: "Season Guide",
    tags: ["NFL"],
    status: "PUBLISHED" as const,
    featured: false,
    heroImageUrl: "",
    heroImageAlt: "",
    seoTitle: "",
    seoDescription: "",
    sourceLinks: [{ title: "Official NFL schedule", url: "https://www.nfl.com/schedules/2026/by-team" }],
  };

  it("requires a source before publication but permits source-free drafts", () => {
    expect(articleInputSchema.safeParse({ ...valid, sourceLinks: [] }).success).toBe(false);
    expect(articleInputSchema.safeParse({ ...valid, status: "DRAFT", sourceLinks: [] }).success).toBe(true);
  });

  it("requires alternative text with a hero image", () => {
    expect(articleInputSchema.safeParse({ ...valid, heroImageUrl: "https://example.com/hero.jpg" }).success).toBe(false);
    expect(articleInputSchema.safeParse({ ...valid, heroImageUrl: "https://example.com/hero.jpg", heroImageAlt: "Players line up before the snap" }).success).toBe(true);
  });
});

describe("launch editorial library", () => {
  it("contains eight unique, substantial, sourced articles", () => {
    expect(editorialSeedArticles).toHaveLength(8);
    expect(new Set(editorialSeedArticles.map((article) => article.slug)).size).toBe(8);
    for (const article of editorialSeedArticles) {
      expect(articleWordCount(article.body), article.slug).toBeGreaterThanOrEqual(700);
      expect(article.sourceLinks.length, article.slug).toBeGreaterThan(0);
      expect(article.sourceLinks.every((source) => /^https?:\/\//.test(source.url)), article.slug).toBe(true);
      expect(article.body.toLowerCase(), article.slug).not.toContain("lorem ipsum");
    }
  });
});
