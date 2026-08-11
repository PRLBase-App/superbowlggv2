import { permanentRedirect } from "@/lib/permanent-redirect";

const sections = new Set(["overview", "rankings", "keywords", "opportunities", "pages", "redirects", "technical", "semrush"]);

export async function GET(request: Request, { params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  return permanentRedirect(request, sections.has(section) ? "/admin/seo" : "/admin");
}
