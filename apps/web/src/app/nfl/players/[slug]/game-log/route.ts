import { permanentRedirect } from "@/lib/permanent-redirect";
export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return permanentRedirect(request, `/nfl/players/${encodeURIComponent(slug)}`);
}
