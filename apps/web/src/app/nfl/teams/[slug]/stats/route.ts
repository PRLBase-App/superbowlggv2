import { publicUrl } from "@/lib/permanent-redirect";
import { NextResponse } from "next/server";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return NextResponse.redirect(publicUrl(`/nfl/teams/${encodeURIComponent(slug)}`), 301);
}
