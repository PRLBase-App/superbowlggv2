import { publicUrl } from "@/lib/permanent-redirect";
import { NextResponse } from "next/server";

export async function GET(_request: Request, { params }: { params: Promise<{ week: string }> }) {
  const { week } = await params;
  return NextResponse.redirect(publicUrl(`/nfl/week/${encodeURIComponent(week)}`), 301);
}
