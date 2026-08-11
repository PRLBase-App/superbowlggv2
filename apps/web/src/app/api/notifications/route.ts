import { NextResponse } from "next/server";
import { prisma } from "@sbgg/db";
import { getSession } from "@/lib/session";

/** Mark notifications read (one or all). */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const { id, all } = body as { id?: string; all?: boolean };
  if (all) {
    await prisma.notification.updateMany({ where: { userId: session.user.id, read: false }, data: { read: true } });
  } else if (id) {
    await prisma.notification.updateMany({ where: { id, userId: session.user.id }, data: { read: true } });
  }
  return NextResponse.json({ ok: true });
}
