import { publicUrl } from "@/lib/permanent-redirect";
import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.redirect(publicUrl("/games"), 307);
}
