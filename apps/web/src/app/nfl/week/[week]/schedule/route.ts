import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: Promise<{ week: string }> }) {
  const { week } = await params;
  return NextResponse.redirect(new URL(`/nfl/week/${encodeURIComponent(week)}`, request.url), 301);
}
