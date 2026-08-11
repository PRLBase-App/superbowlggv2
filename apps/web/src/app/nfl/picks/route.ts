import { permanentRedirect } from "@/lib/permanent-redirect";
export function GET(request: Request) { return permanentRedirect(request, "/nfl/predictions"); }
