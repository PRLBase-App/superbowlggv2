export interface ArticleSource {
  title: string;
  url: string;
}

const wordsPerMinute = 220;

export function articleWordCount(body: string): number {
  return body.match(/[\p{L}\p{N}]+(?:['’.-][\p{L}\p{N}]+)*/gu)?.length ?? 0;
}

export function articleReadingMinutes(body: string): number {
  return Math.max(1, Math.ceil(articleWordCount(body) / wordsPerMinute));
}

export function articleSources(value: unknown): ArticleSource[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((source) => {
    if (!source || Array.isArray(source) || typeof source !== "object") return [];
    const record = source as Record<string, unknown>;
    const title = record.title;
    const url = record.url;
    if (typeof title !== "string" || typeof url !== "string") return [];
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return [];
    } catch {
      return [];
    }
    return [{ title, url }];
  });
}

export function articleHeadings(body: string): { id: string; label: string }[] {
  const used = new Map<string, number>();
  return body.split("\n").flatMap((line) => {
    const match = /^##\s+(.+?)\s*$/.exec(line);
    if (!match) return [];
    const label = match[1]!.replace(/[*_`]/g, "").trim();
    const base = slugify(label) || "section";
    const count = used.get(base) ?? 0;
    used.set(base, count + 1);
    return [{ id: count ? `${base}-${count + 1}` : base, label }];
  });
}

export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

export function safeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
