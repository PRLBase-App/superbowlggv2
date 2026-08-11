import { env } from "@sbgg/core";
import { NextResponse } from "next/server";

/** Build internal redirects from the validated public origin, not a proxy's internal request URL. */
export function publicUrl(pathname: string): URL {
  return new URL(pathname, env().APP_URL);
}

export function permanentRedirect(_request: Request, pathname: string): NextResponse {
  return NextResponse.redirect(publicUrl(pathname), 301);
}
