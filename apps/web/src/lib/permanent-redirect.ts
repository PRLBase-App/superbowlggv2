import { NextResponse } from "next/server";

export function permanentRedirect(request: Request, pathname: string): NextResponse {
  return NextResponse.redirect(new URL(pathname, request.url), 301);
}
