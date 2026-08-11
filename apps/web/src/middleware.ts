import { brand } from "@sbgg/core";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const publicHost = (request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "")
    .split(":", 1)[0]
    .toLowerCase();
  if (publicHost === `www.${brand.domain}`) {
    return NextResponse.redirect(
      new URL(`${request.nextUrl.pathname}${request.nextUrl.search}`, `https://${brand.domain}`),
      301,
    );
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-sbgg-pathname", request.nextUrl.pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
