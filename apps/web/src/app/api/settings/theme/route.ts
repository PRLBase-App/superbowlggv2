import { NextResponse } from "next/server";
import { prisma } from "@sbgg/db";
import { getSession } from "@/lib/session";
import { themePreferenceSchema } from "@/lib/theme";

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Not authenticated", code: "AUTH_REQUIRED" }, { status: 401 });
  const parsed = themePreferenceSchema.safeParse((await request.json().catch(() => null) as { theme?: unknown } | null)?.theme);
  if (!parsed.success) return NextResponse.json({ error: "Theme must be LIGHT, DARK or SYSTEM", code: "INVALID_THEME" }, { status: 400 });
  await prisma.user.update({ where: { id: session.user.id }, data: { themePreference: parsed.data } });
  return NextResponse.json({ ok: true, theme: parsed.data });
}
