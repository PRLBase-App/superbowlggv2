import { z } from "zod";

const httpUrl = z.string().trim().url().refine((value) => {
  try {
    const protocol = new URL(value).protocol;
    return protocol === "https:" || protocol === "http:";
  } catch {
    return false;
  }
}, "Use an HTTP or HTTPS URL");

export const articleInputSchema = z.object({
  authorId: z.string().trim().min(1),
  title: z.string().trim().min(10).max(140),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).min(3).max(100),
  excerpt: z.string().trim().min(40).max(320),
  body: z.string().trim().min(400).max(100_000),
  category: z.string().trim().min(2).max(60),
  tags: z.array(z.string().trim().min(1).max(50)).max(20),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  featured: z.boolean(),
  heroImageUrl: z.union([httpUrl, z.literal("")]).optional(),
  heroImageAlt: z.string().trim().max(180).optional(),
  seoTitle: z.string().trim().max(70).optional(),
  seoDescription: z.string().trim().max(170).optional(),
  sourceLinks: z.array(z.object({ title: z.string().trim().min(2).max(160), url: httpUrl })).max(20),
}).superRefine((value, context) => {
  if (value.status === "PUBLISHED" && value.sourceLinks.length === 0) {
    context.addIssue({ code: "custom", path: ["sourceLinks"], message: "A published article needs at least one identifiable source" });
  }
  if (value.heroImageUrl && !value.heroImageAlt) {
    context.addIssue({ code: "custom", path: ["heroImageAlt"], message: "Alternative text is required when a hero image is used" });
  }
});

export type ArticleInput = z.infer<typeof articleInputSchema>;
